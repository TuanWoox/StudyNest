// ...existing code...
import { useEffect, useState, ReactNode } from "react";
import * as signalR from "@microsoft/signalr";

import { QuizAttemptSnapshotHubContext } from "./QuizAttemptSnapshotHubContextValue"
import { toast } from "sonner";
import { useReduxSelector } from "@/hooks/reduxHook/useReduxSelector";
import { selectRole } from "@/store/authSlice";
import { useQueryClient } from "@tanstack/react-query";

interface ProviderProps {
    children: ReactNode;
}

const baseURL = import.meta.env.VITE_API_URL_BASIC;

export const QuizAttemptSnapshotHubProvider = ({ children }: ProviderProps) => {

    const role = useReduxSelector(selectRole);
    const queryClient = useQueryClient();
    const [notificationConnection, setNotificationConnection] =
        useState<signalR.HubConnection | null>(null);

    useEffect(() => {

        const token = localStorage.getItem("accessToken");

        // if either missing, don't connect
        if (!token || !role) return;

        let connection: signalR.HubConnection | null = null;

        const connectSignalR = async () => {
            try {
                connection = new signalR.HubConnectionBuilder()
                    .withUrl(`${baseURL}/hub/quiz-attempt-snapshot`, {
                        accessTokenFactory: () => token ?? "",
                    })
                    .withAutomaticReconnect()
                    .build();

                await connection.start();

                connection.on(
                    'CompleteCreateQuizAttemptSnapshot', async ({ quizId, quiztitle }) => {
                        toast.success(
                            `Snapshot for quiz "${quiztitle}" (ID: ${quizId}) created successfully! You can now start your test.`
                        );
                        await queryClient.invalidateQueries({ queryKey: ["quizzes"] });
                    }
                );

                setNotificationConnection(connection);
            } catch (err) {
                console.error("❌ Error while starting connection:", err);
            }
        };

        connectSignalR();

        return () => {
            if (connection) {
                connection
                    .stop()
                    .then(() => console.log("🛑 SignalR connection stopped"))
                    .catch((err) => console.error("❌ Error stopping connection:", err));
            }
        };
    }, [role]);

    return (
        <QuizAttemptSnapshotHubContext.Provider value={{ notificationConnection }}>
            {children}
        </QuizAttemptSnapshotHubContext.Provider>
    );
};
