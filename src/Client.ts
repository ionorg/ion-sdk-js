import { EventEmitter } from "events";
import * as protoo from "protoo-client";
import { v4 as uuidv4 } from "uuid";
import * as sdpTransform from "sdp-transform";

const ices = "stun:stun.stunprotocol.org:3478";

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

export default class Client extends EventEmitter {
  _url: string | undefined;
  _port: number;
  _uid: string;
  _rid: string | undefined;
  _protoo: protoo.Peer | undefined;
  _pcs: { [name: string]: RTCPeerConnection };
  _streams: { [name: string]: MediaStream };

  constructor() {
    super();
    this._port = 8443;
    this._uid = uuidv4();
    this._pcs = {};
    this._streams = {};
  }

  get uid() {
    return this._uid;
  }

  init() {
    this._url = this._getProtooUrl(this._uid);

    const transport = new protoo.WebSocketTransport(this._url);
    this._protoo = new protoo.Peer(transport);

    this._protoo?.on("open", () => {
      console.log('Peer "open" event');
      this.emit("transport-open");
    });

    this._protoo?.on("disconnected", () => {
      console.log('Peer "disconnected" event');
      this.emit("transport-failed");
    });

    this._protoo?.on("close", () => {
      console.log('Peer "close" event');
      this.emit("transport-closed");
    });

    this._protoo?.on("request", this._handleRequest.bind(this));
    this._protoo?.on("notification", this._handleNotification.bind(this));
  }

  async join(roomId: string, info = { name: "Guest" }) {
    this._rid = roomId;
    try {
      let data = await this._protoo?.request("join", {
        rid: this._rid,
        uid: this._uid,
        info
      });
      console.log("join success: result => " + JSON.stringify(data));
    } catch (error) {
      console.log("join reject: error =>" + error);
    }
  }

  async leave() {
    try {
      let data = await this._protoo?.request("leave", {
        rid: this._rid,
        uid: this._uid
      });
      console.log("leave success: result => " + JSON.stringify(data));
    } catch (error) {
      console.log("leave reject: error =>" + error);
    }
  }

