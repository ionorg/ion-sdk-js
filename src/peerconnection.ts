import { parse, write, MediaAttributes } from 'sdp-transform';

enum PayloadType {
  Opus = 111,
  VP8 = 96,
  VP9 = 98,
  H264 = 102,
}

export type Codec = 'H264' | 'VP8' | 'VP9' | undefined;

export default class PeerConnection extends RTCPeerConnection {
  private codec: Codec;
  constructor(config: RTCConfiguration, codec?: Codec) {
    super(config);

    // This is required for Safari support
    Object.setPrototypeOf(this, PeerConnection.prototype);

    this.codec = codec;
  }

  close() {
    super.getSenders().forEach((sender) => super.removeTrack(sender));
    super.close();
  }

  async createOffer(options?: RTCOfferOptions): Promise<RTCSessionDescriptionInit> {
    const offer = await super.createOffer(options);

    if (!this.codec) return offer;

    // munge sdp to update codec preference order
    const session = parse(offer.sdp!);
    session.media.forEach((media, i) => {
      const j = media.rtp.findIndex((rtp) => rtp.codec === this.codec);
      const prev = media.rtp[0];
      session.media[i].rtp[0] = session.media[i].rtp[j];
      session.media[i].rtp[j] = prev;
    });
    offer.sdp = write(session);

    return offer;
  }
}
