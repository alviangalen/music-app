import React, { useRef, useEffect, useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  
  Music2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Track } from "../types";

interface AudioPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  currentTrack,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30); // iTunes previews are 30s
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  // Synchronize play/pause state with native HTML5 audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      setPlaybackError(null);
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // Browser autoplay policy or invalid source
          console.warn("Audio playback interrupted or blocked:", error);
          if (error.name !== "AbortError") {
            setPlaybackError("Playback blocked by browser policy or format");
          }
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  // Adjust volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = Number(e.target.value);
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  if (!currentTrack) {
    return null;
  }

  return (
    <aside
      aria-label="Audio playback bar"
      className="fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-xl border-t border-surface-hover/80 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.6)]"
    >
      {/* Hidden Native Audio Element */}
      <audio
        ref={audioRef}
        src={currentTrack.previewUrl}
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onCanPlay={() => setIsBuffering(false)}
        onEnded={onNext}
        onError={() => {
          setIsBuffering(false);
          setPlaybackError("Unable to load audio preview stream");
        }}
      />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6">
        {/* Left Section: Track Info */}
        <div className="flex items-center gap-3 w-full md:w-1/4 min-w-0">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-surface-card flex-shrink-0 border border-surface-hover">
            {currentTrack.artworkUrl ? (
              <img
                src={currentTrack.artworkUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted">
                <Music2 className="w-6 h-6" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-grow">
            <h4
              title={currentTrack.title}
              className="text-sm font-semibold text-primary truncate"
            >
              {currentTrack.title}
            </h4>
            <p
              title={currentTrack.artist}
              className="text-xs text-secondary truncate"
            >
              {currentTrack.artist}
            </p>
            {playbackError && (
              <div className="flex items-center gap-1 text-[11px] text-rose-400 mt-0.5">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{playbackError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Center Section: Controls & Scrubber */}
        <div className="flex flex-col items-center gap-1.5 w-full md:w-2/4 max-w-xl">
          {/* Action buttons */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onPrevious}
              className="text-secondary hover:text-primary transition-colors p-1.5 rounded-full hover:bg-surface-hover"
              aria-label="Previous track"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              type="button"
              onClick={onPlayPause}
              disabled={Boolean(playbackError)}
              className="w-10 h-10 rounded-full bg-accent hover:bg-accent-hover text-white flex items-center justify-center shadow-lg shadow-accent/40 transform transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
              aria-label={isPlaying ? "Pause preview" : "Play preview"}
            >
              {isBuffering ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current translate-x-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={onNext}
              className="text-secondary hover:text-primary transition-colors p-1.5 rounded-full hover:bg-surface-hover"
              aria-label="Next track"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
          </div>

          {/* Progress Slider */}
          <div className="flex items-center gap-2.5 w-full text-[11px] text-secondary font-mono">
            <span className="w-8 text-right">{formatTime(currentTime)}</span>
            <div className="relative flex-grow flex items-center">
              <input
                type="range"
                min={0}
                max={duration || 30}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 rounded-lg accent-accent"
                aria-label="Audio scrubber"
              />
            </div>
            <span className="w-8">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Section: Volume & Badges */}
        <div className="hidden md:flex items-center justify-end gap-3 w-1/4">
          <button
            type="button"
            onClick={toggleMute}
            className="text-secondary hover:text-primary transition-colors p-1.5 rounded-full hover:bg-surface-hover"
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setIsMuted(false);
              setVolume(Number(e.target.value));
            }}
            className="w-20 h-1.5 rounded-lg accent-accent"
            aria-label="Volume slider"
          />

          <span className="text-[10px] bg-surface-card border border-surface-hover px-2 py-1 rounded text-muted font-medium ml-2">
            30s AAC
          </span>
        </div>
      </div>
    </aside>
  );
};