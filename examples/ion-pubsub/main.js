const localVideo = document.getElementById("local-video");
const remotesDiv = document.getElementById("remotes");

/* eslint-env browser */
const joinBtns = document.getElementById("start-btns");
const connector = new Ion.Connector("http://localhost:5551");
const codecBox = document.getElementById("select-box1");
const resolutionBox = document.getElementById("select-box2");
const simulcastBox = document.getElementById("check-box");
const localData = document.getElementById("local-data");
const remoteData = document.getElementById("remote-data");
const remoteSignal= document.getElementById("remote-signal");
const subscribeBox = document.getElementById("select-box3");
const sizeTag = document.getElementById("size-tag");
const brTag = document.getElementById("br-tag");
let localDataChannel;
let event;
connector.onopen = function (svc) {
  console.log("onopen: service = ", svc.name);
};

connector.onclose = function (svc, err) {
  console.log("onclose: service = ", svc.name, ", err = ", JSON.stringify(err.detail));
};

const uid = uuidv4();
const sid = "ion";
const rtc = new Ion.RTC(connector);

rtc.ontrackevent = function (ev) {
  console.log("ontrackevent: \nuid = ", ev.uid, " \nstate = ", ev.state, ", \ntracks = ", JSON.stringify(ev.tracks));
  event = ev;
  remoteSignal.innerHTML = remoteSignal.innerHTML + JSON.stringify(ev) + '\n';
};

rtc.ondatachannel = ({ channel }) => {
  console.log("rtc.ondatachannel channel=", channel)
  channel.onmessage = ({ data }) => {
    remoteData.innerHTML = remoteData.innerHTML + data + '\n';
  };
};

rtc.join(sid, uid);

const streams = {};
let localStream;
const start = () => {
  let constraints = {
    resolution: resolutionBox.options[resolutionBox.selectedIndex].value,
    codec: codecBox.options[codecBox.selectedIndex].value,
    audio: true,
    simulcast: simulcastBox.checked,
  }
  console.log("getUserMedia constraints=", constraints)
  Ion.LocalStream.getUserMedia(constraints)
    .then((media) => {
      localStream = media;
      localVideo.srcObject = media;
      localVideo.autoplay = true;
      localVideo.controls = true;
      localVideo.muted = true;
      joinBtns.style.display = "none";
      rtc.publish(media);
      localDataChannel = rtc.createDataChannel(uid);
    })
    .catch(console.error);
};

const send = () => {
    if (!localDataChannel) {
        alert('click "start" first!', '', {
        confirmButtonText: 'OK',
      });
      return
    }
  if (localDataChannel.readyState === "open") {
    localDataChannel.send(localData.value);
  }
};

const subscribe = () => {
    let layer = subscribeBox.value
    console.log("subscribe event=", event, "layer=", layer)
    var infos = [];
    event.tracks.forEach(t => {
        if (t.layer === layer){
          infos.push({
            track_id: t.id,
            mute: t.muted,
            layer: t.layer,
            subscribe: true
          });
        }
    });
    console.log("subscribe infos=", infos)
    rtc.subscribe(infos);
}

rtc.ontrack = (track, stream) => {
  console.log("got ", track.kind, " track", track.id, "for stream", stream.id);
  if (track.kind === "video") {
    track.onunmute = () => {
      if (!streams[stream.id]) {
        const remoteVideo = document.createElement("video");
        remoteVideo.srcObject = stream;
        remoteVideo.autoplay = true;
        remoteVideo.muted = true;
        remoteVideo.addEventListener("loadedmetadata", function () {
sizeTag.innerHTML = `${remoteVideo.videoWidth}x${remoteVideo.videoHeight}`;
});

       remoteVideo.onresize = function () {
sizeTag.innerHTML = `${remoteVideo.videoWidth}x${remoteVideo.videoHeight}`;
};
        remotesDiv.appendChild(remoteVideo);
        streams[stream.id] = stream;
        stream.onremovetrack = () => {
          if (streams[stream.id]) {
            remotesDiv.removeChild(remoteVideo);
            streams[stream.id] = null;
          }
        };
        getStats();
      }
    };
  }
};

const controlLocalVideo = (radio) => {
  if (radio.value === "false") {
    localStream.mute("video");
  } else {
    localStream.unmute("video");
  }
};

const controlLocalAudio = (radio) => {
  if (radio.value === "false") {
    localStream.mute("audio");
  } else {
    localStream.unmute("audio");
  }
};

const getStats = () => {
  let bytesPrev;
  let timestampPrev;
  setInterval(() => {
    rtc.getSubStats(null).then((results) => {
      results.forEach((report) => {
        const now = report.timestamp;

        let bitrate;
        if (
          report.type === "inbound-rtp" &&
          report.mediaType === "video"
        ) {
          const bytes = report.bytesReceived;
          if (timestampPrev) {
            bitrate = (8 * (bytes - bytesPrev)) / (now - timestampPrev);
            bitrate = Math.floor(bitrate);
          }
          bytesPrev = bytes;
          timestampPrev = now;
        }
        if (bitrate) {
          brTag.innerHTML = `${bitrate} kbps @ ${report.framesPerSecond} fps`;
        }
      });
    });
  }, 1000);
};
