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
interface IonRTCPeerConnection extends RTCPeerConnection {
    sendOffer: boolean;
}
export default class Client extends EventEmitter {
    _debug: boolean;
    _url: string;
    _uid: string;
    _rid: string | undefined;
    _protoo: protoo.Peer | undefined;
    _pcs: {
        [name: string]: RTCPeerConnection;
    };
    _streams: {
        [name: string]: MediaStream;
    };
    constructor(url: string, debug?: boolean);
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
    }): Promise<string>;
    updateTracks(mid: string, tracks: MediaStreamTrack[]): void;
    unpublish(mid: string): Promise<void>;
    subscribe(rid: string, mid: string): Promise<MediaStream>;
    unsubscribe(rid: string, mid: string): Promise<void>;
    broadcast(rid: string, info: any): Promise<void>;
    close(): void;
    _payloadModify(desc: RTCSessionDescriptionInit, codec: string): RTCSessionDescriptionInit;
    _createSender(stream: MediaStream, codec: string): Promise<IonRTCPeerConnection>;
    _createReceiver(uid: string): Promise<IonRTCPeerConnection>;
    _removePC(id: string): void;
    _getProtooUrl(baseUrl: string, pid: string): string;
    _handleRequest(request: protoo.Request): void;
    _handleNotification(notification: IonNotification): void;
}
export {};
