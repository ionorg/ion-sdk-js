import { EventEmitter } from 'events';
import * as protoo from 'protoo-client';
import { v4 as uuidv4 } from 'uuid';
import * as sdpTransform from 'sdp-transform';
import * as log from 'loglevel';

// const DefaultPayloadTypePCMU = 0;
// const DefaultPayloadTypePCMA = 8;
// const DefaultPayloadTypeG722 = 9;
// const DefaultPayloadTypeOpus = 111;
const DefaultPayloadTypeVP8 = 96;
const DefaultPayloadTypeVP9 = 98;
const DefaultPayloadTypeH264 = 102;

interface IonNotification extends Notification {
  method: string;
  data: {
    rid: string;
    mid?: string;
    uid: string;
    info?: string;
  };
}

interface Config {
  ice?: { urls: 'stun:stun.stunprotocol.org:3478' };
  loglevel?: log.LogLevelDesc;
}

export default class Client extends EventEmitter {
  config: RTCConfiguration;
  url: string;
  uid: string;
  rid: string | undefined;
  protoo: protoo.Peer;
  pcs: { [name: string]: RTCPeerConnection };
  senders: { [name: string]: RTCRtpSender[] };

  constructor(url: string, config: Config) {
    super();
    log.setLevel(config.loglevel !== undefined ? config.loglevel : log.levels.WARN);
    this.config = {
      iceServers: [config.ice !== undefined ? config.ice : { urls: 'stun:stun.stunprotocol.org:3478' }],
    };
    this.uid = uuidv4();
    this.url = this.getProtooUrl(url, this.uid);
    this.pcs = {};
    this.senders = {};

    const transport = new protoo.WebSocketTransport(this.url);
    this.protoo = new protoo.Peer(transport);

    this.protoo.on('open', () => {
      log.info('Peer "open" event');
      this.emit('transport-open');
    });

    this.protoo.on('disconnected', () => {
      log.info('Peer "disconnected" event');
      this.emit('transport-failed');
    });

    this.protoo.on('close', () => {
      log.info('Peer "close" event');
      this.emit('transport-closed');
    });

    this.protoo.on('request', this.onRequest);
    this.protoo.on('notification', this.onNotification);
  }

  async join(roomId: string, info = { name: 'Guest' }) {
    this.rid = roomId;
    try {
      const data = await this.protoo.request('join', {
        rid: this.rid,
        uid: this.uid,
        info,
      });
      log.debug('join success: result => ' + JSON.stringify(data));
    } catch (error) {
      log.debug('join reject: error =>' + error);
    }
  }

  async leave() {
    try {
      const data = await this.protoo.request('leave', {
        rid: this.rid,
        uid: this.uid,
      });
      log.debug('leave success: result => ' + JSON.stringify(data));
    } catch (error) {
      log.debug('leave reject: error =>' + error);
    }
  }

