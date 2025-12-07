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
import { moveToNextQuestion, selectCurrentQuestion, setQuestions, selectCurrentAnswer } from "@/store/quizSessionAtemptSlice";
import { QuizAttemptAnswerDTO } from "@/types/quizAttemptAnswer/quizAttemptAnswerDTO";

const QuizSessionPlay: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const { connection } = useHub("/hub/quiz-session");
    const { data, isLoading: isFetchingQuizSession } = useGetQuizSessionById(sessionId);
    const [isJoined, setIsJoined] = useState(false);
    const [players, setPlayers] = useState<string[]>([]);
    const [isLoadingPrepare, setIsLoadingPrepare] = useState(false);
    const [quizAttempt, setQuizAttempt] = useState<QuizAttemptDTO | null>(null);
    const { submitAnswerAsync, data: submitData, isLoading } = useSubmitAnswerForQuizSession();
    const [submitResult, setSubmitResult] = useState<QuizAttemptAnswerDTO | undefined>(undefined);
    const userId = useReduxSelector(selectUserId);
    const currentQuestion = useReduxSelector(selectCurrentQuestion);
    const currentAnswer = useReduxSelector(selectCurrentAnswer);
    const dispatch = useReduxDispatch();
    const isHost = data?.ownerId === userId;

    const handleJoinSession = useCallback(async (inputPin: string | undefined) => {
        if (!connection || !sessionId || !inputPin) return;
        try {
            const result = await connection.invoke<ReturnResult<string[]>>("JoinQuizSession", {
                id: sessionId,
                gamePin: inputPin
            });
            if (result.result) {
                setIsJoined(true);
                setPlayers(result.result);
            } else {
                toast.error(result.message || "Failed to join the session");
            }
        } catch (error) {
            console.error("Join session error:", error);
            toast.error("An error occurred while joining the session");
        }
    }, [connection, sessionId]);

    const handleStartGame = useCallback(async () => {
        if (!connection || !sessionId) return;
        try {
            const result = await connection.invoke<ReturnResult<boolean>>("StartQuiz", sessionId);
            if (!result.result) {
                message.error(result.message || "Failed to start quiz");
            }
        } catch (error) {
            message.error("Failed to start quiz");
            console.error("Start quiz error:", error);
        }
    }, [connection, sessionId]);

    const handleLeave = useCallback(async () => {
        if (!connection || !sessionId) return;
        try {
            await connection.invoke("LeaveQuizSession", sessionId);
            toast.success("Left the session");
            navigate(-1); // Go back to previous page
        } catch (error) {
            message.error("Failed to leave session");
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
            setPlayers(data.players);
        };

        // Handler for when a user exits
        const handleUserExit = (data: { players: string[] }) => {
            setPlayers(data.players);
        };

        // Handler for loading state during quiz preparation
        const handleLoadingToggle = (data: { loading: boolean }) => {
            setIsLoadingPrepare(data.loading);
        };

        // Handler for receiving individual quiz attempt
        const handleQuizAttempt = (data: { quizAttempt: QuizAttemptDTO }) => {
            if (data.quizAttempt) {
                setQuizAttempt(data.quizAttempt);
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
            setSubmitResult(undefined);
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
            setSubmitResult(submitData);
        }
    }, [submitData])

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
        return <QuizSessionDisplay
            submitResult={submitResult}
            isSubmitting={isLoading}
        />;
    }

    return (
        <WaitingLobby
            gamePin={data?.gamePin}
            players={players}
            isHost={isHost}
            onStartGame={handleStartGame}
            onLeave={handleLeave}
        />
    );
};

export default QuizSessionPlay;
