// package: biz
// file: biz.proto

var biz_pb = require("./biz_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var Biz = (function () {
  function Biz() {}
  Biz.serviceName = "biz.Biz";
  return Biz;
}());

Biz.Join = {
  methodName: "Join",
  service: Biz,
  requestStream: true,
  responseStream: true,
  requestType: biz_pb.JoinRequest,
  responseType: biz_pb.JoinReply
};

exports.Biz = Biz;

function BizClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

BizClient.prototype.join = function join(metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.client(Biz.Join, {
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport
  });
  client.onEnd(function (status, statusMessage, trailers) {
    listeners.status.forEach(function (handler) {
      handler({ code: status, details: statusMessage, metadata: trailers });
    });
    listeners.end.forEach(function (handler) {
      handler({ code: status, details: statusMessage, metadata: trailers });
    });
    listeners = null;
  });
  client.onMessage(function (message) {
    listeners.data.forEach(function (handler) {
      handler(message);
    })
  });
  client.start(metadata);
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    write: function (requestMessage) {
      client.send(requestMessage);
      return this;
    },
    end: function () {
      client.finishSend();
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

exports.BizClient = BizClient;

