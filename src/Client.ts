import { EventEmitter } from 'events';
import * as protoo from 'protoo-client';
import { v4 as uuidv4 } from 'uuid';
import * as sdpTransform from 'sdp-transform';
import * as log from 'loglevel';

const ices = 'stun:stun.stunprotocol.org:3478';

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

interface IonRTCPeerConnection extends RTCPeerConnection {
  sendOffer: boolean;
}

export default class Client extends EventEmitter {
  _url: string;
  _uid: string;
  _rid: string | undefined;
  _protoo: protoo.Peer | undefined;
  _pcs: { [name: string]: RTCPeerConnection };
  _streams: { [name: string]: MediaStream };

  constructor(url: string, level = log.levels.WARN) {
    super();
    log.setLevel(level);
    this._uid = uuidv4();
    this._url = this._getProtooUrl(url, this._uid);
    this._pcs = {};
    this._streams = {};
  }

  get uid() {
    return this._uid;
  }

  init() {
    const transport = new protoo.WebSocketTransport(this._url);
    this._protoo = new protoo.Peer(transport);

    this._protoo?.on('open', () => {
      log.info('Peer "open" event');
      this.emit('transport-open');
    });

    this._protoo?.on('disconnected', () => {
      log.info('Peer "disconnected" event');
      this.emit('transport-failed');
    });

    this._protoo?.on('close', () => {
      log.info('Peer "close" event');
      this.emit('transport-closed');
    });

    this._protoo?.on('request', this._handleRequest.bind(this));
    this._protoo?.on('notification', this._handleNotification.bind(this));
  }

  async join(roomId: string, info = { name: 'Guest' }) {
    this._rid = roomId;
    try {
      const data = await this._protoo?.request('join', {
        rid: this._rid,
        uid: this._uid,
        info,
      });
      log.debug('join success: result => ' + JSON.stringify(data));
    } catch (error) {
      log.debug('join reject: error =>' + error);
    }
  }

