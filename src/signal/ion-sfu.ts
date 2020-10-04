import { v4 as uuidv4 } from 'uuid';

class IonSFUJSONRPCSignal implements Signal {
  private socket: WebSocket;
  private onNegotiateCb?: (jsep: RTCSessionDescriptionInit) => void;
  private onTrickleCb?: (candidate: RTCIceCandidateInit) => void;

  constructor(uri: string) {
    this.socket = new WebSocket(uri);

    this.socket!.addEventListener('message', async (event) => {
      const resp = JSON.parse(event.data);
      if (resp.method === 'negotiate') {
        this.onNegotiateCb && this.onNegotiateCb(resp.params);
      } else if (resp.method === 'trickle') {
        this.onTrickleCb && this.onTrickleCb(resp.params);
      }
    });
  }

  async join(sid: string, offer: RTCSessionDescriptionInit) {
    const id = uuidv4();
    this.socket.send(
      JSON.stringify({
        id,
        method: 'join',
        params: { sid, offer },
      }),
    );

    return new Promise<RTCSessionDescriptionInit>((resolve, reject) => {
      this.socket.addEventListener('message', (event) => {
        const resp = JSON.parse(event.data);
        if (resp.id === id) {
          resolve(resp.result);
        }
      });
    });
  }

  trickle(candidate: RTCIceCandidateInit) {
    this.socket.send(
      JSON.stringify({
        method: 'trickle',
        params: {
          candidate,
        },
      }),
    );
  }

  negotiate(jsep: RTCSessionDescriptionInit) {
    if (jsep.type === 'offer') {
      this.socket.send(
        JSON.stringify({
          method: 'offer',
          params: { desc: jsep },
        }),
      );
    } else if (jsep.type === 'answer') {
      this.socket.send(
        JSON.stringify({
          method: 'answer',
          params: { desc: jsep },
        }),
      );
    }
  }

  close() {
    this.socket.close();
  }

  onNegotiate(callback: (jsep: RTCSessionDescriptionInit) => void) {
    this.onNegotiateCb = callback;
  }
  onTrickle(callback: (candidate: RTCIceCandidateInit) => void) {
    this.onTrickleCb = callback;
  }
}
