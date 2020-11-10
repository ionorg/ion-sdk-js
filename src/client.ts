import { Signal } from './signal';
import { Constraints, LocalStream, makeRemote, RemoteStream } from './stream';
import * as sdpTransform from 'sdp-transform';

export interface Sender {
  stream: MediaStream;
  transceivers: { [kind in 'video' | 'audio']: RTCRtpTransceiver };
}

const defaults = {
  codec: 'VP8',
  resolution: 'hd',
  audio: true,
  video: true,
  simulcast: false,
};

export default class Client {
  private api: RTCDataChannel;
  pc: RTCPeerConnection;
  private signal: Signal;
  private candidates: RTCIceCandidateInit[];
  private senders: Sender[];
  private codec: string;

  ontrack?: (track: MediaStreamTrack, stream: RemoteStream) => void;

  constructor(
    sid: string,
    signal: Signal,
    config: RTCConfiguration = {
      iceServers: [{ urls: 'stun:stun.stunprotocol.org:3478' }],
    },
  ) {
    const initialStreams = 2;
    this.candidates = [];
    this.signal = signal;
    this.codec = 'vp8';
    this.pc = new RTCPeerConnection(config);
    this.pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        signal.trickle(candidate);
      }
    };
    this.api = this.pc.createDataChannel('ion-sfu');
    this.senders = [];
    for (let i = 0; i < initialStreams; i++) {
      const stream = new MediaStream();
      this.senders.push({
        stream,
        transceivers: {
          audio: this.pc.addTransceiver('audio', { direction: 'sendonly', streams: [stream] }),
          video: this.pc.addTransceiver('video', { direction: 'sendonly', streams: [stream] }),
        },
      });
    }

    this.pc.ontrack = (ev: RTCTrackEvent) => {
      const stream = ev.streams[0];
      const remote = makeRemote(stream, this.api);

      if (this.ontrack) {
        this.ontrack(ev.track, remote);
      }
    };

    signal.onnegotiate = this.negotiate.bind(this);
    signal.ontrickle = this.trickle.bind(this);
    signal.onready = () => this.join(sid);
  }

  getStats(selector?: MediaStreamTrack) {
    return this.pc.getStats(selector);
  }

  async getUserMedia(constraints: Constraints = defaults) {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: LocalStream.computeAudioConstraints({
        ...defaults,
        ...constraints,
      }),
      video: LocalStream.computeVideoConstraints({
        ...defaults,
        ...constraints,
      }),
    });

    const sender = this.senders.find((s) => s.stream.getTracks().length === 0);

    if (!sender) {
      return null;
    }

    stream.getTracks().forEach((t) => sender.stream.addTrack(t));

    return new LocalStream(this.pc, sender, {
      ...defaults,
      ...constraints,
    });
  }

  async getDisplayMedia(
    constraints: Constraints = {
      codec: 'VP8',
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

    return new LocalStream(this.pc, sender, {
      ...defaults,
      ...constraints,
    });
  }

  setcodec(codec: string) {
    this.codec = codec;
  }

  close() {
    this.signal.close();
  }

  private async join(sid: string) {
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    const answer = await this.signal.join(sid, offer);

    await this.pc.setRemoteDescription(answer);
    this.candidates.forEach((c) => this.pc.addIceCandidate(c));
    this.pc.onnegotiationneeded = this.onNegotiationNeeded.bind(this);
  }

  private trickle(candidate: RTCIceCandidateInit) {
    if (this.pc.remoteDescription) {
      this.pc.addIceCandidate(candidate);
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
      /* tslint:disable-next-line:no-console */
      console.log('negotiation needed');
      await this.pc.setLocalDescription();
      const offer = simplifySDP(this.pc.localDescription!, this.codec);
      const answer = await this.signal.offer(offer);
      await this.negotiate(answer);
    } catch (err) {
      /* tslint:disable-next-line:no-console */
      console.error(err);
    }
  }
}

export function simplifySDP(desc: RTCSessionDescriptionInit, codec: string) {
  if (codec === undefined) return desc;

  const DefaultPayloadTypeOpus = 111;
  let payload = 0;
  let rtxpayload = 0;
  let redpayload = 0;
  let redrtxpayload = 0;
  const session = sdpTransform.parse(desc.sdp as string);
  /* tslint:disable-next-line:no-console */
  console.log('before simplifySDP session=', session);
  // return desc

  session.media.map((m: any, i: any) => {
    // simplfiy audio, only keep opus
    if (m.type === 'audio') {
      m.payloads = DefaultPayloadTypeOpus;
      m.rtp.map((rtpmap: any, index: any) => {
        if (rtpmap.payload !== DefaultPayloadTypeOpus) {
          delete m.rtp[index];
        }
      });
    }

    // simplfiy video, only keep as we need
    if (m.type === 'video') {
      m.rtp.map((rtpmap: any, index: any) => {
        // find payload by codec
        if (rtpmap.codec.toLowerCase() === codec.toLowerCase()) {
          payload = rtpmap.payload;
        }

        // find red payload by codec
        if (rtpmap.codec.toLowerCase() === 'red') {
          redpayload = rtpmap.payload;
        }
      });

      // delete unused rtcpfb
      if (m.rtcpFb !== undefined) {
        m.rtcpFb.map((rtcpfb: any, index: any) => {
          if (rtcpfb.payload !== payload) {
            delete m.rtcpFb[index];
          }
        });
      }

      // find rtx payload by apt
      m.fmtp.map((fmtp: any, index: any) => {
        if (fmtp.config === 'apt=' + payload) {
          rtxpayload = fmtp.payload;
        }
      });

      m.fmtp.map((fmtp: any, index: any) => {
        if (fmtp.config === 'apt=' + redpayload) {
          redrtxpayload = fmtp.payload;
        }
      });

      // delete unused rtpmap
      m.rtp.map((rtpmap: any, index: any) => {
        if (rtpmap.codec.toLowerCase() === 'red' || rtpmap.codec.toLowerCase() === 'ulpfec') {
          // skip red and ulpfec
        } else if (rtpmap.payload !== payload && rtpmap.payload !== rtxpayload && rtpmap.payload !== redrtxpayload) {
          delete m.rtp[index];
        }
      });

      // delete unused fmtp
      m.fmtp.map((fmtp: any, index: any) => {
        if (fmtp.payload !== payload && fmtp.payload !== rtxpayload) {
          delete m.fmtp[index];
        }
      });
      m.payloads = payload + ' ' + rtxpayload;
    }
  });
  desc.sdp = sdpTransform.write(session);
  /* tslint:disable-next-line:no-console */
  console.log('after simplifySDP session=', desc);
  return desc;

  // return tmp;
}
