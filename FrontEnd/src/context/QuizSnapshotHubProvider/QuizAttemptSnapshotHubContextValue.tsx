import { createContext, useContext } from "react";
import * as signalR from "@microsoft/signalr";

export interface QuizAttemptSnapshotHubContextValue {
    notificationConnection: signalR.HubConnection | null;
}

export const QuizAttemptSnapshotHubContext = createContext<QuizAttemptSnapshotHubContextValue>({
    notificationConnection: null,
});

export const useQuizAttemptSnapshotHub = () => useContext(QuizAttemptSnapshotHubContext);