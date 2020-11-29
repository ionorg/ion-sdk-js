import IonSFUJSONRPCSignal from './json-rpc-impl';
import IonSFUGRPCGWebSignal from './grpc-web-impl';
import { Trickle } from '../client';

export interface Signal {
  onnegotiate?: (jsep: RTCSessionDescriptionInit) => void;
  onready?: () => void;
  ontrickle?: (trickle: Trickle) => void;

  join(sid: string, offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit>;
  offer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit>;
  answer(answer: RTCSessionDescriptionInit): void;
  trickle(trickle: Trickle): void;
  close(): void;
}

export { IonSFUJSONRPCSignal, IonSFUGRPCGWebSignal, Trickle };
