import { parse, write, MediaAttributes } from 'sdp-transform';
import * as log from 'loglevel';

enum PayloadType {
  PCMU = 0,
  PCMA = 8,
  G722 = 9,
  Opus = 111,
  VP8 = 96,
  VP9 = 98,
  H264 = 102,
}

export type Codec = 'H264' | 'VP8' | 'VP9' | undefined;

function rtp(name: Codec): MediaAttributes['rtp'] {
  switch (name) {
    case 'H264':
      return [
        {
          payload: PayloadType.H264,
          codec: 'H264',
          rate: 90000,
        },
      ];
    case 'VP8':
      return [
        {
          payload: PayloadType.VP8,
          codec: 'VP8',
          rate: 90000,
        },
      ];
    case 'VP9':
      return [
        {
          payload: PayloadType.VP9,
          codec: 'VP9',
          rate: 90000,
        },
      ];
    default:
      return [];
  }
}

export default class WebRTCTransport {
  private static config: RTCConfiguration = {
    iceServers: [{ urls: 'stun:stun.stunprotocol.org:3478' }],
  };

  static setRTCConfiguration(config: RTCConfiguration) {
    WebRTCTransport.config = config;
  }

  private pc: RTCPeerConnection;
  private rtp: MediaAttributes['rtp'] | null;
  constructor(codec?: Codec) {
    if (!WebRTCTransport.config) {
      throw new Error('RTConfiguration not set.');
    }
    this.pc = new RTCPeerConnection(WebRTCTransport.config);
    this.rtp = codec ? rtp(codec) : null;
  }

  close() {
    this.pc.ontrack = null;
    this.pc.onicecandidate = null;
    this.pc.onnegotiationneeded = null;
    this.pc.getSenders().forEach((sender) => this.pc.removeTrack(sender));
    this.pc.close();
  }

  addTrack(track: MediaStreamTrack, stream: MediaStream) {
    return this.pc.addTrack(track, stream);
  }

  addTransceiver(kind: string) {
    this.pc.addTransceiver(kind, { direction: 'recvonly' });
  }

  removeTrack(sender: RTCRtpSender) {
    this.pc.removeTrack(sender);
  }

  getSenders(): RTCRtpSender[] {
    return this.pc.getSenders();
  }

  setLocalDescription(offer: RTCSessionDescriptionInit) {
    this.pc.setLocalDescription(offer);
  }

  setRemoteDescription(desc: RTCSessionDescriptionInit): Promise<void> {
    return this.pc.setRemoteDescription(desc);
  }

  async createOffer(options?: RTCOfferOptions): Promise<RTCSessionDescriptionInit> {
    const offer = await this.pc.createOffer(options);

    if (!this.rtp) return offer;

    const session = parse(offer.sdp!);

    const videoIdx = session.media.findIndex(({ type, ssrcGroups }) => type === 'video' && !!ssrcGroups);
    if (videoIdx === -1) return offer;

    const { payload } = this.rtp[0];
    session.media[videoIdx].payloads = `${payload}`; // + " 97";
    session.media[videoIdx].rtp = this.rtp;

    const fmtp: any[] = [
      // { "payload": 97, "config": "apt=" + payload }
    ];

    session.media[videoIdx].fmtp = fmtp;

    const rtcpFB = [
      { payload, type: 'transport-cc', subtype: undefined },
      { payload, type: 'ccm', subtype: 'fir' },
      { payload, type: 'nack', subtype: undefined },
      { payload, type: 'nack', subtype: 'pli' },
    ];

    session.media[videoIdx].rtcpFb = rtcpFB;

    const ssrcGroup = session.media[videoIdx].ssrcGroups![0];
    const ssrcs = ssrcGroup.ssrcs;
    const ssrc = parseInt(ssrcs.split(' ')[0], 10);
    log.debug('ssrcs => %s, video %s', ssrcs, ssrc);

    session.media[videoIdx].ssrcGroups = [];
    session.media[videoIdx].ssrcs = session.media[videoIdx].ssrcs!.filter((item) => item.id === ssrc);

    offer.sdp = write(session);
    return offer;
  }

  get localDescription(): RTCSessionDescription | null {
    return this.pc.localDescription;
  }

  set onicecandidate(cb: (ev: RTCPeerConnectionIceEvent) => any | null) {
    this.pc.onicecandidate = cb;
  }

  set onnegotiationneeded(cb: (ev: Event) => any | null) {
    this.pc.onnegotiationneeded = cb;
  }

  set ontrack(cb: (ev: RTCTrackEvent) => any | null) {
    this.pc.ontrack = cb;
  }
}
