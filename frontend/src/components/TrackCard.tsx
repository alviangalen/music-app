import React from "react";
import { Track } from "../types";

interface TrackCardProps {
  track: Track;
  isPlaying: boolean;
  isActive: boolean;
  onTogglePlay: (track: Track) => void;
}

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  isPlaying,
  isActive,
  onTogglePlay,
}) => {
  return (
    <div
      onClick={() => onTogglePlay(track)}
      className={`group relative flex flex-col bg-[#141414] hover:bg-[#1a1a1a] border rounded-xl p-3.5 cursor-pointer transition-all duration-200 ${
        isActive
          ? "border-neutral-500 bg-[#1c1c1c]"
          : "border-[#1c1c1c] hover:border-[#2a2a2a]"
      }`}
    >
      {/* Artwork with subtle play overlay */}
      <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-[#0d0d0d] mb-3">
        {track.artworkUrl ? (
          <img
            src={track.artworkUrl}
            alt={`${track.title} - ${track.artist}`}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#555555]">
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
              <path d="M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm12 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </div>
        )}

        {/* Hover / Active Play Button Overlay */}
        <div
          className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${
            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg transform group-hover:scale-105 active:scale-95 transition-transform">
            {isActive && isPlaying ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 translate-x-0.5">
                <path d="M8 5.7c0-1.2 1.3-1.9 2.3-1.2l10 6.3a1.4 1.4 0 0 1 0 2.4l-10 6.3A1.5 1.5 0 0 1 8 18.3V5.7Z" />
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Track Info */}
      <h3
        title={track.title}
        className={`text-sm font-medium truncate ${
          isActive ? "text-white" : "text-[#f0f0f0]"
        }`}
      >
        {track.title}
      </h3>
      <p title={track.artist} className="text-xs text-[#808080] truncate mt-1">
        {track.artist}
      </p>
    </div>
  );
};