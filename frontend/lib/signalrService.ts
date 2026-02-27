import * as signalR from "@microsoft/signalr";

const HUB_URL = process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/dashboardHub`
    : "http://localhost:5195/dashboardHub";

class SignalRService {
    private connection: signalR.HubConnection | null = null;
    private static instance: SignalRService;

    private constructor() { }

    public static getInstance(): SignalRService {
        if (!SignalRService.instance) {
            SignalRService.instance = new SignalRService();
        }
        return SignalRService.instance;
    }

    public async startConnection() {
        if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
            return;
        }

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(HUB_URL, {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .build();

        try {
            await this.connection.start();
            console.log("SignalR Connected.");
        } catch (err) {
            console.error("SignalR Connection Error: ", err);
            setTimeout(() => this.startConnection(), 5000);
        }
    }

    public on(eventName: string, callback: (...args: any[]) => void) {
        if (!this.connection) return;
        this.connection.on(eventName, callback);
    }

    public off(eventName: string) {
        if (!this.connection) return;
        this.connection.off(eventName);
    }

    public getConnectionState() {
        return this.connection?.state;
    }
}

export default SignalRService.getInstance();
