export interface ITunesRawTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName?: string;
  artworkUrl100: string;
  artworkUrl60?: string;
  previewUrl?: string;
  kind?: string;
  trackViewUrl?: string;
}

export interface ITunesSearchResponse {
  resultCount: number;
  results: ITunesRawTrack[];
}

export interface Track {
  id: number;
  title: string;
  artist: string;
  album: string;
  artworkUrl: string;
  previewUrl: string;
}

export interface SearchQuery {
  q?: string;
}

export interface HealthResponse {
  status: "ok";
  timestamp: string;
  uptime: number;
}