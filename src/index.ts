import Client from './client';
import { LocalStream, RemoteStream, Constraints } from './stream';
import { Signal, Trickle, IonSFUJSONRPCSignal, IonSFUGRPCWebSignal } from './signal';
export { Client, LocalStream, RemoteStream, Constraints, Signal, Trickle };

export function createJSONRPCSignal(uri: string): Signal {
    return new IonSFUJSONRPCSignal(uri);
}

export function createGRPCWebSignal(uri: string): Signal {
    return new IonSFUGRPCWebSignal(uri);
}
