import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as signalR from "@microsoft/signalr";
import { message } from "antd";
import type { RootState, AppDispatch } from "@/store/store";
import {
  addJob,
  updateJob,
  markViewed,
  cleanupOldJobs,
  QuizJob,
} from "@/store/quizJobSlice";
import { QuizJobContext } from "./QuizJobContextValue";
import useGetProcessingJobs from "@/hooks/quizJobHook/useGetProcessingJobs";
import useGetRecentJobs from "@/hooks/quizJobHook/useGetRecentJobs";
import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector";
import { selectRole } from "@/store/authSlice";

interface ProviderProps {
  children: ReactNode;
  hubUrl?: string;
  getAccessToken?: () => string | null;
}

const API_BASE = import.meta.env.VITE_API_URL_BASIC;
const STORAGE_KEY = "studynest_quiz_jobs_cache";

const saveJobsToCache = (jobs: QuizJob[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  } catch (error) {
    console.error("Failed to save jobs to cache:", error);
  }
};

const loadJobsFromCache = (): QuizJob[] => {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (!cached) return [];

    const jobs: QuizJob[] = JSON.parse(cached);

    // Filter out old jobs (older than 1 hour)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    return jobs.filter((job) => job.createdAt > oneHourAgo);
  } catch (error) {
    console.error("Failed to load jobs from cache:", error);
    return [];
  }
};

