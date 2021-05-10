import { grpc } from '@improbable-eng/grpc-web';

export interface IonService {
    connector: IonBaseConnector;
    closed: boolean;
    connect(): void;
    close(): void;
    onHeaders: (handler: (headers: grpc.Metadata) => void) => void;
    onEnd: (handler: (status: grpc.Code, statusMessage: string, trailers: grpc.Metadata) => void) => void;
}

export class IonBaseConnector {
    public metadata: grpc.Metadata;
    public uri: string;
    public services: Map<string, IonService>;
    onopen?: (service: string) => void;
    onclose?: (service: string, ev: Event) => void;

    constructor(uri: string, token?: string) {
        this.uri = uri;
        this.metadata = new grpc.Metadata();
        this.services = new Map<string, IonService>();

        if (token) {
            this.metadata.append("authorization", token);
        }
    }

    public grpcClientRpcOptions(): grpc.ClientRpcOptions {
        return {
            host: this.uri,
            transport: grpc.WebsocketTransport(),
        };
    }

    public close(): void {
        this.services.forEach((service: IonService)=>{
            if(!service.closed) {
                service.close();
            }
        });
    }

    registerService(name: string, service: IonService) {
        // Merge metadata.
        service.onHeaders((headers: grpc.Metadata) => {
            headers.forEach((key, value) => {
                if (key.toLowerCase() !== "trailer" && key.toLowerCase() !== "content-type") {
                    this.metadata.append(key, value);
                }
            });
            this.onopen?.call(this, name);
        });

        service.onEnd((status: grpc.Code, statusMessage: string, trailers: grpc.Metadata) => {
            this.onclose?.call(this, name, new CustomEvent(name, { "detail": { status, statusMessage, trailers } }));
        });

        this.services.set(name, service);
    }
}