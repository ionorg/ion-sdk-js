import { grpc } from '@improbable-eng/grpc-web';

/**
 * Service interface
 */
export interface Service {
    name: string;
    // connect(): void;
    connected: boolean;
    close(): void;
}
/**
 * Connector class
 * support multiple services
 */
export class Connector {
    public metadata: grpc.Metadata;
    public uri: string;
    public services: Map<string, Service>;
    onopen?: (service: Service) => void;
    onclose?: (service: Service, ev: Event) => void;

    constructor(uri: string, token?: string) {
        this.uri = uri;
        this.metadata = new grpc.Metadata();
        this.services = new Map<string, Service>();

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
        this.services.forEach((service: Service) => {
            if (service.connected) {
                service.close();
            }
        });
    }

    public onHeaders(service: Service, headers: grpc.Metadata): void {
        // Merge metadata.
        headers.forEach((key, value) => {
            if (key.toLowerCase() !== "trailer" && key.toLowerCase() !== "content-type") {
                this.metadata.append(key, value);
            }
        });
        service.connected = true;
        this.onopen?.call(this, service);
    }

    public onEnd(service: Service, status: grpc.Code, statusMessage: string, trailers: grpc.Metadata): void {
        service.connected = false;
        this.onclose?.call(this, service, new CustomEvent(service.name, { "detail": { status, statusMessage, trailers } }));
    }

    /**
     * register service to connector
     * @date 2021-11-03
     * @param {any} service:Service
     * @returns {any}
     */
    registerService(service: Service) {
        this.services.set(service.name, service);
    }
}