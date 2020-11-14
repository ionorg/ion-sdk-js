import { Signal } from './signal';
import {
  computeAudioConstraints,
  computeVideoConstraints,
  Constraints,
  makeLocal,
  makeRemote,
  RemoteStream,
} from './stream';

export interface Sender {
  stream: MediaStream;
  transceivers: { [kind in 'video' | 'audio']: RTCRtpTransceiver };
}

export interface Configuration extends RTCConfiguration {
  codec: 'vp8' | 'vp9' | 'h264';
}

const defaults = {
  resolution: 'hd',
  audio: true,
  video: true,
  simulcast: false,
};

export default class Client {
  private api: RTCDataChannel;
  private initialized: boolean = false;
  pub: RTCPeerConnection;
  sub: RTCPeerConnection;
  private signal: Signal;
  private pubCandidates: RTCIceCandidateInit[];
  private subCandidates: RTCIceCandidateInit[];
  private senders: Sender[];
  private codec: string;

  ontrack?: (track: MediaStreamTrack, stream: RemoteStream) => void;

  constructor(
    sid: string,
    signal: Signal,
    config: Configuration = {
      codec: 'vp8',
      iceServers: [{ urls: 'stun:stun.stunprotocol.org:3478' }],
    },
  ) {
    this.pubCandidates = [];
    this.subCandidates = [];
    this.signal = signal;
    this.codec = config.codec;
    this.pub = new RTCPeerConnection(config);
    this.pub.onicecandidate = ({ candidate }) => {
      if (candidate) {
        signal.trickle({ target: "pub", candidate });
      }
    };
    this.sub = new RTCPeerConnection(config);
    this.sub.onicecandidate = ({ candidate }) => {
      if (candidate) {
        signal.trickle({ target: "sub", candidate });
      }
    };
    this.api = this.sub.createDataChannel('ion-sfu');
    this.senders = [];

    this.sub.ontrack = (ev: RTCTrackEvent) => {
      const stream = ev.streams[0];
      const remote = makeRemote(stream, this.api);

      if (this.ontrack) {
        this.ontrack(ev.track, remote);
      }
    };

    signal.onnegotiate = this.negotiate.bind(this);
    signal.ontrickle = this.trickle.bind(this);
    signal.onready = () => {
      if (!this.initialized) {
        this.join(sid);
        this.initialized = true;
      }
    };
  }

  getPubStats(selector?: MediaStreamTrack) {
    return this.pub.getStats(selector);
  }

  getSubStats(selector?: MediaStreamTrack) {
    return this.sub.getStats(selector);
  }

  async getUserMedia(constraints: Constraints = defaults) {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: computeAudioConstraints({
        ...defaults,
        ...constraints,
      }),
      video: computeVideoConstraints({
        ...defaults,
        ...constraints,
      }),
    });

    return makeLocal(this.pub, {
      ...defaults,
      ...constraints,
    });
  }

  async getDisplayMedia(
    constraints: Constraints = {
      resolution: 'hd',
      audio: false,
      video: true,
      simulcast: false,
    },
  ) {
    // @ts-ignore
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });

    const sender = this.senders.find((s) => s.stream.getTracks().length === 0);

    if (!sender) {
      return null;
    }

    stream.getTracks().forEach((t: MediaStreamTrack) => sender.stream.addTrack(t));

    return makeLocal(this.pc, sender, {
      ...defaults,
      ...constraints,
    });
  }

  close() {
    this.pub.close();
    this.sub.close();
    this.signal.close();
  }

  private async join(sid: string) {
    const offer = await this.pub.createOffer();
    await this.pub.setLocalDescription(offer);
    const answer = await this.signal.join(sid, offer);

    await this.pub.setRemoteDescription(answer);
    this.candidates.forEach((c) => this.pub.addIceCandidate(c));
    this.pub.onnegotiationneeded = this.onNegotiationNeeded.bind(this);
  }

  private trickle(candidate: RTCIceCandidateInit) {
    if (this.pub.remoteDescription) {
      this.pub.addIceCandidate(candidate);
    } else {
      this.candidates.push(candidate);
    }
  }

  private async negotiate(description: RTCSessionDescriptionInit) {
    try {
      await this.pc.setRemoteDescription(description); // SRD rolls back as needed
      if (description.type === 'offer') {
        await this.pc.setLocalDescription();
        this.signal.answer(this.pc.localDescription!);
      }
    } catch (err) {
      /* tslint:disable-next-line:no-console */
      console.error(err);
    }
  }

  private async onNegotiationNeeded() {
    try {
      await this.pc.setLocalDescription();
      const offer = this.pc.localDescription!;
      const answer = await this.signal.offer(offer);
      await this.negotiate(answer);
    } catch (err) {
      /* tslint:disable-next-line:no-console */
      console.error(err);
    }
  }

  private setPreferredCodec(transceiver: RTCRtpTransceiver, kind: 'audio' | 'video') {
    if ('setCodecPreferences' in transceiver) {
      const cap = RTCRtpSender.getCapabilities(kind);
      if (!cap) return;
      const selCodec = cap.codecs.find(
        (c) => c.mimeType === `video/${this.codec.toUpperCase()}` || c.mimeType === `audio/OPUS`,
      );
      if (selCodec) {
        transceiver.setCodecPreferences([selCodec]);
      }
    }
  }
}
