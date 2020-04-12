import { EventEmitter } from "events";
import * as protoo from "protoo-client";
import { v4 as uuidv4 } from "uuid";
import * as sdpTransform from "sdp-transform";
import * as log from "loglevel";

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

interface IonRTCPeerConnection extends RTCPeerConnection {
  sendOffer: boolean;
}

export default class Client extends EventEmitter {
  _debug: boolean;
  _url: string;
  _uid: string;
  _rid: string | undefined;
  _protoo: protoo.Peer | undefined;
  _pcs: { [name: string]: RTCPeerConnection };
  _streams: { [name: string]: MediaStream };

  constructor(url: string, debug = false) {
    super();
    this._debug = debug;
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

    this._protoo?.on("open", () => {
      log.info('Peer "open" event');
      this.emit("transport-open");
    });

    this._protoo?.on("disconnected", () => {
      log.info('Peer "disconnected" event');
      this.emit("transport-failed");
    });

    this._protoo?.on("close", () => {
      log.info('Peer "close" event');
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
        info,
      });
      log.debug("join success: result => " + JSON.stringify(data));
    } catch (error) {
      log.debug("join reject: error =>" + error);
    }
  }

  async leave() {
    try {
      let data = await this._protoo?.request("leave", {
        rid: this._rid,
        uid: this._uid,
      });
      log.debug("leave success: result => " + JSON.stringify(data));
    } catch (error) {
      log.debug("leave reject: error =>" + error);
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
      bandwidth: 1024,
    }
  ): Promise<string> {
    log.debug("publish optiond => %o", options);
    return new Promise(async (resolve, reject) => {
      try {
        let pc = await this._createSender(stream, options.codec);
        pc.onicecandidate = async () => {
          if (pc.sendOffer) {
            var offer = pc.localDescription;
            log.debug("Send offer");
            pc.sendOffer = false;
            let result = await this._protoo?.request("publish", {
              rid: this._rid,
              jsep: offer,
              options,
            });
            await pc.setRemoteDescription(result?.jsep);
            log.debug("publish success ", result?.mid);
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
      const nextTrack = tracks.find(
        (track: MediaStreamTrack) => track.kind === sender?.track?.kind
      );

      // stop existing track (turns off camera light)
      sender.track?.stop();
      if (nextTrack) {
        sender.replaceTrack(nextTrack);
      }
    });
  }

  async unpublish(mid: string) {
    log.debug("unpublish rid => %s, mid => %s", this._rid, mid);
    this._removePC(mid);
    try {
      let data = await this._protoo?.request("unpublish", {
        rid: this._rid,
        mid,
      });
      log.debug("unpublish success: result => " + JSON.stringify(data));
    } catch (error) {
      log.debug("unpublish reject: error =>" + error);
    }
  }

  async subscribe(rid: string, mid: string): Promise<MediaStream> {
    log.debug("subscribe rid => %s, mid => %s", rid, mid);
    return new Promise(async (resolve, reject) => {
      try {
        let pc = await this._createReceiver(mid);
        var sub_mid = "";
        // @ts-ignore : deprecated api
        pc.onaddstream = (e: any) => {
          log.debug("Stream::pc::onaddstream", sub_mid);
          this._streams[sub_mid] = e.stream;
          resolve(e.stream);
        };
        pc.onnegotiationneeded = () => {
          console.log("negotiation needed");
        };
        pc.ontrack = () => {
          console.log("on track called");
        };
        // @ts-ignore : deprecated api
        pc.onremovestream = (e: any) => {
          var stream = e.stream;
          log.debug("Stream::pc::onremovestream", stream.id);
        };
        // @ts-ignore : deprecated api
        pc.onicecandidate = async (e: any) => {
          // @ts-ignore : deprecated api
          if (pc.sendOffer) {
            var jsep = pc.localDescription;
            log.debug("Send offer");
            // @ts-ignore : deprecated api
            pc.sendOffer = false;
            let result = await this._protoo?.request("subscribe", {
              rid,
              jsep,
              mid,
            });
            sub_mid = result?.mid;
            if (this._debug)
              console.log(`subscribe success => result(mid: ${sub_mid})`);
            await pc.setRemoteDescription(result?.jsep);
          }
        };
      } catch (error) {
        log.debug("subscribe request error  => " + error);
        reject(error);
      }
    });
  }

  async unsubscribe(rid: string, mid: string) {
    log.debug("unsubscribe rid => %s, mid => %s", rid, mid);
    try {
      await this._protoo?.request("unsubscribe", { rid, mid });
      log.debug("unsubscribe success");
      this._removePC(mid);
    } catch (error) {
      log.debug("unsubscribe reject: error =>" + error);
    }
  }

  async broadcast(rid: string, info: any) {
    try {
      let data = await this._protoo?.request("broadcast", {
        rid: rid,
        uid: this._uid,
        info,
      });
      if (this._debug)
        console.log("broadcast success: result => " + JSON.stringify(data));
    } catch (error) {
      log.debug("broadcast reject: error =>" + error);
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
    log.debug("SDP object => %o", session);
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

    log.debug("Setup codec => " + codeName + ", payload => " + payload);

    var rtp = [
      { payload: payload, codec: codeName, rate: 90000, encoding: undefined },
      //{ "payload": 97, "codec": "rtx", "rate": 90000, "encoding": null }
    ];

    session["media"][videoIdx]["payloads"] = "" + payload; //+ " 97";
    session["media"][videoIdx]["rtp"] = rtp;

    var fmtp: any[] = [
      //{ "payload": 97, "config": "apt=" + payload }
    ];

    session["media"][videoIdx]["fmtp"] = fmtp;

    var rtcpFB = [
      { payload: payload, type: "transport-cc", subtype: null },
      { payload: payload, type: "ccm", subtype: "fir" },
      { payload: payload, type: "nack", subtype: null },
      { payload: payload, type: "nack", subtype: "pli" },
    ];
    // @ts-ignore
    session["media"][videoIdx]["rtcpFb"] = rtcpFB;

    // @ts-ignore
    let ssrcGroup = session["media"][videoIdx].ssrcGroups[0];
    let ssrcs = ssrcGroup.ssrcs;
    let videoSsrc = ssrcs.split(" ")[0];
    log.debug("ssrcs => %s, video %s", ssrcs, videoSsrc);

    let newSsrcs = session["media"][videoIdx].ssrcs;
    // @ts-ignore
    newSsrcs = newSsrcs.filter((item) => item.id == videoSsrc);

    session["media"][videoIdx].ssrcGroups = [];
    session["media"][videoIdx].ssrcs = newSsrcs;

    let tmp = desc;
    tmp.sdp = sdpTransform.write(session);
    return tmp;
  }

  async _createSender(stream: MediaStream, codec: string) {
    log.debug("create sender => %s", codec);
    let pc = new RTCPeerConnection({
      iceServers: [{ urls: ices }],
    }) as IonRTCPeerConnection;
    pc.sendOffer = true;
    // @ts-ignore
    pc.addStream(stream);
    let offer = await pc.createOffer({
      offerToReceiveVideo: false,
      offerToReceiveAudio: false,
    });
    let desc = this._payloadModify(offer, codec);
    pc.setLocalDescription(desc);
    return pc;
  }

  async _createReceiver(uid: string): Promise<IonRTCPeerConnection> {
    log.debug("create receiver => %s", uid);
    let pc = new RTCPeerConnection({
      iceServers: [{ urls: ices }],
    }) as IonRTCPeerConnection;
    pc.sendOffer = true;
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
      log.debug("remove pc mid => %s", id);
      let stream = this._streams[id];
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
    log.debug(
      "Handle request from server: [method:%s, data:%o]",
      request.method,
      request.data
    );
  }

  _handleNotification(notification: IonNotification) {
    const { method, data } = notification;
    log.info(
      "Handle notification from server: [method:%s, data:%o]",
      method,
      data
    );
    switch (method) {
      case "peer-join": {
        const { rid, uid, info } = data;
        log.debug(
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
        log.debug("peer-leave peer rid => %s, uid => %s", rid, uid);
        this.emit("peer-leave", rid, uid);
        break;
      }
      case "stream-add": {
        const { rid, mid, info } = data;
        log.debug("stream-add peer rid => %s, mid => %s", rid, mid);
        this.emit("stream-add", rid, mid, info);
        break;
      }
      case "stream-remove": {
        const { rid, mid } = data;
        log.debug("stream-remove peer rid => %s, mid => %s", rid, mid);
        this.emit("stream-remove", rid, mid);
        this._removePC(mid as string);
        break;
      }
      case "broadcast": {
        const { rid, uid, info } = data;
        log.debug("broadcast peer rid => %s, uid => %s", rid, uid);
        this.emit("broadcast", rid, uid, info);
        break;
      }
    }
  }
}
