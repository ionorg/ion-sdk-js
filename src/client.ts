import { EventEmitter } from 'events';
import { Peer, Request, WebSocketTransport, ProtooOptions } from 'protoo-client';
import { v4 as uuidv4 } from 'uuid';
import * as log from 'loglevel';

import { LocalStream, RemoteStream, Stream } from './stream';
import WebRTCTransport from './transport';
import { TrackInfo, Notification } from './proto';

interface Config {
  url: string;
  uid?: string;
  options?: ProtooOptions;
  rtc?: RTCConfiguration;
  loglevel?: log.LogLevelDesc;
}

export default class Client extends EventEmitter {
  dispatch: Peer;
  uid: string;
  rid: string | undefined;
  localStreams: LocalStream[];
  streams: { [name: string]: RemoteStream };
  knownStreams: Map<string, Map<string, TrackInfo[]>>;

  constructor(config: Config) {
    super();
    const uid = config.uid ? config.uid : uuidv4();

    if (!config || !config.url) {
      throw new Error('Undefined config or config.url in ion-sdk.');
    }

    const url = new URL(config.url);
    url.searchParams.append('peer', uid);
    const transport = new WebSocketTransport(url.toString(), config.options);
    log.setLevel(config.loglevel !== undefined ? config.loglevel : log.levels.WARN);

    this.knownStreams = new Map();
    this.uid = uid;
    this.streams = {};
    this.localStreams = [];
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
    this.localStreams?.push(stream);
    return await stream.publish(this.rid);
  }

  async unpublish(stream: LocalStream) {
    if (!stream) {
      throw new Error('Undefined LocalStream in unpublish.')
    }
    this.localStreams = this.localStreams.filter(localStream => localStream !== stream)
    return await stream.unpublish()
  }

  async subscribe(mid: string): Promise<RemoteStream> {
    if (!this.rid) {
      throw new Error('You must join a room before subscribing.');
    }
    const tracks = this.knownStreams.get(mid);
    if (!tracks) {
      throw new Error('Subscribe mid is not known.');
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
      for (const localStream of this.localStreams) {
        if (localStream.mid) {
          await localStream.unpublish()
        }
      }
      this.localStreams = []
      Object.values(this.streams).forEach((stream) => stream.unsubscribe());
      this.knownStreams.clear();
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
        if (mid) {
          const trackMap: Map<string, TrackInfo[]> = objToStrMap(tracks);
          this.knownStreams.set(mid, trackMap);
        }
        this.emit('stream-add', mid, info);
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
  const strMap = new Map();
  for (const k of Object.keys(obj)) {
    strMap.set(k, obj[k]);
  }
  return strMap;
}
