import { EventEmitter } from 'events';
import { Peer, Request, WebSocketTransport } from 'protoo-client';
import { v4 as uuidv4 } from 'uuid';
import * as log from 'loglevel';

import { LocalStream, RemoteStream, Stream } from './stream';
import WebRTCTransport from './transport';
import {TrackInfo, Notification} from './proto';

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

    if (!config || !config.url) {
      throw new Error('Undefined config or config.url in ion-sdk.');
    }

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
      log.info('join success: result => ' + JSON.stringify(data));
    } catch (error) {
      log.error('join reject: error =>' + error);
    }
  }

  async publish(stream: LocalStream) {
    if (!this.rid) {
      throw new Error('You must join a room before publishing.');
    }
    this.local = stream;
    return await stream.publish(this.rid);
  }

  async subscribe(mid: string, tracks: Map<string, Array<TrackInfo>>): Promise<RemoteStream> {
    if (!this.rid) {
      throw new Error('You must join a room before subscribing.');
    }
    if (tracks.size == 0) {
      throw new Error('Subscribe tracks can not be enpty.');
    }
    const stream = await RemoteStream.getRemoteMedia(this.rid, mid, tracks);
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
      log.info('leave success: result => ' + JSON.stringify(data));
    } catch (error) {
      log.error('leave reject: error =>' + error);
    }
  }

  close() {
    this.dispatch.close();
  }

  private onRequest = (request: Request) => {
    log.debug('Handle request from server: [method:%s, data:%o]', request.method, request.data);
  };

  private onNotification = (notification: Notification) => {
    const { method, data } = notification;
    log.info('Handle notification from server: [method:%s, data:%o]', method, data);
    switch (method) {
      case 'peer-join': {
        const { uid, info } = data;
        this.emit('peer-join', uid, info);
        break;
      }
      case 'peer-leave': {
        const { uid } = data;
        this.emit('peer-leave', uid);
        break;
      }
      case 'stream-add': {
        const { mid, info, tracks } = data;
        const trackMap = objToStrMap(tracks);
        this.emit('stream-add', mid, info, trackMap);
        break;
      }
      case 'stream-remove': {
        const { mid } = data;
        const stream = this.streams[mid!];
        this.emit('stream-remove', stream);
        stream.close();
        break;
      }
      case 'broadcast': {
        const { uid, info } = data;
        this.emit('broadcast', uid, info);
        break;
      }
    }
  };
}

function objToStrMap(obj: any) {
  let strMap = new Map();
  for (let k of Object.keys(obj)) {
    strMap.set(k, obj[k]);
  }
  return strMap;
}
