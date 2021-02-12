import { v4 as uuidv4 } from 'uuid';
import { Signal } from '.';
import { Trickle } from '../client';

class IonSFUJSONRPCSignal implements Signal {
  protected socket: WebSocket;
  private _onopen?: () => void;
  private _onclose?: (ev: Event) => void;
  private _onerror?: (error: Event) => void;
  onnegotiate?: (jsep: RTCSessionDescriptionInit) => void;
  ontrickle?: (trickle: Trickle) => void;

  constructor(uri: string) {
    this.socket = new WebSocket(uri);

    this.socket.addEventListener('open', () => {
      if (this._onopen) this._onopen();
    });

    this.socket.addEventListener('error', (e) => {
      if (this._onerror) this._onerror(e);
    });

    this.socket.addEventListener('close', (e) => {
      if (this._onclose) this._onclose(e);
    });

    this.socket.addEventListener('message', async (event) => {
      const resp = JSON.parse(event.data);
      if (resp.method === 'offer') {
        if (this.onnegotiate) this.onnegotiate(resp.params);
      } else if (resp.method === 'trickle') {
        if (this.ontrickle) this.ontrickle(resp.params);
      }
    });
  }

  // JsonRPC2 Call
  async call<T>(method: string, params: any): Promise<T> {
    const id = uuidv4();
    this.socket.send(
      JSON.stringify({
        method,
        params,
        id,
      }),
    );

    return new Promise<T>((resolve, reject) => {
      const handler = (event: MessageEvent<any>) => {
        const resp = JSON.parse(event.data);
        if (resp.id === id) {
          if (resp.error) reject(resp.error);
          else resolve(resp.result);
          this.socket.removeEventListener('message', handler);
        }
      };
      this.socket.addEventListener('message', handler);
    });
  }

  // JsonRPC2 Notification
  notify(method: string, params: any) {
    this.socket.send(
      JSON.stringify({
        method,
        params,
      }),
    );
  }

  async join(sid: string, uid: string, offer: RTCSessionDescriptionInit) {
    return this.call<RTCSessionDescriptionInit>('join', { sid, uid, offer });
  }

  trickle(trickle: Trickle) {
    this.notify('trickle', trickle);
  }

  async offer(offer: RTCSessionDescriptionInit) {
    return this.call<RTCSessionDescriptionInit>('offer', { desc: offer });
  }

  answer(answer: RTCSessionDescriptionInit) {
    this.notify('answer', { desc: answer });
  }

  close() {
    this.socket.close();
  }

  set onopen(onopen: () => void) {
    if (this.socket.readyState === WebSocket.OPEN) {
      onopen();
    }
    this._onopen = onopen;
  }
  set onerror(onerror: (error: Event) => void) {
    this._onerror = onerror;
  }
  set onclose(onclose: (ev: Event) => void) {
    this._onclose = onclose;
  }
}

export { IonSFUJSONRPCSignal };
