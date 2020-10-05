import * as log from 'loglevel';

import { LocalStream, RemoteStream } from './stream';
import PeerConnection from './peerconnection';

interface Config {
  rtc: RTCConfiguration;
  loglevel: log.LogLevelDesc;
}

export default class Client {
  private api: RTCDataChannel;
  private pc: RTCPeerConnection;
  private signal: Signal;
  private candidates: RTCIceCandidateInit[];

  ontrack?: (track: MediaStreamTrack, stream: RemoteStream) => void;

  remotes: Map<string, RemoteStream>;

  constructor(
    sid: string,
    signal: Signal,
    config: Config = {
      loglevel: log.levels.WARN,
      rtc: {
        iceServers: [{ urls: 'stun:stun.stunprotocol.org:3478' }],
      },
    },
  ) {
    log.setLevel(config.loglevel);

    this.candidates = [];
    this.remotes = new Map();

    this.signal = signal;
    this.pc = new PeerConnection(config.rtc);
    this.api = this.pc.createDataChannel('ion-sfu');
    this.pc.ontrack = (ev: RTCTrackEvent) => {
      const stream = ev.streams[0];
      let remote = this.remotes.get(stream.id);
      if (!remote) {
        remote = new RemoteStream(stream, this.api);
        this.remotes.set(stream.id, remote);
      }

      if (this.ontrack) {
        this.ontrack(ev.track, remote);
      }
    };

    this.join(sid);
  }

  async join(sid: string) {
    try {
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);
      const answer = await this.signal.join(sid, offer);

      this.pc.onnegotiationneeded = this.onNegotiationNeeded;
      this.pc.setRemoteDescription(answer);

      this.candidates.forEach(this.pc.addIceCandidate);

      this.signal.onNegotiate(this.negotiate);
      this.signal.onTrickle(this.trickle);
    } catch (error) {
      log.error('join error:' + error);
    }
  }

  publish(stream: MediaStream) {
    if (stream.hasOwnProperty('publish')) {
      (stream as LocalStream).publish(this.pc);
    }
    stream.getTracks().forEach((track) => this.pc.addTrack(track));
  }

  close() {
    this.signal.close();
  }

  private trickle(candidate: RTCIceCandidateInit) {
    if (this.pc.remoteDescription) {
      this.pc.addIceCandidate(candidate);
    } else {
      this.candidates.push(candidate);
    }
  }

  private async negotiate(jsep: RTCSessionDescriptionInit) {
    if (jsep.type === 'offer') {
      await this.pc.setRemoteDescription(jsep);
      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answer);
      this.signal.negotiate(answer);
    } else if (jsep.type === 'answer') {
      this.pc.setRemoteDescription(jsep);
    }
  }

  private async onNegotiationNeeded() {
    const offer = await this.pc!.createOffer();
    await this.pc!.setLocalDescription(offer);
    this.signal.negotiate(offer);
  }
}
