import React from "react";
import { Play, Pause, Music2 } from "lucide-react";
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
      className={`group relative flex flex-col bg-surface-card hover:bg-surface-hover border rounded-2xl p-3.5 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
        isActive
          ? "border-accent shadow-[0_0_24px_rgba(99,102,241,0.25)] ring-1 ring-accent"
          : "border-surface-hover hover:border-surface-hover/80 hover:shadow-xl hover:shadow-black/40"
      }`}
    >
      {/* Artwork Container */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-surface mb-3.5">
        {track.artworkUrl ? (
          <img
            src={track.artworkUrl}
            alt={`${track.title} by ${track.artist}`}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-hover text-muted">
            <Music2 className="w-12 h-12" />
          </div>
        )}

        {/* Dark Hover/Active Overlay */}
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-200 ${
            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePlay(track);
            }}
            aria-label={isActive && isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
            className="w-12 h-12 rounded-full bg-accent hover:bg-accent-hover text-white flex items-center justify-center shadow-lg shadow-accent/40 transform transition-transform duration-200 hover:scale-110 active:scale-95"
          >
            {isActive && isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current translate-x-0.5" />
            )}
          </button>
        </div>

        {/* Live Audio Equalizer Animation (Active track only) */}
        {isActive && isPlaying && (
          <div className="absolute top-2.5 right-2.5 flex items-end gap-0.5 h-4 bg-black/70 backdrop-blur-md px-1.5 py-1 rounded-md">
            <span className="w-1 bg-accent rounded-full animate-equalize" />
            <span className="w-1 bg-accent rounded-full animate-equalize-mid" />
            <span className="w-1 bg-accent rounded-full animate-equalize-slow" />
          </div>
        )}

        {/* 30s Preview Badge */}
        <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-semibold text-secondary uppercase tracking-wider">
          30s Preview
        </div>
      </div>

      {/* Metadata */}
      <div className="flex flex-col flex-grow min-w-0">
        <h3
          title={track.title}
          className={`text-sm font-semibold truncate transition-colors ${
            isActive ? "text-accent" : "text-primary group-hover:text-white"
          }`}
        >
          {track.title}
        </h3>
        <p title={track.artist} className="text-xs text-secondary truncate mt-1">
          {track.artist}
        </p>
        <p title={track.album} className="text-[11px] text-muted truncate mt-0.5">
          {track.album}
        </p>
      </div>
    </div>
  );
};