export const QuizJobProvider = ({
  children,
  hubUrl,
  getAccessToken,
}: ProviderProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const jobs = useSelector((s: RootState) => s.quizJob);
  const unreadCount = useMemo(
    () => jobs.filter((j) => !j.isViewed).length,
    [jobs]
  );

  const connRef = useRef<signalR.HubConnection | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected" | "reconnecting"
  >("disconnected");
  const [lastDisconnectTime, setLastDisconnectTime] = useState<number | null>(
    null
  );
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const role = useReduxSelector(selectRole);

  // Get access token
  const accessToken = useMemo(() =>
    getAccessToken ? getAccessToken() : localStorage.getItem("accessToken"),
    [getAccessToken]
  );

  // Determine if we should fetch data
  const shouldFetchData = useMemo(() =>
    Boolean(role && accessToken),
    [role, accessToken]
  );

  useEffect(() => {
    // Only load from cache if we have authentication
    if (!shouldFetchData) {
      setIsInitialLoad(false);
      return;
    }

    const cachedJobs = loadJobsFromCache();
    if (cachedJobs.length > 0) {
      console.log(`Loaded ${cachedJobs.length} jobs from cache (instant)`);
      cachedJobs.forEach((job) => {
        dispatch(addJob(job));
      });
    }
    setIsInitialLoad(false);
  }, [dispatch, shouldFetchData]);

  // Only fetch processing jobs when authenticated
  const { data: processingJobs } =
    useGetProcessingJobs({
      enabled: !isInitialLoad && shouldFetchData,
      refetchInterval: false,
    });

  // Only fetch recent jobs when authenticated
  const { data: recentJobs, refetch: refetchRecent } = useGetRecentJobs({
    enabled: false, // Only fetch manually on reconnect
    sinceEpochMs: lastDisconnectTime ?? Date.now(),
  });

  useEffect(() => {
    if (processingJobs && processingJobs.length > 0) {
      console.log(`Fetched ${processingJobs.length} fresh jobs from API`);
      processingJobs.forEach((job) => {
        dispatch(addJob(job));
      });
    }
  }, [processingJobs, dispatch]);

  useEffect(() => {
    if (recentJobs && recentJobs.length > 0) {
      console.log(`Syncing ${recentJobs.length} recent jobs to Redux`);
      recentJobs.forEach((job) => {
        if (job.status !== "processing") {
          dispatch(updateJob({ jobId: job.jobId, updates: job }));
        } else {
          dispatch(addJob(job));
        }
      });
    }
  }, [recentJobs, dispatch]);

  useEffect(() => {
    if (!isInitialLoad && jobs.length > 0 && shouldFetchData) {
      saveJobsToCache(jobs);
    }
  }, [jobs, isInitialLoad, shouldFetchData]);

  useEffect(() => {
    const resolvedHubUrl =
      hubUrl ?? (API_BASE ? `${API_BASE.replace(/\/+$/, "")}/hub/quiz-create` : "/hub/quiz-create");

    const tokenFactory = () => accessToken ?? "";

    // Early return if no role or no token
    if (!shouldFetchData || !resolvedHubUrl) {
      return;
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(resolvedHubUrl, { accessTokenFactory: tokenFactory })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          const delays = [0, 2000, 5000, 10000];
          return delays[Math.min(retryContext.previousRetryCount, delays.length - 1)];
        },
      })
      .build();

    type ConnectionWithTimeouts = {
      serverTimeoutInMilliseconds?: number;
      keepAliveIntervalInMilliseconds?: number;
    };

    const connWithTimeouts = connection as unknown as ConnectionWithTimeouts;
    connWithTimeouts.serverTimeoutInMilliseconds = 30_000;
    connWithTimeouts.keepAliveIntervalInMilliseconds = 10_000;

    connection.onreconnecting(() => {
      console.log("SignalR reconnecting...");
      setConnectionStatus("reconnecting");
      setLastDisconnectTime(Date.now());
    });

    connection.onreconnected(async () => {
      console.log("SignalR reconnected, syncing missed updates...");
      setConnectionStatus("connected");
      await refetchRecent();
    });

    connection.onclose(() => {
      console.log("SignalR connection closed");
      setConnectionStatus("disconnected");
    });

    connection.on(
      "CreateStarted",
      (jobId: string, noteTitle: string, timestamp: string) => {
        dispatch(
          addJob({
            jobId,
            noteTitle,
            timestamp,
            status: "processing",
            isViewed: false,
            createdAt: Date.now(),
          })
        );
      }
    );

    connection.on(
      "CreateFinished",
      (jobId: string, success: boolean, quizId?: string, errorMessage?: string) => {
        dispatch(
          updateJob({
            jobId,
            updates: {
              status: success ? "success" : "error",
              quizId,
              errorMessage,
              isViewed: false,
            },
          })
        );

        if (!success && errorMessage) {
          message.error({
            content: `Quiz creation failed: ${errorMessage}`,
            duration: 5,
            style: { fontFamily: "'Courier New', monospace" },
          });
        }

        if (success) {
          message.success({
            content: "Quiz created successfully!",
            duration: 3,
            style: { fontFamily: "'Courier New', monospace" },
          });
        }
      }
    );

    let stopped = false;

    const start = async () => {
      try {
        setConnectionStatus("connecting");
        await connection.start();
        connRef.current = connection;
        setConnectionStatus("connected");
        console.log("QuizJob SignalR connected");
      } catch (err) {
        console.error("QuizJob SignalR start error:", err);
        setConnectionStatus("disconnected");
        if (!stopped) setTimeout(start, 2000);
      }
    };

    start();

    return () => {
      stopped = true;
      connRef.current = null;
      connection.stop().catch(() => {
        /* noop */
      });
    };
  }, [dispatch, hubUrl, accessToken, shouldFetchData, refetchRecent]);

  useEffect(() => {
    // Only cleanup if authenticated
    if (!shouldFetchData) return;

    const id = setInterval(() => {
      dispatch(cleanupOldJobs());

      // Also cleanup localStorage cache
      const currentJobs = loadJobsFromCache();
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      const validJobs = currentJobs.filter((job) => job.createdAt > oneHourAgo);

      if (validJobs.length !== currentJobs.length) {
        saveJobsToCache(validJobs);
      }
    }, 30_000);

    return () => clearInterval(id);
  }, [dispatch, shouldFetchData]);

  const value = useMemo(
    () => ({
      jobs,
      unreadCount,
      markViewed: (jobId: string) => dispatch(markViewed(jobId)),
      connectionStatus,
      isLoading:
        connectionStatus === "connecting" ||
        connectionStatus === "reconnecting",
    }),
    [jobs, unreadCount, dispatch, connectionStatus]
  );

  return (
    <QuizJobContext.Provider value={value}>{children}</QuizJobContext.Provider>
  );
};