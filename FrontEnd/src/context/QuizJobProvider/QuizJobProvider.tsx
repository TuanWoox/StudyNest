import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as signalR from "@microsoft/signalr";
import { App } from "antd";
import { RootState, AppDispatch } from "@/store/store";
import {
  addJob,
  updateJob,
  cleanupOldJobs,
  QuizJob,
} from "@/store/quizJobSlice";
import { QuizJobContext } from "./QuizJobContextValue";
import useGetProcessingJobs from "@/hooks/quizJobHook/useGetProcessingJobs";
import useGetRecentJobs from "@/hooks/quizJobHook/useGetRecentJobs";
import { selectRole } from "@/store/authSlice";

interface ProviderProps {
  children: ReactNode;
  hubUrl?: string;
}

const API_BASE = import.meta.env.VITE_API_URL_BASIC;
const STORAGE_KEY = "studynest_quiz_jobs_cache";

const saveJobsToCache = (jobs: QuizJob[]) => {
  try {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const activeJobs = jobs.filter((job) => job.createdAt > oneHourAgo);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activeJobs));
  } catch (error) {
    console.error("Failed to save jobs to cache:", error);
  }
};

const loadJobsFromCache = (): QuizJob[] => {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (!cached) return [];
    const jobs: QuizJob[] = JSON.parse(cached);
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    return jobs.filter((job) => job.createdAt > oneHourAgo);
  } catch (error) {
    console.error("Failed to load jobs from cache:", error);
    return [];;  }
};

export const QuizJobProvider = ({ children, hubUrl }: ProviderProps) => {
  const { message } = App.useApp();
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
  
  const [lastDisconnectTime, setLastDisconnectTime] = useState<number | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const role = useSelector(selectRole);

  const accessToken = useMemo(() => {
    const token = localStorage.getItem("access_token") || localStorage.getItem("accessToken");
    return token;
  }, []);

  const shouldFetchData = useMemo(() => Boolean(role && accessToken), [role, accessToken]);

  useEffect(() => {
    if (!shouldFetchData) {
      setIsInitialLoad(false);
      return;
    }
    const cachedJobs = loadJobsFromCache();
    if (cachedJobs.length > 0) {
      cachedJobs.forEach((job) => dispatch(addJob(job)));
    }
    setIsInitialLoad(false);
  }, [dispatch, shouldFetchData]);

  const { data: processingJobs } = useGetProcessingJobs({
    enabled: !isInitialLoad && shouldFetchData,
    refetchInterval: false, 
  });

  const { data: recentJobs, refetch: refetchRecent } = useGetRecentJobs({
    enabled: false, 
    sinceEpochMs: lastDisconnectTime ?? Date.now(),
  });

  useEffect(() => {
    if (processingJobs && processingJobs.length > 0) {
      processingJobs.forEach((job) => dispatch(addJob(job)));
    }
  }, [processingJobs, dispatch]);

  useEffect(() => {
    if (recentJobs && recentJobs.length > 0) {
      recentJobs.forEach((job) => {
        if (job.status !== "processing" && job.status !== "queued") {
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
    if (!shouldFetchData || !accessToken) {
      return;
    }

    const baseHubUrl = hubUrl ?? (API_BASE ? `${API_BASE.replace(/\/+$/, "")}/hub/quiz-create` : "/hub/quiz-create");
    const resolvedHubUrl = `${baseHubUrl}?access_token=${encodeURIComponent(accessToken)}`;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(resolvedHubUrl)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (ctx) => [0, 2000, 5000, 10000][Math.min(ctx.previousRetryCount, 3)],
      })
      .build();

    (connection as any).serverTimeoutInMilliseconds = 30_000;
    (connection as any).keepAliveIntervalInMilliseconds = 10_000;

    connection.onreconnecting(() => {
      setConnectionStatus("reconnecting");
      setLastDisconnectTime(Date.now());
    });

    connection.onreconnected(async () => {
      setConnectionStatus("connected");
      await refetchRecent(); 
    });

    connection.onclose(() => {
      setConnectionStatus("disconnected");
    });

    connection.on(
      "CreateStarted",
      (
        jobId: string, 
        noteTitle: string, 
        timestamp: string | Date | { dateTime: string }, 
        status: "queued" | "processing"
      ) => {
        const timestampStr = timestamp instanceof Date 
          ? timestamp.toISOString() 
          : typeof timestamp === 'object' && timestamp !== null
            ? new Date((timestamp as any).dateTime || timestamp).toISOString()
            : String(timestamp);
        
        dispatch(
          addJob({
            jobId,
            noteTitle,
            timestamp: timestampStr,
            status: status,
            isViewed: false,
            createdAt: new Date(timestampStr).getTime(),
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
              status: success ? "success" : "failed",
              quizId,
              errorMessage,
              isViewed: false,
            },
          })
        );

        if (!success && errorMessage) {
          message.error({
            content: `Quiz failed: ${errorMessage}`,
            style: { fontFamily: "'Courier New', monospace" },
          });
        } else if (success) {
          message.success({
            content: "Quiz created successfully!",
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
      } catch (err) {
        setConnectionStatus("disconnected");
        if (!stopped) {
          setTimeout(start, 2000);
        }
      }
    };

    start();

    return () => {
      stopped = true;
      connRef.current = null;
      connection.stop().catch(() => {});
    };
  }, [dispatch, hubUrl, accessToken, shouldFetchData, refetchRecent]);

  useEffect(() => {
    if (!shouldFetchData) return;
    const id = setInterval(() => {
      dispatch(cleanupOldJobs());
    }, 30_000);
    return () => clearInterval(id);
  }, [dispatch, shouldFetchData]);

  const markAsViewed = useCallback((jobId: string) => {
    dispatch(updateJob({ jobId, updates: { isViewed: true } }));
  }, [dispatch]);

  const value = useMemo(
    () => ({
      jobs,
      unreadCount,
      markViewed: markAsViewed,
      connectionStatus,
      isLoading: connectionStatus === "connecting" || connectionStatus === "reconnecting",
    }),
    [jobs, unreadCount, connectionStatus, markAsViewed] 
  );

  return <QuizJobContext.Provider value={value}>{children}</QuizJobContext.Provider>;
};