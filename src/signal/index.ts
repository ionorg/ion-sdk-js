import IonSFUJSONRPCSignal from './ion-sfu';

export interface Signal {
  onnegotiate?: (jsep: RTCSessionDescriptionInit) => void;
  onready?: () => void;
  ontrickle?: (candidate: RTCIceCandidateInit) => void;

  join(sid: string, offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit>;
  offer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit>;
  answer(answer: RTCSessionDescriptionInit): void;
  trickle(candidate: RTCIceCandidateInit): void;
  close(): void;
}

export { IonSFUJSONRPCSignal };
