import { EventEmitter } from "events";
import * as protoo from "protoo-client";
interface IonNotification extends Notification {
    method: string;
    data: {
        rid: string;
        mid?: string;
        uid: string;
        info?: string;
    };
}
export default class Client extends EventEmitter {
    _url: string | undefined;
    _port: number;
    _uid: string;
    _rid: string | undefined;
    _protoo: protoo.Peer | undefined;
    _pcs: {
        [name: string]: RTCPeerConnection;
    };
    _streams: {
        [name: string]: MediaStream;
    };
    constructor();
    get uid(): string;
    init(): void;
    join(roomId: string, info?: {
        name: string;
    }): Promise<void>;
    leave(): Promise<void>;
    publish(stream: MediaStream, options?: {
        audio: boolean;
        video: boolean;
        screen: boolean;
        codec: string;
        resolution: string;
        bandwidth: number;
    }): Promise<void>;
    unpublish(mid: string): Promise<void>;
    subscribe(rid: string, mid: string): Promise<unknown>;
    unsubscribe(rid: string, mid: string): Promise<void>;
    close(): void;
    _payloadModify(desc: RTCSessionDescriptionInit, codec: string): RTCSessionDescriptionInit;
    _createSender(stream: MediaStream, codec: string): Promise<RTCPeerConnection>;
    _createReceiver(uid: string): Promise<RTCPeerConnection>;
    _removePC(id: string): void;
    _getProtooUrl(pid: string): string;
    _handleRequest(request: protoo.Request): void;
    _handleNotification(notification: IonNotification): void;
}
export {};
