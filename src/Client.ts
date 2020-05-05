import { EventEmitter } from 'events';
import * as protoo from 'protoo-client';
import { v4 as uuidv4 } from 'uuid';
import * as log from 'loglevel';

import WebRTCTransport, { Codec } from './transport';

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
  url: string;
  ice?: RTCConfiguration;
  loglevel?: log.LogLevelDesc;
}

export default class Client extends EventEmitter {
  ice: RTCConfiguration;
  protoo: protoo.Peer;
  uid: string;
  rid: string | undefined;
  transports: { [name: string]: WebRTCTransport };
  senders: { [name: string]: RTCRtpSender[] };

  constructor(config: Config) {
    super();
    const uid = uuidv4();
    const transport = new protoo.WebSocketTransport(`${config.url}/ws?peer=${uid}`);
    log.setLevel(config.loglevel !== undefined ? config.loglevel : log.levels.WARN);

    this.uid = uid;
    this.transports = {};
    this.senders = {};
    this.protoo = new protoo.Peer(transport);
    this.ice =
      config.ice !== undefined
        ? config.ice
        : {
            iceServers: [{ urls: 'stun:stun.stunprotocol.org:3478' }],
          };

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

  broadcast(info: any) {
    return this.protoo.request('broadcast', {
      rid: this.rid,
      uid: this.uid,
      info,
    });
  }

  async join(rid: string, info = { name: 'Guest' }) {
    this.rid = rid;
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

  async publish(stream: MediaStream, codec: Codec): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        let sendOffer = true;
        const transport = new WebRTCTransport({
          ...this.ice,
          codec,
        });
        stream.getTracks().map((track) => transport.addTrack(track, stream));
        const offer = await transport.createOffer();
        transport.setLocalDescription(offer);
        transport.onicecandidate = async () => {
          if (sendOffer) {
            log.debug('Send offer');
            sendOffer = false;
            const jsep = transport.localDescription;
            const result = await this.protoo.request('publish', {
              rid: this.rid,
              jsep,
            });
            await transport.setRemoteDescription(result?.jsep);
            this.transports[result!.mid] = transport;
            resolve(result!.mid);
          }
        };
        transport.onnegotiationneeded = async () => {
          log.info('negotiation needed');
        };
      } catch (error) {
        reject(error);
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
        const transport = new WebRTCTransport(this.ice);
        transport.addTransceiver('audio');
        transport.addTransceiver('video');
        const desc = await transport.createOffer();
        transport.setLocalDescription(desc);
        this.transports[this.uid] = transport;
        transport.onnegotiationneeded = () => {
          log.debug('negotiation needed');
        };
        transport.ontrack = ({ track, streams }: RTCTrackEvent) => {
          log.debug('on track called');
          // once media for a remote track arrives, show it in the remote video element
          track.onunmute = () => {
            resolve(streams[0]);
          };
        };
        transport.onicecandidate = async (e: RTCPeerConnectionIceEvent) => {
          if (sendOffer) {
            log.debug('Send offer');
            sendOffer = false;
            const jsep = transport.localDescription;
            const result = await this.protoo.request('subscribe', {
              rid,
              jsep,
              mid,
            });
            log.info(`subscribe success => result(mid: ${result!.mid})`);
            await transport.setRemoteDescription(result?.jsep);
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

  private remove(mid: string) {
    const transport = this.transports[mid];
    if (transport) {
      log.debug('remove transport mid => %s', mid);
      transport.close();
      delete this.transports[mid];
    }
  }

  async leave() {
    try {
      const data = await this.protoo.request('leave', {
        rid: this.rid,
        uid: this.uid,
      });
      this.protoo.close();
      log.debug('leave success: result => ' + JSON.stringify(data));
    } catch (error) {
      log.debug('leave reject: error =>' + error);
    }
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
