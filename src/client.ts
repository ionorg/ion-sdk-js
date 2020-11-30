import { Signal } from './signal';
import { LocalStream, makeRemote, RemoteStream } from './stream';

const errNoSession = 'no active session, join first';

export interface Sender {
  stream: MediaStream;
  transceivers: { [kind in 'video' | 'audio']: RTCRtpTransceiver };
}

export interface Configuration extends RTCConfiguration {
  codec: 'vp8' | 'vp9' | 'h264';
}

export interface Trickle {
  candidate: RTCIceCandidateInit;
  target: Role;
}

enum Role {
  pub = 0,
  sub = 1,
}

type Transports<T extends string | symbol | number, U> = {
  [K in T]: U;
};

export class Transport {
  api?: RTCDataChannel;
  signal: Signal;
  pc: RTCPeerConnection;
  candidates: RTCIceCandidateInit[];

  constructor(role: Role, signal: Signal, config: RTCConfiguration) {
    this.signal = signal;
    this.pc = new RTCPeerConnection(config);
    this.candidates = [];

    if (role === Role.pub) {
      this.pc.createDataChannel('ion-sfu');
    }

    this.pc.ondatachannel = ({ channel }) => {
      this.api = channel;
    };

    this.pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        this.signal.trickle({ target: role, candidate });
      }
    };
  }
}

export default class Client {
  transports?: Transports<Role, Transport>;
  private config: Configuration;
  private signal: Signal;

  ontrack?: (track: MediaStreamTrack, stream: RemoteStream) => void;
  ondatachannel?: (ev: RTCDataChannelEvent) => void;

  constructor(
    signal: Signal,
    config: Configuration = {
      codec: 'vp8',
      iceServers: [
        {
          urls: [
            'stun:stun.l.google.com:19302',
            'stun:stun1.l.google.com:19302',
            'stun:stun2.l.google.com:19302',
            'stun:stun3.l.google.com:19302',
            'stun:stun4.l.google.com:19302',
          ],
        },
      ],
    },
  ) {
    this.signal = signal;
    this.config = config;

    signal.onnegotiate = this.negotiate.bind(this);
    signal.ontrickle = this.trickle.bind(this);
  }

  async join(sid: string) {
    this.transports = {
      [Role.pub]: new Transport(Role.pub, this.signal, this.config),
      [Role.sub]: new Transport(Role.sub, this.signal, this.config),
    };

    this.transports[Role.sub].pc.ontrack = (ev: RTCTrackEvent) => {
      const stream = ev.streams[0];
      const remote = makeRemote(stream, this.transports![Role.sub]);

      if (this.ontrack) {
        this.ontrack(ev.track, remote);
      }
    };

    this.transports[Role.sub].pc.ondatachannel = (ev: RTCDataChannelEvent) => {
      if (ev.channel.label === 'ion-sfu') {
        return;
      }

      if (this.ondatachannel) {
        this.ondatachannel(ev);
      }
    };

    const offer = await this.transports[Role.pub].pc.createOffer();
    await this.transports[Role.pub].pc.setLocalDescription(offer);
    const answer = await this.signal.join(sid, offer);

    await this.transports[Role.pub].pc.setRemoteDescription(answer);
    this.transports[Role.pub].candidates.forEach((c) => this.transports![Role.pub].pc.addIceCandidate(c));
    this.transports[Role.pub].pc.onnegotiationneeded = this.onNegotiationNeeded.bind(this);
  }

  leave() {
    if (this.transports) {
      Object.values(this.transports).forEach((t) => t.pc.close());
      delete this.transports;
    }
  }

  getPubStats(selector?: MediaStreamTrack) {
    if (!this.transports) {
      throw Error(errNoSession);
    }
    return this.transports[Role.pub].pc.getStats(selector);
  }

  getSubStats(selector?: MediaStreamTrack) {
    if (!this.transports) {
      throw Error(errNoSession);
    }
    return this.transports[Role.sub].pc.getStats(selector);
  }

  publish(stream: LocalStream) {
    if (!this.transports) {
      throw Error(errNoSession);
    }
    stream.publish(this.transports[Role.pub].pc);
  }

  createDataChannel(label: string) {
    if (!this.transports) {
      throw Error(errNoSession);
    }
    return this.transports[Role.pub].pc.createDataChannel(label);
  }

  close() {
    if (this.transports) {
      Object.values(this.transports).forEach((t) => t.pc.close());
    }
    this.signal.close();
  }

  private trickle({ candidate, target }: Trickle) {
    if (!this.transports) {
      throw Error(errNoSession);
    }
    if (this.transports[target].pc.remoteDescription) {
      this.transports[target].pc.addIceCandidate(candidate);
    } else {
      this.transports[target].candidates.push(candidate);
    }
  }

  private async negotiate(description: RTCSessionDescriptionInit) {
    if (!this.transports) {
      throw Error(errNoSession);
    }

    try {
      await this.transports[Role.sub].pc.setRemoteDescription(description);
      this.transports[Role.sub].candidates.forEach((c) => this.transports![Role.sub].pc.addIceCandidate(c));
      this.transports[Role.sub].candidates = [];
      const answer = await this.transports[Role.sub].pc.createAnswer();
      await this.transports[Role.sub].pc.setLocalDescription(answer);
      this.signal.answer(answer);
    } catch (err) {
      /* tslint:disable-next-line:no-console */
      console.error(err);
    }
  }

  private async onNegotiationNeeded() {
    if (!this.transports) {
      throw Error(errNoSession);
    }

    try {
      const offer = await this.transports[Role.pub].pc.createOffer();
      await this.transports[Role.pub].pc.setLocalDescription(offer);
      const answer = await this.signal.offer(offer);
      await this.transports[Role.pub].pc.setRemoteDescription(answer);
    } catch (err) {
      /* tslint:disable-next-line:no-console */
      console.error(err);
    }
  }
}
