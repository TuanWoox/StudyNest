import { useHub } from "@/hooks/hubHook/useHub";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { message } from "antd";
import useGetQuizSessionById from "@/hooks/quizSessionHook/useGetQuizSessionById";
import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector";
import { selectUserId } from "@/store/authSlice";
import { toast } from "sonner";
import { ReturnResult } from "@/types/common/return-result";
import { QuizAttemptDTO } from "@/types/quizAttempt/quizAttemptDTO";
import { QuizAttemptSnapshotDTO } from "@/types/quizAttemptSnapshot/quizAttemptSnapshotDTO";
import GamePinEntry from "./components/GamePinEntry";
import WaitingLobby from "./components/WaitingLobby";
import QuizPreparingScreen from "./components/QuizPreparingScreen";
import QuizSessionDisplay from "./components/QuizSessionDisplay";
import { useSubmitAnswerForQuizSession } from "@/hooks/quizAttempt/useSubmitAnswerForQuizSession";
import { useReduxDispatch } from "@/hooks/reduxHook/useReduxDispatch";
import { 
    moveToNextQuestion, 
    selectCurrentQuestion, 
    setQuestions, 
    selectCurrentAnswer,
    selectIsJoined,
    selectPlayers,
    selectIsLoadingPrepare,
    selectQuizAttempt,
    selectSubmitResult,
    setIsJoined,
    setPlayers,
    setIsLoadingPrepare,
    setQuizAttempt,
    setSubmitResult,
    resetState
} from "@/store/quizSessionAtemptSlice";
import useStartQuizSession from "@/hooks/quizSessionHook/useStartQuizSession";

const QuizSessionPlay: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const { connection } = useHub("/hub/quiz-session");
    const { data } = useGetQuizSessionById(sessionId);
    const { submitAnswerAsync, data: submitData, isLoading } = useSubmitAnswerForQuizSession();
    const { startQuizSessionAsync } = useStartQuizSession();
    const userId = useReduxSelector(selectUserId);
    const dispatch = useReduxDispatch();
    
    // Redux selectors
    const isJoined = useReduxSelector(selectIsJoined);
    const players = useReduxSelector(selectPlayers);
    const isLoadingPrepare = useReduxSelector(selectIsLoadingPrepare);
    const quizAttempt = useReduxSelector(selectQuizAttempt);
    const currentQuestion = useReduxSelector(selectCurrentQuestion);
    const currentAnswer = useReduxSelector(selectCurrentAnswer);
    
    const isHost = data?.ownerId === userId;

    const handleJoinSession = useCallback(async (inputPin: string | undefined) => {
        if (!connection || !sessionId || !inputPin) return;
        try {
            const result = await connection.invoke<ReturnResult<string[]>>("JoinQuizSession", {
                id: sessionId,
                gamePin: inputPin
            });
            if (result.result) {
                dispatch(setIsJoined(true));
                dispatch(setPlayers(result.result));
            } else {
                toast.error(result.message || "Failed to join the session");
            }
        } catch (error) {
            console.error("Join session error:", error);
            toast.error("An error occurred while joining the session");
        }
    }, [connection, sessionId, dispatch]);

    const handleStart = useCallback(async () => {
        if(sessionId) {
            startQuizSessionAsync(sessionId)
        }
    }, [sessionId, startQuizSessionAsync])
    
    const handleLeave = useCallback(async () => {
        if (!connection || !sessionId) return;
        try {
            await connection.invoke("LeaveQuizSession", sessionId);
            toast.success("Left the session");
            navigate(-1); // Go back to previous page
        } catch (error) {
            toast.error("Failed to leave session");
            console.error("Leave session error:", error);
        }
    }, [connection, sessionId, navigate]);

    useEffect(() => {
        if (isHost) {
            handleJoinSession(data?.gamePin);
        }
    }, [isHost, data?.gamePin, handleJoinSession]);

    useEffect(() => {
        if (!connection || !isJoined) return;

        // Handler for when a user joins
        const handleUserJoin = (data: { players: string[] }) => {
            dispatch(setPlayers(data.players));
        };

        // Handler for when a user exits
        const handleUserExit = (data: { players: string[] }) => {
            dispatch(setPlayers(data.players));
        };

        // Handler for loading state during quiz preparation
        const handleLoadingToggle = (data: { loading: boolean }) => {
            dispatch(setIsLoadingPrepare(data.loading));
        };

        // Handler for receiving individual quiz attempt
        const handleQuizAttempt = (data: { quizAttempt: QuizAttemptDTO }) => {
            if (data.quizAttempt) {
                dispatch(setQuizAttempt(data.quizAttempt));
            }
        };

        // Handler for when quiz has started
        const handleQuizStarted = (data: { quizAttemptSnapshot: QuizAttemptSnapshotDTO }) => {
            if (data.quizAttemptSnapshot) {
                dispatch(setQuestions(data.quizAttemptSnapshot.quizQuestionsParsed));
            }
        };

        const handleQuizSubmit = async () => {
            // Submit current answer if exists
            if (currentAnswer && quizAttempt) {
                try {
                    await submitAnswerAsync({
                        ...currentAnswer,
                        quizAttemptId: quizAttempt.id,
                    });
                } catch (error) {
                    console.error("Failed to submit answer:", error);
                }
            }
        }

        const handleMoveToNextQuestion = () => {
            dispatch(setSubmitResult(undefined));
            dispatch(moveToNextQuestion());
        }

        // Register all event listeners
        connection.on('UserJoinQuizSession', handleUserJoin);
        connection.on('UserExitQuizSession', handleUserExit);
        connection.on('QuizToggleLoadingPrepare', handleLoadingToggle);
        connection.on('SendQuizAttempt', handleQuizAttempt);
        connection.on('QuizHasBeenStarted', handleQuizStarted);
        connection.on('SubmitAnswer', handleQuizSubmit);
        connection.on('MoveToNextQuestion', handleMoveToNextQuestion);

        // Cleanup function to remove event listeners
        return () => {
            connection.off('UserJoinQuizSession', handleUserJoin);
            connection.off('UserExitQuizSession', handleUserExit);
            connection.off('QuizToggleLoadingPrepare', handleLoadingToggle);
            connection.off('SendQuizAttempt', handleQuizAttempt);
            connection.off('QuizHasBeenStarted', handleQuizStarted);
            connection.off('SubmitAnswer', handleQuizSubmit);
            connection.off('MoveToNextQuestion', handleMoveToNextQuestion);
        };
    }, [connection, isJoined, quizAttempt, navigate, dispatch, currentAnswer, submitAnswerAsync]);

    useEffect(() => {
        if (submitData) {
            dispatch(setSubmitResult(submitData));
        }
    }, [submitData, dispatch])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            dispatch(resetState());
        };
    }, [dispatch]);

    // Show PIN entry screen if not joined and not host
    if (!isJoined && !(userId === data?.ownerId)) {
        return <GamePinEntry
            onJoinSession={handleJoinSession}
        />;
    }

    // Show loading overlay when preparing quiz
    if (isLoadingPrepare) {
        return <QuizPreparingScreen />;
    }

    // Show quiz display if questions are available
    if (currentQuestion) {
        return <QuizSessionDisplay />;
    }

    return (
        <WaitingLobby
            gamePin={data?.gamePin}
            players={players}
            isHost={isHost}
            onStartGame={handleStart}
            onLeave={handleLeave}
        />
    );
};

export default QuizSessionPlay;
