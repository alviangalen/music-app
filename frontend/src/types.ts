export interface Track {
  id: number;
  title: string;
  artist: string;
  album: string;
  artworkUrl: string;
  previewUrl: string;
}

export type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';