  async publish(
    stream: MediaStream,
    options = {
      audio: true,
      video: true,
      screen: false,
      codec: 'h264',
      resolution: 'hd',
      bandwidth: 1024,
    },
  ): Promise<string> {
    log.debug('publish optiond => %o', options);
    return new Promise(async (resolve, reject) => {
      try {
        let sendOffer = true;
        const pc = new RTCPeerConnection(this.config);
        const senders = stream.getTracks().map((track) => pc.addTrack(track, stream));
        const offer = await pc.createOffer({
          offerToReceiveVideo: false,
          offerToReceiveAudio: false,
        });
        const desc = this.createDescription(offer, options.codec);
        pc.setLocalDescription(desc);
        pc.onicecandidate = async () => {
          if (sendOffer) {
            log.debug('Send offer');
            sendOffer = false;
            const jsep = pc.localDescription;
            const result = await this.protoo.request('publish', {
              rid: this.rid,
              jsep,
              options,
            });
            await pc.setRemoteDescription(result?.jsep);
            this.pcs[result!.mid] = pc;
            this.senders[result!.mid] = senders;
            resolve(result!.mid);
          }
        };
        pc.onnegotiationneeded = async () => {
          log.info('negotiation needed');
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  updateTracks(mid: string, tracks: MediaStreamTrack[]) {
    this.pcs[mid].getSenders().forEach(async (sender: RTCRtpSender) => {
      const nextTrack = tracks.find((track: MediaStreamTrack) => track.kind === sender?.track?.kind);

      // stop existing track (turns off camera light)
      sender.track?.stop();
      if (nextTrack) {
        sender.replaceTrack(nextTrack);
      }
    });
  }

  async unpublish(mid: string) {
    log.debug('unpublish rid => %s, mid => %s', this.rid, mid);
    this.remove(mid);
    try {
      const data = await this.protoo.request('unpublish', {
        rid: this.rid,
        mid,
      });
      log.debug('unpublish success: result => ' + JSON.stringify(data));
    } catch (error) {
      log.debug('unpublish reject: error =>' + error);
    }
  }

  async subscribe(rid: string, mid: string): Promise<MediaStream> {
    log.debug('subscribe rid => %s, mid => %s', rid, mid);
    return new Promise(async (resolve, reject) => {
      try {
        let sendOffer = true;
        log.debug('create receiver => %s', this.uid);
        const pc = new RTCPeerConnection(this.config);
        pc.addTransceiver('audio', { direction: 'recvonly' });
        pc.addTransceiver('video', { direction: 'recvonly' });
        const desc = await pc.createOffer();
        pc.setLocalDescription(desc);
        this.pcs[this.uid] = pc;
        pc.onnegotiationneeded = () => {
          log.debug('negotiation needed');
        };
        pc.ontrack = ({ track, streams }: RTCTrackEvent) => {
          log.debug('on track called');
          // once media for a remote track arrives, show it in the remote video element
          track.onunmute = () => {
            resolve(streams[0]);
          };
        };
        pc.onicecandidate = async (e: RTCPeerConnectionIceEvent) => {
          if (sendOffer) {
            log.debug('Send offer');
            sendOffer = false;
            const jsep = pc.localDescription;
            const result = await this.protoo.request('subscribe', {
              rid,
              jsep,
              mid,
            });
            log.info(`subscribe success => result(mid: ${result!.mid})`);
            await pc.setRemoteDescription(result?.jsep);
          }
        };
      } catch (error) {
        log.debug('subscribe request error  => ' + error);
        reject(error);
      }
    });
  }

  async unsubscribe(rid: string, mid: string) {
    log.debug('unsubscribe rid => %s, mid => %s', rid, mid);
    try {
      await this.protoo.request('unsubscribe', { rid, mid });
      log.debug('unsubscribe success');
      this.remove(mid);
    } catch (error) {
      log.debug('unsubscribe reject: error =>' + error);
    }
  }

  async broadcast(rid: string, info: any) {
    try {
      const data = await this.protoo.request('broadcast', {
        rid,
        uid: this.uid,
        info,
      });
      log.info('broadcast success: result => ' + JSON.stringify(data));
    } catch (error) {
      log.debug('broadcast reject: error =>' + error);
    }
  }

  close() {
    this.protoo.close();
  }

  private createDescription(desc: RTCSessionDescriptionInit, codec: string) {
    if (codec === undefined) return desc;

    /*
     * DefaultPayloadTypePCMU = 0
     * DefaultPayloadTypePCMA = 8
     * DefaultPayloadTypeG722 = 9
     * DefaultPayloadTypeOpus = 111
     * DefaultPayloadTypeVP8  = 96
     * DefaultPayloadTypeVP9  = 98
     * DefaultPayloadTypeH264 = 102
     */
    let payload;
    let codeName = '';
    const session = sdpTransform.parse(desc?.sdp as string);
    log.debug('SDP object => %o', session);

    const videoIdx = session.media.findIndex(({ type }) => type === 'video');
    if (videoIdx === -1) return desc;

    if (codec.toLowerCase() === 'vp8') {
      payload = DefaultPayloadTypeVP8;
      codeName = 'VP8';
    } else if (codec.toLowerCase() === 'vp9') {
      payload = DefaultPayloadTypeVP9;
      codeName = 'VP9';
    } else if (codec.toLowerCase() === 'h264') {
      payload = DefaultPayloadTypeH264;
      codeName = 'H264';
    } else {
      return desc;
    }

    log.debug('Setup codec => ' + codeName + ', payload => ' + payload);

    const rtp = [
      { payload, codec: codeName, rate: 90000, encoding: undefined },
      // { "payload": 97, "codec": "rtx", "rate": 90000, "encoding": null }
    ];

    session.media[videoIdx].payloads = `${payload}`; // + " 97";
    session.media[videoIdx].rtp = rtp;

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

    desc.sdp = sdpTransform.write(session);
    return desc;
  }

  private remove(mid: string) {
    const pc = this.pcs[mid];
    if (pc) {
      log.debug('remove pc mid => %s', mid);
      this.senders[mid].forEach(pc.removeTrack);
      delete this.senders[mid];
      pc.onicecandidate = null;
      pc.close();
      delete this.pcs[mid];
    }
  }

  private getProtooUrl(baseUrl: string, pid: string) {
    return `${baseUrl}/ws?peer=${pid}`;
  }

  private onRequest = (request: protoo.Request) => {
    log.debug('Handle request from server: [method:%s, data:%o]', request.method, request.data);
  };

  private onNotification = (notification: IonNotification) => {
    const { method, data } = notification;
    log.info('Handle notification from server: [method:%s, data:%o]', method, data);
    switch (method) {
      case 'peer-join': {
        const { rid, uid, info } = data;
        log.debug('peer-join peer rid => %s, uid => %s, info => %o', rid, uid, info);
        this.emit('peer-join', rid, uid, info);
        break;
      }
      case 'peer-leave': {
        const { rid, uid } = data;
        log.debug('peer-leave peer rid => %s, uid => %s', rid, uid);
        this.emit('peer-leave', rid, uid);
        break;
      }
      case 'stream-add': {
        const { rid, mid, info } = data;
        log.debug('stream-add peer rid => %s, mid => %s', rid, mid);
        this.emit('stream-add', rid, mid, info);
        break;
      }
      case 'stream-remove': {
        const { rid, mid } = data;
        log.debug('stream-remove peer rid => %s, mid => %s', rid, mid);
        this.emit('stream-remove', rid, mid);
        this.remove(mid as string);
        break;
      }
      case 'broadcast': {
        const { rid, uid, info } = data;
        log.debug('broadcast peer rid => %s, uid => %s', rid, uid);
        this.emit('broadcast', rid, uid, info);
        break;
      }
    }
  };
}
