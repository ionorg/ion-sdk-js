export interface TrackInfo {
  id?: string;
  ssrc?: number;
  pt?: number;
  type: string;
  codec?: string;
  fmtp?: string;
}

export interface Stream {
  id: string;
  tracks: TrackInfo[];
}

export interface Notification {
  method: string;
  data: {
    rid: string;
    mid?: string;
    uid: string;
    info?: string;
    stream?: Stream;
  };
}
