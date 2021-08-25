
import * as ion from '../../../src/connector';
import * as uuid from 'uuid';

export async function Init(): Promise<void> {
    console.log('Hello world!');
    let url = 'http://localhost:5551';
    let token = 'token';
    let sid = 'ion';
    let uid = uuid.v4();
    const baseConnecotr = new ion.IonBaseConnector(url, token);

    baseConnecotr.onopen = function (service: ion.IonService): void {
        console.log('Connected to ' + service.name);
    };

    baseConnecotr.onclose = function (service: ion.IonService): void {
        console.log('Disconnected from ' + service.name);
    };

    const roomApp = new ion.IonAppRoom(baseConnecotr);

    roomApp.onjoin = function (result: ion.JoinResult): void {
        console.log('on room join , success ' + result.success + ', room info: ' + JSON.stringify(result.room));
    };

    roomApp.onleave = function (reason: string): void {
        console.log('Left room, reason ' + reason);
    };

    roomApp.onmessage = function (msg: ion.Message): void {
        console.log('Received from: ' + msg.from + ', to: ' + msg.to + ', type: ' + msg.type);
    };

    roomApp.onpeerevent = function (event: ion.PeerEvent): void {
        switch(event.state) {
            case ion.PeerState.JOIN:
                console.log('Peer ' + event.peer.uid + ' joined');
                break;
            case ion.PeerState.LEAVE:
                console.log('Peer ' + event.peer.uid + ' left');
                break;
            case ion.PeerState.UPDATE:
                console.log('Peer ' + event.peer.uid + ' updated');
                break;
        }
    };

    roomApp.onroominfo = function (info: ion.RoomInfo): void {
        console.log('on Room info update: ' + JSON.stringify(info));
    };

    roomApp.ondisconnect = function (dis: ion.Disconnect): void {
        console.log('Disconnected from server, reason: ' + dis.reason);
    };

    roomApp.connect();
    const result = await roomApp.join({
        sid: sid,
        uid: uid,
        displayname: 'new peer',
        extrainfo: '',
        destination: 'webrtc://ion/peer1',
        role: ion.Role.HOST,
        protocol: ion.Protocol.WEBRTC ,
        avatar: 'string',
        direction: ion.Direction.INCOMING,
        vendor: 'string',
    }, '');

    console.log('Joined room result, success ' + result?.success + ', room info: ' + JSON.stringify(result?.room));

    setTimeout(() => {
        roomApp.leave(sid, uid);
    }, 7000);

    const payload = new Map();
    payload.set('key1', 'value1');
    payload.set('key2', 'value2');
    roomApp.message(sid,'peer122', uid, 'Map', payload);
}
