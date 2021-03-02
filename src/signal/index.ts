import { Trickle } from '../client';
export { Trickle };

export interface Signal {
  onnegotiate?: (jsep: RTCSessionDescriptionInit) => void;
  ontrickle?: (trickle: Trickle) => void;

  join(sid: string, uid: null | string, offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit>;
  offer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit>;
  answer(answer: RTCSessionDescriptionInit): void;
  trickle(trickle: Trickle): void;
  close(): void;
}
