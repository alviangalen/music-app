import React, { useRef, useEffect, useState } from "react";
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
  const [duration, setDuration] = useState(30);
  const [volume, setVolume] = useState(0.75);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (err.name !== "AbortError") {
            console.warn("Audio playback interrupted:", err);
          }
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

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
    const target = Number(e.target.value);
    setCurrentTime(target);
    if (audioRef.current) {
      audioRef.current.currentTime = target;
    }
  };

  if (!currentTrack) {
    return null;
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <footer
      aria-label="Media Player"
      className="fixed bottom-0 left-0 right-0 h-[84px] bg-[#0c0c0c] border-t border-[#181818] px-6 flex items-center justify-between z-50 select-none"
    >
      <audio
        ref={audioRef}
        src={currentTrack.previewUrl}
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={onNext}
      />

      {/* Left: Track Information */}
      <div className="flex items-center gap-3.5 w-1/4 min-w-[180px]">
        <div className="w-12 h-12 rounded-lg bg-[#181818] overflow-hidden flex-shrink-0 border border-[#222222]">
          {currentTrack.artworkUrl ? (
            <img
              src={currentTrack.artworkUrl}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#555555]">
              <span className="text-xs">No Art</span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex flex-col justify-center">
          <span
            title={currentTrack.title}
            className="text-sm font-semibold text-[#f4f4f4] truncate leading-snug"
          >
            {currentTrack.title}
          </span>
          <span
            title={currentTrack.artist}
            className="text-xs text-[#808080] truncate mt-0.5"
          >
            {currentTrack.artist}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsLiked(!isLiked)}
          aria-label={isLiked ? "Unlike track" : "Like track"}
          className={`p-1.5 transition-colors ml-1 ${
            isLiked ? "text-white" : "text-[#666666] hover:text-[#f4f4f4]"
          }`}
        >
          <svg viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} className="w-4 h-4">
            <path
              d="M20.8 5.8a5 5 0 0 0-7.1 0L12 7.5l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 21l8.8-8.1a5 5 0 0 0 0-7.1Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Center: Controls and Scrubber Bar */}
      <div className="flex flex-col items-center gap-1.5 w-2/4 max-w-xl">
        <div className="flex items-center gap-5">
          {/* Previous Button */}
          <button
            type="button"
            onClick={onPrevious}
            aria-label="Previous track"
            className="text-[#888888] hover:text-white transition-colors p-1"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M6 5h2v14H6zM18.5 5.8v12.4a1 1 0 0 1-1.6.8l-7.5-6.2a1 1 0 0 1 0-1.6L16.9 5a1 1 0 0 1 1.6.8Z" />
            </svg>
          </button>

          {/* Play/Pause Button (Solid White Circle) */}
          <button
            type="button"
            onClick={onPlayPause}
            aria-label={isPlaying ? "Jeda" : "Putar"}
            className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <rect x="6.5" y="5" width="3.5" height="14" rx="1" />
                <rect x="14" y="5" width="3.5" height="14" rx="1" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 translate-x-0.5">
                <path d="M8 5.7c0-1.2 1.3-1.9 2.3-1.2l10 6.3a1.4 1.4 0 0 1 0 2.4l-10 6.3A1.5 1.5 0 0 1 8 18.3V5.7Z" />
              </svg>
            )}
          </button>

          {/* Next Button */}
          <button
            type="button"
            onClick={onNext}
            aria-label="Next track"
            className="text-[#888888] hover:text-white transition-colors p-1"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M16 5h2v14h-2zM5.5 5.8v12.4a1 1 0 0 0 1.6.8l7.5-6.2a1 1 0 0 0 0-1.6L7.1 5a1 1 0 0 0-1.6.8Z" />
            </svg>
          </button>
        </div>

        {/* Scrubber Line */}
        <div className="flex items-center gap-3 w-full text-[11px] text-[#777777] font-mono">
          <span className="w-7 text-right">{formatTime(currentTime)}</span>
          <div className="relative flex-grow flex items-center group cursor-pointer h-4">
            <div className="absolute left-0 right-0 h-1 bg-[#262626] rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-75"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={duration || 30}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              aria-label="Seek timeline"
              className="w-full h-1 opacity-0 z-10 cursor-pointer"
            />
          </div>
          <span className="w-7">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Volume & Help Controls */}
      <div className="flex items-center justify-end gap-3 w-1/4">
        <button
          type="button"
          onClick={() => setVolume(volume === 0 ? 0.75 : 0)}
          aria-label="Volume toggle"
          className="text-[#777777] hover:text-white transition-colors p-1"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
            <path
              d="M11 5 6 9H2v6h4l5 4V5Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
            {volume > 0 && (
              <path
                d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9.5 9.5 0 0 1 0 14"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>

        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          aria-label="Volume slider"
          className="w-20 h-1 bg-[#262626] rounded-full appearance-none outline-none"
        />

        <button
          type="button"
          aria-label="Help"
          className="w-6 h-6 rounded-full border border-[#2a2a2a] text-[#777777] hover:text-white hover:border-[#444444] text-xs flex items-center justify-center transition-colors ml-2"
        >
          ?
        </button>
      </div>
    </footer>
  );
};