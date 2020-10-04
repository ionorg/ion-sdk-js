interface Signal {
  join(sid: string, offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit>;
  negotiate(jsep: RTCSessionDescriptionInit): void;
  trickle(candidate: RTCIceCandidateInit): void;
  close(): void;

  onNegotiate(callback: (jsep: RTCSessionDescriptionInit) => void): void;
  onTrickle(callback: (candidate: RTCIceCandidateInit) => void): void;
}
