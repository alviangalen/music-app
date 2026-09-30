import React, { useState, useEffect, useCallback } from "react";
import { Music, Radio, Server, ShieldCheck, AlertCircle, RefreshCw } from "lucide-react";
import { SearchBar } from "./components/SearchBar";
import { TrackCard } from "./components/TrackCard";
import { AudioPlayer } from "./components/AudioPlayer";
import { Track } from "./types";

export const App: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeQuery, setActiveQuery] = useState<string>("Daft Punk");
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);

  // Check backend health endpoint
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch("/healthz");
      if (res.ok) {
        const data = await res.json();
        setBackendHealthy(data.status === "ok");
      } else {
        setBackendHealthy(false);
      }
    } catch {
      setBackendHealthy(false);
    }
  }, []);

  // Search tracks from the backend BFF
  const searchTracks = useCallback(async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setActiveQuery(query);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error ${response.status}: Failed to fetch songs`
        );
      }

      const data: Track[] = await response.json();
      setTracks(data);

      // If user hasn't selected a track yet, default currentTrack to first result
      if (!currentTrack && data.length > 0) {
        setCurrentTrack(data[0]);
      }
    } catch (err: unknown) {
      console.error("Search error:", err);
      setError(
        err instanceof Error ? err.message : "Unable to reach the music search service"
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentTrack]);

  // Initial load
  useEffect(() => {
    checkHealth();
    searchTracks("Daft Punk");
  }, [checkHealth, searchTracks]);

  // Playback handlers
  const handleTogglePlay = (track: Track) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying((prev) => !prev);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const handleNextTrack = () => {
    if (!tracks.length || !currentTrack) return;
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    setCurrentTrack(tracks[nextIndex]);
    setIsPlaying(true);
  };

  const handlePreviousTrack = () => {
    if (!tracks.length || !currentTrack) return;
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrack(tracks[prevIndex]);
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-background text-primary flex flex-col">
      {/* Top Navigation & DevOps Header */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-surface-hover px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent to-purple-500 flex items-center justify-center shadow-lg shadow-accent/25">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">
                  SoundStream
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent/15 text-accent border border-accent/30">
                  DevOps Edition
                </span>
              </div>
              <p className="text-[11px] text-secondary hidden sm:block">
                iTunes BFF • Nginx Reverse Proxy • Docker Compose
              </p>
            </div>
          </div>

          {/* DevOps Status & Architecture Pills */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Backend Health Status Badge */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                backendHealthy === true
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : backendHealthy === false
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                  : "bg-surface border-surface-hover text-muted"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  backendHealthy === true
                    ? "bg-emerald-400 animate-pulse"
                    : backendHealthy === false
                    ? "bg-rose-400"
                    : "bg-muted animate-ping"
                }`}
              />
              <span className="hidden md:inline">
                {backendHealthy === true
                  ? "Backend Healthy"
                  : backendHealthy === false
                  ? "Backend Offline"
                  : "Checking Backend..."}
              </span>
              <span className="md:hidden">
                {backendHealthy === true ? "OK" : "Err"}
              </span>
            </div>

            {/* Architecture indicator */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-secondary bg-surface px-3 py-1.5 rounded-full border border-surface-hover">
              <Server className="w-3.5 h-3.5 text-accent" />
              <span>Multi-Stage Containers</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8 pb-32">
        {/* Hero & Search Section */}
        <section className="text-center space-y-4 pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium bg-surface border border-surface-hover text-secondary mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Isolated Container Network • Clean BFF Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white max-w-2xl mx-auto">
            Discover & Preview Music Instantly
          </h1>
          <p className="text-sm sm:text-base text-secondary max-w-xl mx-auto">
            Search songs via our containerized Node.js BFF proxying the public iTunes API, with 30-second audio previews.
          </p>

          <div className="pt-2">
            <SearchBar
              initialQuery="Daft Punk"
              onSearch={searchTracks}
              isLoading={isLoading}
            />
          </div>
        </section>

        {/* Content Section: Loading, Error, or Grid */}
        <section>
          {/* Error Banner */}
          {error && (
            <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-6 text-center space-y-3 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-full bg-rose-900/50 text-rose-300 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-rose-200">
                Failed to load music results
              </h3>
              <p className="text-xs text-rose-300/80">{error}</p>
              <button
                type="button"
                onClick={() => searchTracks(activeQuery)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Search
              </button>
            </div>
          )}

          {/* Loading Skeletons */}
          {isLoading && !error && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-surface-card border border-surface-hover rounded-2xl p-3.5 space-y-3 animate-pulse"
                >
                  <div className="aspect-square bg-surface-hover rounded-xl" />
                  <div className="h-4 bg-surface-hover rounded w-3/4" />
                  <div className="h-3 bg-surface-hover rounded w-1/2" />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && tracks.length === 0 && (
            <div className="text-center py-16 space-y-3 bg-surface/50 border border-surface-hover rounded-2xl max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-surface-hover text-muted flex items-center justify-center mx-auto">
                <Music className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-primary">No tracks found</h3>
              <p className="text-xs text-secondary">
                Try searching for a different artist, song, or genre keyword.
              </p>
            </div>
          )}

          {/* Results Grid */}
          {!isLoading && !error && tracks.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-secondary px-1">
                <span>
                  Showing {tracks.length} tracks for{" "}
                  <span className="text-primary font-semibold">"{activeQuery}"</span>
                </span>
                <span className="hidden sm:inline">Click any track to listen</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {tracks.map((track) => (
                  <TrackCard
                    key={track.id}
                    track={track}
                    isPlaying={isPlaying}
                    isActive={currentTrack?.id === track.id}
                    onTogglePlay={handleTogglePlay}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Persistent Audio Playback Bar */}
      <AudioPlayer
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying((prev) => !prev)}
        onNext={handleNextTrack}
        onPrevious={handlePreviousTrack}
      />
    </div>
  );
};

export default App;