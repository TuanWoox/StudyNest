import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";

const baseURL = import.meta.env.VITE_API_URL_BASIC;

export const useHub = (hubPath ) => {
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");

        // don't attempt connection without token
        if (!token) return;

        let hubConnection: signalR.HubConnection | null = null;

        const connectSignalR = async () => {
            try {
                hubConnection = new signalR.HubConnectionBuilder()
                    .withUrl(`${baseURL}${hubPath}`, {
                        accessTokenFactory: () => token ?? "",
                    })
                    .withAutomaticReconnect()
                    .build();

                await hubConnection.start();
                setConnection(hubConnection);
            } catch (err) {
                console.error("❌ SignalR Connection Error:", err);
            }
        };

        connectSignalR();

        return () => {
            if (hubConnection) {
                hubConnection
                    .stop()
                    .then(() => console.log("🛑 SignalR connection stopped"))
                    .catch((err) =>
                        console.error("❌ Error stopping connection:", err)
                    );
            }
        };
    }, [hubPath]);

    return { connection };
};