  async leave() {
    try {
      const data = await this._protoo?.request('leave', {
        rid: this._rid,
        uid: this._uid,
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
        const pc = await this._createSender(stream, options.codec);
        pc.onicecandidate = async () => {
          if (pc.sendOffer) {
            const jsep = pc.localDescription;
            log.debug('Send offer');
            pc.sendOffer = false;
            const result = await this._protoo?.request('publish', {
              rid: this._rid,
              jsep,
              options,
            });
            await pc.setRemoteDescription(result?.jsep);
            log.debug('publish success ', result?.mid);
            this._streams[result?.mid] = stream;
            this._pcs[result?.mid] = pc;
            resolve(result?.mid);
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  updateTracks(mid: string, tracks: MediaStreamTrack[]) {
    this._pcs[mid].getSenders().forEach(async (sender: RTCRtpSender) => {
      const nextTrack = tracks.find((track: MediaStreamTrack) => track.kind === sender?.track?.kind);

      // stop existing track (turns off camera light)
      sender.track?.stop();
      if (nextTrack) {
        sender.replaceTrack(nextTrack);
      }
    });
  }

  async unpublish(mid: string) {
    log.debug('unpublish rid => %s, mid => %s', this._rid, mid);
    this._removePC(mid);
    try {
      const data = await this._protoo?.request('unpublish', {
        rid: this._rid,
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
        const pc = await this._createReceiver(mid);
        let subMid = '';
        // @ts-ignore : deprecated api
        pc.onaddstream = (e: any) => {
          log.debug('Stream::pc::onaddstream', subMid);
          this._streams[subMid] = e.stream;
          resolve(e.stream);
        };
        pc.onnegotiationneeded = () => {
          log.debug('negotiation needed');
        };
        pc.ontrack = () => {
          log.debug('on track called');
        };
        // @ts-ignore : deprecated api
        pc.onremovestream = (e: any) => {
          const stream = e.stream;
          log.debug('Stream::pc::onremovestream', stream.id);
        };
        // @ts-ignore : deprecated api
        pc.onicecandidate = async (e: any) => {
          // @ts-ignore : deprecated api
          if (pc.sendOffer) {
            const jsep = pc.localDescription;
            log.debug('Send offer');
            // @ts-ignore : deprecated api
            pc.sendOffer = false;
            const result = await this._protoo?.request('subscribe', {
              rid,
              jsep,
              mid,
            });
            subMid = result?.mid;
            log.info(`subscribe success => result(mid: ${subMid})`);
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
      await this._protoo?.request('unsubscribe', { rid, mid });
      log.debug('unsubscribe success');
      this._removePC(mid);
    } catch (error) {
      log.debug('unsubscribe reject: error =>' + error);
    }
  }

  async broadcast(rid: string, info: any) {
    try {
      const data = await this._protoo?.request('broadcast', {
        rid,
        uid: this._uid,
        info,
      });
      log.info('broadcast success: result => ' + JSON.stringify(data));
    } catch (error) {
      log.debug('broadcast reject: error =>' + error);
    }
  }

  close() {
    this._protoo?.close();
  }

  _payloadModify(desc: RTCSessionDescriptionInit, codec: string) {
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
    let videoIdx = -1;
    session.media.map((m, index) => {
      if (m.type === 'video') {
        videoIdx = index;
      }
    });

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

    session.media[videoIdx].payloads = '' + payload; // + " 97";
    session.media[videoIdx].rtp = rtp;

    const fmtp: any[] = [
      // { "payload": 97, "config": "apt=" + payload }
    ];

    session.media[videoIdx].fmtp = fmtp;

    const rtcpFB = [
      { payload, type: 'transport-cc', subtype: null },
      { payload, type: 'ccm', subtype: 'fir' },
      { payload, type: 'nack', subtype: null },
      { payload, type: 'nack', subtype: 'pli' },
    ];
    // @ts-ignore
    session.media[videoIdx].rtcpFb = rtcpFB;

    // @ts-ignore
    const ssrcGroup = session.media[videoIdx].ssrcGroups[0];
    const ssrcs = ssrcGroup.ssrcs;
    const videoSsrc = ssrcs.split(' ')[0];
    log.debug('ssrcs => %s, video %s', ssrcs, videoSsrc);

    let newSsrcs = session.media[videoIdx].ssrcs;
    // @ts-ignore
    newSsrcs = newSsrcs.filter((item) => item.id === videoSsrc);

    session.media[videoIdx].ssrcGroups = [];
    session.media[videoIdx].ssrcs = newSsrcs;

    const tmp = desc;
    tmp.sdp = sdpTransform.write(session);
    return tmp;
  }

  async _createSender(stream: MediaStream, codec: string) {
    log.debug('create sender => %s', codec);
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: ices }],
    }) as IonRTCPeerConnection;
    pc.sendOffer = true;
    // @ts-ignore
    pc.addStream(stream);
    const offer = await pc.createOffer({
      offerToReceiveVideo: false,
      offerToReceiveAudio: false,
    });
    const desc = this._payloadModify(offer, codec);
    pc.setLocalDescription(desc);
    return pc;
  }

  async _createReceiver(uid: string): Promise<IonRTCPeerConnection> {
    log.debug('create receiver => %s', uid);
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: ices }],
    }) as IonRTCPeerConnection;
    pc.sendOffer = true;
    pc.addTransceiver('audio', { direction: 'recvonly' });
    pc.addTransceiver('video', { direction: 'recvonly' });
    const desc = await pc.createOffer();
    pc.setLocalDescription(desc);
    this._pcs[uid] = pc;
    return pc;
  }

  _removePC(id: string) {
    const pc = this._pcs[id];
    if (pc) {
      log.debug('remove pc mid => %s', id);
      const stream = this._streams[id];
      if (stream) {
        // @ts-ignore : deprecated api
        pc.removeStream(stream);
        delete this._streams[id];
      }
      // @ts-ignore : deprecated api
      pc.onicecandidate = null;
      // @ts-ignore : deprecated api
      pc.onaddstream = null;
      // @ts-ignore : deprecated api
      pc.onremovestream = null;
      pc.close();
      // pc = null;
      delete this._pcs[id];
    }
  }

  _getProtooUrl(baseUrl: string, pid: string) {
    return `${baseUrl}/ws?peer=${pid}`;
  }

  _handleRequest(request: protoo.Request) {
    log.debug('Handle request from server: [method:%s, data:%o]', request.method, request.data);
  }

  _handleNotification(notification: IonNotification) {
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
        this._removePC(mid as string);
        break;
      }
      case 'broadcast': {
        const { rid, uid, info } = data;
        log.debug('broadcast peer rid => %s, uid => %s', rid, uid);
        this.emit('broadcast', rid, uid, info);
        break;
      }
    }
  }
}
