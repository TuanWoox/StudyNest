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
import QuizSessionResults from "./components/QuizSessionResults";
import QuizSessionClosed from "./components/QuizSessionClosed";
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
    selectQuizSessionAttemptsEnded,
    setIsJoined,
    setPlayers,
    setIsLoadingPrepare,
    setQuizAttempt,
    setSubmitResult,
    setQuizSessionAttemptsEnded,
    resetState
} from "@/store/quizSessionAtemptSlice";
import useStartQuizSession from "@/hooks/quizSessionHook/useStartQuizSession";
import { EQuizSessionStatus } from "@/utils/enums/EQuizSessionStatus";

const QuizSessionPlay: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const { connection } = useHub("/hub/quiz-session");
    const { data: quizSession } = useGetQuizSessionById(sessionId);
    const { submitAnswerAsync, data: submitData } = useSubmitAnswerForQuizSession();
    const userId = useReduxSelector(selectUserId);
    const dispatch = useReduxDispatch();
    
    // Redux selectors
    const isJoined = useReduxSelector(selectIsJoined);
    const isLoadingPrepare = useReduxSelector(selectIsLoadingPrepare);
    const quizAttempt = useReduxSelector(selectQuizAttempt);
    const currentQuestion = useReduxSelector(selectCurrentQuestion);
    const currentAnswer = useReduxSelector(selectCurrentAnswer);
    const quizSessionAttemptsEnded = useReduxSelector(selectQuizSessionAttemptsEnded);
    
    const isHost = quizSession?.ownerId === userId;

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

  
    useEffect(() => {
        if (isHost && 
            quizSession?.status !== EQuizSessionStatus.Abandoned && 
            quizSession?.status !== EQuizSessionStatus.Completed && 
            quizSession?.status !== EQuizSessionStatus.InProgress) {
            handleJoinSession(quizSession?.gamePin);
        }
    }, [isHost, quizSession?.gamePin, quizSession?.status, handleJoinSession]);

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

        const handleEndedQuiz = (quizSessionAttempts: QuizAttemptDTO[]) => {
            dispatch(setQuizSessionAttemptsEnded(quizSessionAttempts));
        }

        const handleQuizTerminate = () => {
            navigate('/user/quiz');
            toast.success("The quiz session has been terminated by the owner");
        }

        // Register all event listeners
        connection.on('UserJoinQuizSession', handleUserJoin);
        connection.on('UserExitQuizSession', handleUserExit);
        connection.on('QuizToggleLoadingPrepare', handleLoadingToggle);
        connection.on('SendQuizAttempt', handleQuizAttempt);
        connection.on('QuizHasBeenStarted', handleQuizStarted);
        connection.on('SubmitAnswer', handleQuizSubmit);
        connection.on('MoveToNextQuestion', handleMoveToNextQuestion);
        connection.on('QuizEnded', handleEndedQuiz)
        connection.on("QuizTerminated", handleQuizTerminate);

        // Cleanup function to remove event listeners
        return () => {
            connection.off('UserJoinQuizSession', handleUserJoin);
            connection.off('UserExitQuizSession', handleUserExit);
            connection.off('QuizToggleLoadingPrepare', handleLoadingToggle);
            connection.off('SendQuizAttempt', handleQuizAttempt);
            connection.off('QuizHasBeenStarted', handleQuizStarted);
            connection.off('SubmitAnswer', handleQuizSubmit);
            connection.off('MoveToNextQuestion', handleMoveToNextQuestion);
            connection.off('QuizEnded', handleEndedQuiz);
            connection.off("QuizTerminated", handleQuizTerminate);
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

    // Show closed screen if quiz session is completed or abandoned
    if (quizSession?.status === EQuizSessionStatus.Completed || 
        quizSession?.status === EQuizSessionStatus.Abandoned || 
        quizSession?.status === EQuizSessionStatus.InProgress) {
        return <QuizSessionClosed status={quizSession.status} />;
    }

    // Show results dashboard if quiz has ended
    if (quizSessionAttemptsEnded) {
        return <QuizSessionResults
            quizSessionAttempts={quizSessionAttemptsEnded}
        />;
    }

    // Show PIN entry screen if not joined and not host
    if (!isJoined && !isHost) {
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

    return <WaitingLobby
        isHost={isHost}
     />;

};

export default QuizSessionPlay;
