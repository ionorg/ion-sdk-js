import { EventEmitter } from 'events';
import { Peer, Request, WebSocketTransport } from 'protoo-client';
import { v4 as uuidv4 } from 'uuid';
import * as log from 'loglevel';

import { LocalStream, RemoteStream, Stream } from './stream';
import WebRTCTransport from './transport';

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
  rtc?: RTCConfiguration;
  loglevel?: log.LogLevelDesc;
}

export default class Client extends EventEmitter {
  dispatch: Peer;
  uid: string;
  rid: string | undefined;
  local?: LocalStream;
  streams: { [name: string]: RemoteStream };

  constructor(config: Config) {
    super();
    const uid = uuidv4();
    const transport = new WebSocketTransport(`${config.url}/ws?peer=${uid}`);
    log.setLevel(config.loglevel !== undefined ? config.loglevel : log.levels.WARN);

    this.uid = uid;
    this.streams = {};
    this.dispatch = new Peer(transport);

    if (config.rtc) WebRTCTransport.setRTCConfiguration(config.rtc);
    Stream.setDispatch(this.dispatch);

    this.dispatch.on('open', () => {
      log.info('Peer "open" event');
      this.emit('transport-open');
    });

    this.dispatch.on('disconnected', () => {
      log.info('Peer "disconnected" event');
      this.emit('transport-failed');
    });

    this.dispatch.on('close', () => {
      log.info('Peer "close" event');
      this.emit('transport-closed');
    });

    this.dispatch.on('request', this.onRequest);
    this.dispatch.on('notification', this.onNotification);
  }

  broadcast(info: any) {
    return this.dispatch.request('broadcast', {
      rid: this.rid,
      uid: this.uid,
      info,
    });
  }

  async join(rid: string, info = { name: 'Guest' }) {
    this.rid = rid;
    try {
      const data = await this.dispatch.request('join', {
        rid: this.rid,
        uid: this.uid,
        info,
      });
      log.debug('join success: result => ' + JSON.stringify(data));
    } catch (error) {
      log.debug('join reject: error =>' + error);
    }
  }

  async publish(stream: LocalStream) {
    if (!this.rid) {
      throw new Error('You must join a room before publishing.');
    }
    this.local = stream;
    return await stream.publish(this.rid);
  }

  async subscribe(mid: string): Promise<RemoteStream> {
    if (!this.rid) {
      throw new Error('You must join a room before subscribing.');
    }
    const stream = await RemoteStream.getRemoteMedia(this.rid, mid);
    this.streams[mid] = stream;
    return stream;
  }

  async leave() {
    try {
      const data = await this.dispatch.request('leave', {
        rid: this.rid,
        uid: this.uid,
      });
      if (this.local) {
        this.local.unpublish();
      }
      Object.values(this.streams).forEach((stream) => stream.unsubscribe());
      log.debug('leave success: result => ' + JSON.stringify(data));
    } catch (error) {
      log.debug('leave reject: error =>' + error);
    }
  }

  close() {
    this.dispatch.close();
  }

  private onRequest = (request: Request) => {
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
        this.streams[mid!].unsubscribe();
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
