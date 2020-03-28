"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var protoo = require("protoo-client");
var uuid_1 = require("uuid");
var sdpTransform = require("sdp-transform");
var ices = "stun:stun.stunprotocol.org:3478";
// const DefaultPayloadTypePCMU = 0;
// const DefaultPayloadTypePCMA = 8;
// const DefaultPayloadTypeG722 = 9;
// const DefaultPayloadTypeOpus = 111;
var DefaultPayloadTypeVP8 = 96;
var DefaultPayloadTypeVP9 = 98;
var DefaultPayloadTypeH264 = 102;
var Client = /** @class */ (function (_super) {
    __extends(Client, _super);
    function Client() {
        var _this = _super.call(this) || this;
        _this._port = 8443;
        _this._uid = uuid_1.v4();
        _this._pcs = {};
        _this._streams = {};
        return _this;
    }
    Object.defineProperty(Client.prototype, "uid", {
        get: function () {
            return this._uid;
        },
        enumerable: true,
        configurable: true
    });
    Client.prototype.init = function () {
        var _this = this;
        var _a, _b, _c, _d, _e;
        this._url = this._getProtooUrl(this._uid);
        var transport = new protoo.WebSocketTransport(this._url);
        this._protoo = new protoo.Peer(transport);
        (_a = this._protoo) === null || _a === void 0 ? void 0 : _a.on("open", function () {
            console.log('Peer "open" event');
            _this.emit("transport-open");
        });
        (_b = this._protoo) === null || _b === void 0 ? void 0 : _b.on("disconnected", function () {
            console.log('Peer "disconnected" event');
            _this.emit("transport-failed");
        });
        (_c = this._protoo) === null || _c === void 0 ? void 0 : _c.on("close", function () {
            console.log('Peer "close" event');
            _this.emit("transport-closed");
        });
        (_d = this._protoo) === null || _d === void 0 ? void 0 : _d.on("request", this._handleRequest.bind(this));
        (_e = this._protoo) === null || _e === void 0 ? void 0 : _e.on("notification", this._handleNotification.bind(this));
    };
    Client.prototype.join = function (roomId, info) {
        if (info === void 0) { info = { name: "Guest" }; }
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var data, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this._rid = roomId;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, ((_a = this._protoo) === null || _a === void 0 ? void 0 : _a.request("join", {
                                rid: this._rid,
                                uid: this._uid,
                                info: info
                            }))];
                    case 2:
                        data = _b.sent();
                        console.log("join success: result => " + JSON.stringify(data));
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _b.sent();
                        console.log("join reject: error =>" + error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Client.prototype.leave = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var data, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, ((_a = this._protoo) === null || _a === void 0 ? void 0 : _a.request("leave", {
                                rid: this._rid,
                                uid: this._uid
                            }))];
                    case 1:
                        data = _b.sent();
                        console.log("leave success: result => " + JSON.stringify(data));
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _b.sent();
                        console.log("leave reject: error =>" + error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Client.prototype.publish = function (stream, options) {
        if (options === void 0) { options = {
            audio: true,
            video: true,
            screen: false,
            codec: "h264",
            resolution: "hd",
            bandwidth: 1024
        }; }
        return __awaiter(this, void 0, void 0, function () {
            var pc_1, error_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("publish optiond => %o", options);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._createSender(stream, options.codec)];
                    case 2:
                        pc_1 = _a.sent();
                        pc_1.onicecandidate = function () { return __awaiter(_this, void 0, void 0, function () {
                            var offer, result;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        if (!pc_1.sendOffer) return [3 /*break*/, 3];
                                        offer = pc_1.localDescription;
                                        console.log("Send offer");
                                        pc_1.sendOffer = false;
                                        return [4 /*yield*/, ((_a = this._protoo) === null || _a === void 0 ? void 0 : _a.request("publish", {
                                                rid: this._rid,
                                                jsep: offer,
                                                options: options
                                            }))];
                                    case 1:
                                        result = _b.sent();
                                        return [4 /*yield*/, pc_1.setRemoteDescription(result === null || result === void 0 ? void 0 : result.jsep)];
                                    case 2:
                                        _b.sent();
                                        console.log("publish success");
                                        // this._streams[stream.mid] = stream;
                                        this._pcs[result === null || result === void 0 ? void 0 : result.mid] = pc_1;
                                        return [2 /*return*/, stream];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); };
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        throw error_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Client.prototype.unpublish = function (mid) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var data, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log("unpublish rid => %s, mid => %s", this._rid, mid);
                        this._removePC(mid);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, ((_a = this._protoo) === null || _a === void 0 ? void 0 : _a.request("unpublish", {
                                rid: this._rid,
                                mid: mid
                            }))];
                    case 2:
                        data = _b.sent();
                        console.log("unpublish success: result => " + JSON.stringify(data));
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _b.sent();
                        console.log("unpublish reject: error =>" + error_4);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Client.prototype.subscribe = function (rid, mid) {
        return __awaiter(this, void 0, void 0, function () {
            var pc_2, sub_mid, error_5;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("subscribe rid => %s, mid => %s", rid, mid);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._createReceiver(mid)];
                    case 2:
                        pc_2 = _a.sent();
                        sub_mid = "";
                        // @ts-ignore : deprecated api
                        pc_2.onaddstream = function (e) {
                            console.log("Stream::pc::onaddstream", sub_mid);
                            _this._streams[sub_mid] = e.stream;
                            return e.stream;
                        };
                        // @ts-ignore : deprecated api
                        pc_2.onremovestream = function (e) {
                            var stream = e.stream;
                            console.log("Stream::pc::onremovestream", stream.id);
                        };
                        // @ts-ignore : deprecated api
                        pc_2.onicecandidate = function (e) { return __awaiter(_this, void 0, void 0, function () {
                            var jsep, result;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        if (!pc_2.sendOffer) return [3 /*break*/, 3];
                                        jsep = pc_2.localDescription;
                                        console.log("Send offer");
                                        // @ts-ignore : deprecated api
                                        pc_2.sendOffer = false;
                                        return [4 /*yield*/, ((_a = this._protoo) === null || _a === void 0 ? void 0 : _a.request("subscribe", {
                                                rid: rid,
                                                jsep: jsep,
                                                mid: mid
                                            }))];
                                    case 1:
                                        result = _b.sent();
                                        sub_mid = result === null || result === void 0 ? void 0 : result.mid;
                                        console.log("subscribe success => result(mid: " + sub_mid + ")");
                                        return [4 /*yield*/, pc_2.setRemoteDescription(result === null || result === void 0 ? void 0 : result.jsep)];
                                    case 2:
                                        _b.sent();
                                        _b.label = 3;
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); };
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        console.log("subscribe request error  => " + error_5);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Client.prototype.unsubscribe = function (rid, mid) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var data, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log("unsubscribe rid => %s, mid => %s", rid, mid);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, ((_a = this._protoo) === null || _a === void 0 ? void 0 : _a.request("unsubscribe", { rid: rid, mid: mid }))];
                    case 2:
                        data = _b.sent();
                        console.log("unsubscribe success");
                        this._removePC(mid);
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _b.sent();
                        console.log("unsubscribe reject: error =>" + error_6);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Client.prototype.close = function () {
        var _a;
        (_a = this._protoo) === null || _a === void 0 ? void 0 : _a.close();
    };
    Client.prototype._payloadModify = function (desc, codec) {
        if (codec === undefined)
            return desc;
        /*
         * DefaultPayloadTypePCMU = 0
         * DefaultPayloadTypePCMA = 8
         * DefaultPayloadTypeG722 = 9
         * DefaultPayloadTypeOpus = 111
         * DefaultPayloadTypeVP8  = 96
         * DefaultPayloadTypeVP9  = 98
         * DefaultPayloadTypeH264 = 102
         */
        var payload;
        var codeName = "";
        var session = sdpTransform.parse(desc === null || desc === void 0 ? void 0 : desc.sdp);
        console.log("SDP object => %o", session);
        var videoIdx = -1;
        session["media"].map(function (m, index) {
            if (m.type == "video") {
                videoIdx = index;
            }
        });
        if (videoIdx == -1)
            return desc;
        if (codec.toLowerCase() === "vp8") {
            payload = DefaultPayloadTypeVP8;
            codeName = "VP8";
        }
        else if (codec.toLowerCase() === "vp9") {
            payload = DefaultPayloadTypeVP9;
            codeName = "VP9";
        }
        else if (codec.toLowerCase() === "h264") {
            payload = DefaultPayloadTypeH264;
            codeName = "H264";
        }
        else {
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
        var fmtp = [
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
        var ssrcGroup = session["media"][videoIdx].ssrcGroups[0];
        var ssrcs = ssrcGroup.ssrcs;
        var videoSsrc = ssrcs.split(" ")[0];
        console.log("ssrcs => %s, video %s", ssrcs, videoSsrc);
        var newSsrcs = session["media"][videoIdx].ssrcs;
        // @ts-ignore
        newSsrcs = newSsrcs.filter(function (item) { return item.id == videoSsrc; });
        session["media"][videoIdx].ssrcGroups = [];
        session["media"][videoIdx].ssrcs = newSsrcs;
        var tmp = desc;
        tmp.sdp = sdpTransform.write(session);
        return tmp;
    };
    Client.prototype._createSender = function (stream, codec) {
        return __awaiter(this, void 0, void 0, function () {
            var pc, offer, desc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("create sender => %s", codec);
                        pc = new RTCPeerConnection({
                            iceServers: [{ urls: ices }]
                        });
                        pc.sendOffer = true;
                        // @ts-ignore
                        pc.addStream(stream);
                        return [4 /*yield*/, pc.createOffer({
                                offerToReceiveVideo: false,
                                offerToReceiveAudio: false
                            })];
                    case 1:
                        offer = _a.sent();
                        desc = this._payloadModify(offer, codec);
                        pc.setLocalDescription(desc);
                        return [2 /*return*/, pc];
                }
            });
        });
    };
    Client.prototype._createReceiver = function (uid) {
        return __awaiter(this, void 0, void 0, function () {
            var pc, desc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("create receiver => %s", uid);
                        pc = new RTCPeerConnection({
                            iceServers: [{ urls: ices }]
                        });
                        pc.sendOffer = true;
                        pc.addTransceiver("audio", { direction: "recvonly" });
                        pc.addTransceiver("video", { direction: "recvonly" });
                        return [4 /*yield*/, pc.createOffer()];
                    case 1:
                        desc = _a.sent();
                        pc.setLocalDescription(desc);
                        this._pcs[uid] = pc;
                        return [2 /*return*/, pc];
                }
            });
        });
    };
    Client.prototype._removePC = function (id) {
        var pc = this._pcs[id];
        if (pc) {
            console.log("remove pc mid => %s", id);
            var stream = this._streams[id];
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
    };
    Client.prototype._getProtooUrl = function (pid) {
        var hostname = window.location.hostname;
        var websocketProtocol = location.protocol === "https:" ? "wss" : "ws";
        var url = websocketProtocol + "://" + hostname + ":" + this._port + "/ws?peer=" + pid;
        return url;
    };
    Client.prototype._handleRequest = function (request) {
        console.log("Handle request from server: [method:%s, data:%o]", request.method, request.data);
    };
    Client.prototype._handleNotification = function (notification) {
        var method = notification.method, data = notification.data;
        console.log("Handle notification from server: [method:%s, data:%o]", method, data);
        switch (method) {
            case "peer-join": {
                var rid = data.rid, uid = data.uid, info = data.info;
                console.log("peer-join peer rid => %s, uid => %s, info => %o", rid, uid, info);
                this.emit("peer-join", rid, uid, info);
                break;
            }
            case "peer-leave": {
                var rid = data.rid, uid = data.uid;
                console.log("peer-leave peer rid => %s, uid => %s", rid, uid);
                this.emit("peer-leave", rid, uid);
                break;
            }
            case "stream-add": {
                var rid = data.rid, mid = data.mid, info = data.info;
                console.log("stream-add peer rid => %s, mid => %s", rid, mid);
                this.emit("stream-add", rid, mid, info);
                break;
            }
            case "stream-remove": {
                var rid = data.rid, mid = data.mid;
                console.log("stream-remove peer rid => %s, mid => %s", rid, mid);
                this.emit("stream-remove", rid, mid);
                this._removePC(mid);
                break;
            }
        }
    };
    return Client;
}(events_1.EventEmitter));
exports.default = Client;