  async publish(
    stream: MediaStream,
    options = {
      audio: true,
      video: true,
      screen: false,
      codec: "h264",
      resolution: "hd",
      bandwidth: 1024
    }
  ) {
    console.log("publish optiond => %o", options);
    try {
      let pc = await this._createSender(stream, options.codec);

      pc.onicecandidate = async () => {
        // @ts-ignore
        if (!pc.sendOffer) {
          var offer = pc.localDescription;
          console.log("Send offer");
          // @ts-ignore
          pc.sendOffer = true;
          let result = await this._protoo?.request("publish", {
            rid: this._rid,
            jsep: offer,
            options
          });
          await pc.setRemoteDescription(result?.jsep);
          console.log("publish success => " + JSON.stringify(result));
          // this._streams[stream.mid] = stream;
          // this._pcs[stream.mid] = pc;
          return stream;
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async unpublish(mid: string) {
    console.log("unpublish rid => %s, mid => %s", this._rid, mid);
    this._removePC(mid);
    try {
      let data = await this._protoo?.request("unpublish", {
        rid: this._rid,
        mid
      });
      console.log("unpublish success: result => " + JSON.stringify(data));
    } catch (error) {
      console.log("unpublish reject: error =>" + error);
    }
  }

  async subscribe(rid: string, mid: string) {
    console.log("subscribe rid => %s, mid => %s", rid, mid);
    var promise = new Promise(async (resolve, reject) => {
      try {
        let pc = await this._createReceiver(mid);
        var sub_mid = "";
        // @ts-ignore : deprecated api
        pc.onaddstream = (e: any) => {
          console.log("Stream::pc::onaddstream", sub_mid);
          this._streams[sub_mid] = e.stream;
          resolve(e.stream);
        };
        // @ts-ignore : deprecated api
        pc.onremovestream = (e: any) => {
          var stream = e.stream;
          console.log("Stream::pc::onremovestream", stream.id);
        };
        // @ts-ignore : deprecated api
        pc.onicecandidate = async (e: any) => {
          // @ts-ignore : deprecated api
          if (!pc.sendOffer) {
            var jsep = pc.localDescription;
            console.log("Send offer");
            // @ts-ignore : deprecated api
            pc.sendOffer = true;
            let result = await this._protoo?.request("subscribe", {
              rid,
              jsep,
              mid
            });
            sub_mid = result?.mid;
            console.log(`subscribe success => result(mid: ${sub_mid})`);
            await pc.setRemoteDescription(result?.jsep);
          }
        };
      } catch (error) {
        console.log("subscribe request error  => " + error);
        reject(error);
      }
    });
    return promise;
  }

  async unsubscribe(rid: string, mid: string) {
    console.log("unsubscribe rid => %s, mid => %s", rid, mid);
    try {
      let data = await this._protoo?.request("unsubscribe", { rid, mid });
      console.log("unsubscribe success: result => " + JSON.stringify(data));
      this._removePC(mid);
    } catch (error) {
      console.log("unsubscribe reject: error =>" + error);
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
    let codeName = "";
    const session = sdpTransform.parse(desc?.sdp as string);
    console.log("SDP object => %o", session);
    var videoIdx = -1;
    session["media"].map((m, index) => {
      if (m.type == "video") {
        videoIdx = index;
      }
    });

    if (videoIdx == -1) return desc;

    if (codec.toLowerCase() === "vp8") {
      payload = DefaultPayloadTypeVP8;
      codeName = "VP8";
    } else if (codec.toLowerCase() === "vp9") {
      payload = DefaultPayloadTypeVP9;
      codeName = "VP9";
    } else if (codec.toLowerCase() === "h264") {
      payload = DefaultPayloadTypeH264;
      codeName = "H264";
    } else {
      return desc;
    }

    console.log("Setup codec => " + codeName + ", payload => " + payload);

    var rtp = [
      { payload: payload, codec: codeName, rate: 90000, encoding: null }
      //{ "payload": 97, "codec": "rtx", "rate": 90000, "encoding": null }
    ];

    session["media"][videoIdx]["payloads"] = "" + payload; //+ " 97";
    // @ts-ignore
    session["media"][videoIdx]["rtp"] = rtp;

    var fmtp: any[] = [
      //{ "payload": 97, "config": "apt=" + payload }
    ];

    session["media"][videoIdx]["fmtp"] = fmtp;

    var rtcpFB = [
      { payload: payload, type: "transport-cc", subtype: null },
      { payload: payload, type: "ccm", subtype: "fir" },
      { payload: payload, type: "nack", subtype: null },
      { payload: payload, type: "nack", subtype: "pli" }
    ];
    // @ts-ignore
    session["media"][videoIdx]["rtcpFb"] = rtcpFB;

    // @ts-ignore
    let ssrcGroup = session["media"][videoIdx].ssrcGroups[0];
    let ssrcs = ssrcGroup.ssrcs;
    let videoSsrc = ssrcs.split(" ")[0];
    console.log("ssrcs => %s, video %s", ssrcs, videoSsrc);

    let newSsrcs = session["media"][videoIdx].ssrcs;
    // @ts-ignore
    newSsrcs = newSsrcs.filter(item => item.id == videoSsrc);

    session["media"][videoIdx].ssrcGroups = [];
    session["media"][videoIdx].ssrcs = newSsrcs;

    let tmp = desc;
    tmp.sdp = sdpTransform.write(session);
    return tmp;
  }

  async _createSender(stream: MediaStream, codec: string) {
    console.log("create sender => %s", codec);
    let pc = new RTCPeerConnection({ iceServers: [{ urls: ices }] });
    // @ts-ignore
    pc.sendOffer = false;
    // @ts-ignore
    pc.addStream(stream);
    let offer = await pc.createOffer({
      offerToReceiveVideo: false,
      offerToReceiveAudio: false
    });
    let desc = this._payloadModify(offer, codec);
    pc.setLocalDescription(desc);
    return pc;
  }

  async _createReceiver(uid: string): Promise<RTCPeerConnection> {
    console.log("create receiver => %s", uid);
    let pc = new RTCPeerConnection({ iceServers: [{ urls: ices }] });
    // @ts-ignore
    pc.sendOffer = false;
    pc.addTransceiver("audio", { direction: "recvonly" });
    pc.addTransceiver("video", { direction: "recvonly" });
    let desc = await pc.createOffer();
    pc.setLocalDescription(desc);
    this._pcs[uid] = pc;
    return pc;
  }

  _removePC(id: string) {
    let pc = this._pcs[id];
    if (pc) {
      console.log("remove pc mid => %s", id);
      let stream = this._streams[id];
      if (stream) {
        // @ts-ignore : deprecated api
        pc.removeStream(stream.stream);
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

  _getProtooUrl(pid: string) {
    const hostname = window.location.hostname;
    const websocketProtocol = location.protocol === "https:" ? "wss" : "ws";
    let url = `${websocketProtocol}://${hostname}:${this._port}/ws?peer=${pid}`;
    return url;
  }

  _handleRequest(request: protoo.Request) {
    console.log(
      "Handle request from server: [method:%s, data:%o]",
      request.method,
      request.data
    );
  }

  _handleNotification(notification: IonNotification) {
    const { method, data } = notification;
    console.log(
      "Handle notification from server: [method:%s, data:%o]",
      method,
      data
    );
    switch (method) {
      case "peer-join": {
        const { rid, uid, info } = data;
        console.log(
          "peer-join peer rid => %s, uid => %s, info => %o",
          rid,
          uid,
          info
        );
        this.emit("peer-join", rid, uid, info);
        break;
      }
      case "peer-leave": {
        const { rid, uid } = data;
        console.log("peer-leave peer rid => %s, uid => %s", rid, uid);
        this.emit("peer-leave", rid, uid);
        break;
      }
      case "stream-add": {
        const { rid, mid, info } = data;
        console.log("stream-add peer rid => %s, mid => %s", rid, mid);
        this.emit("stream-add", rid, mid, info);
        break;
      }
      case "stream-remove": {
        const { rid, mid } = data;
        console.log("stream-remove peer rid => %s, mid => %s", rid, mid);
        this.emit("stream-remove", rid, mid);
        this._removePC(mid as string);
        break;
      }
    }
  }
}
