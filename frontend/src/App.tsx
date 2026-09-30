import React, { useState, useCallback } from "react";
import { SearchBar } from "./components/SearchBar";
import { TrackCard } from "./components/TrackCard";
import { AudioPlayer } from "./components/AudioPlayer";
import { Track } from "./types";

export const App: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Search songs through the BFF endpoint reaching public iTunes API
  const searchMusic = useCallback(async (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) {
      setTracks([]);
      setCurrentIndex(-1);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Gagal mengambil data dari server");
      }
      const data: Track[] = await res.json();
      setTracks(data);
      if (data.length > 0) {
        setCurrentIndex(0);
      } else {
        setCurrentIndex(-1);
      }
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memuat musik");
      setTracks([]);
      setCurrentIndex(-1);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const currentTrack = currentIndex >= 0 && tracks[currentIndex] ? tracks[currentIndex] : null;

  const handleTogglePlay = (track?: Track) => {
    if (track) {
      const idx = tracks.findIndex((t) => t.id === track.id);
      if (idx !== -1) {
        if (idx === currentIndex) {
          setIsPlaying((prev) => !prev);
        } else {
          setCurrentIndex(idx);
          setIsPlaying(true);
        }
        return;
      }
    }
    if (currentTrack) {
      setIsPlaying((prev) => !prev);
    }
  };

  const handleNext = () => {
    if (tracks.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % tracks.length);
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    if (tracks.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-[#090909] text-[#f4f4f4] flex">
      {/* ========================================================================= */}
      {/* Left Sidebar (240px wide)                                                 */}
      {/* ========================================================================= */}
      <aside
        aria-label="Sidebar navigation"
        className="w-[240px] flex-shrink-0 bg-[#090909] border-r border-[#181818] fixed top-0 bottom-[84px] left-0 flex flex-col justify-between p-6 z-30"
      >
        <div className="space-y-6">
          {/* Logo: (•) Music Player */}
          <div className="flex items-center gap-2.5 text-white">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 flex-shrink-0">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="12" cy="12" r="3" fill="currentColor" />
            </svg>
            <span className="font-bold text-[15px] tracking-tight text-white">
              Music Player
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#1a1a1a] text-white font-medium text-sm transition-colors text-left cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 flex-shrink-0">
                <path
                  d="m4 10 8-6 8 6v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Beranda</span>
            </button>

            <button
              type="button"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[#888888] hover:text-white font-medium text-sm transition-colors text-left cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 flex-shrink-0">
                <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
                <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span>Cari</span>
            </button>

            <button
              type="button"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[#888888] hover:text-white font-medium text-sm transition-colors text-left cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 flex-shrink-0">
                <path d="M5 4v16M10 4v16M15 5l4-1 2 15-4 1-2-15Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
              <span>Koleksi</span>
            </button>
          </nav>

          {/* Section: KOLEKSI KAMU */}
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-[#555555] uppercase tracking-wider px-3.5 block mb-2">
              KOLEKSI KAMU
            </span>
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[#888888] hover:text-white font-medium text-sm transition-colors text-left cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 flex-shrink-0">
                <path
                  d="M20.8 5.8a5 5 0 0 0-7.1 0L12 7.5l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 21l8.8-8.1a5 5 0 0 0 0-7.1Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Lagu disukai</span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer info */}
        <div className="space-y-1 px-1">
          <p className="text-xs text-[#cccccc] font-medium">Temukan musik baru.</p>
          <p className="text-[11px] text-[#666666]">Preview musik disediakan oleh iTunes.</p>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* Main Content Area (offset by 240px for sidebar)                           */}
      {/* ========================================================================= */}
      <div className="flex-1 ml-[240px] pb-32">
        {/* Top Header with SearchBar & Profile Avatar */}
        <header className="sticky top-0 bg-[#090909]/90 backdrop-blur-md px-10 py-5 flex items-center justify-between z-20">
          <SearchBar
            onSearch={searchMusic}
            isLoading={isLoading}
          />

          <div
            title="Music Player Profile"
            className="w-8 h-8 rounded-full bg-white text-black font-semibold text-xs flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
          >
            MP
          </div>
        </header>

        {/* Main Body */}
        <main className="px-10 py-4 max-w-6xl space-y-8">
          {/* Hero Typography */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-[#666666] tracking-widest uppercase block">
              MUSIC PLAYER
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.15]">
              Musik untuk menemani<br />harimu.
            </h1>
            <p className="text-sm text-[#888888] max-w-xl">
              Cari lagu favoritmu, tekan play, dan nikmati musik tanpa gangguan.
            </p>
          </div>

          {/* Initial State before user searches */}
          {!hasSearched && (
            <div className="border border-dashed border-[#202020] rounded-2xl p-12 text-center text-[#666666] space-y-3 bg-[#0d0d0d]">
              <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 mx-auto text-[#444444]">
                <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
                <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <div className="space-y-1">
                <p className="text-sm font-medium text-[#cccccc]">Mulai cari lagu favoritmu</p>
                <p className="text-xs text-[#666666]">
                  Ketik judul lagu, nama artis, atau album di kolom pencarian di atas untuk memutar preview lagu langsung dari iTunes API.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-[#1a1111] border border-[#331c1c] rounded-xl text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Empty Search Results */}
          {hasSearched && !isLoading && tracks.length === 0 && !error && (
            <div className="border border-[#1f1f1f] bg-[#121212] rounded-2xl p-10 text-center text-[#888888] space-y-1">
              <p className="text-sm font-medium text-white">Tidak ada lagu yang ditemukan</p>
              <p className="text-xs text-[#666666]">Coba kata kunci pencarian yang lain.</p>
            </div>
          )}

          {/* Featured / Hero Banner ("SEDANG DIPUTAR") when tracks are loaded */}
          {currentTrack && (
            <div className="w-full bg-[#121212] border border-[#1c1c1c] rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
              {/* Left Column */}
              <div className="p-8 md:p-10 flex flex-col justify-between min-h-[260px]">
                <span className="text-[11px] font-semibold text-[#666666] tracking-widest uppercase block">
                  SEDANG DIPUTAR
                </span>

                <div className="space-y-2 my-6">
                  <h2
                    title={currentTrack.title}
                    className="text-3xl md:text-4xl font-bold text-white tracking-tight line-clamp-2"
                  >
                    {currentTrack.title}
                  </h2>
                  <p
                    title={`${currentTrack.artist} · ${currentTrack.album}`}
                    className="text-sm text-[#888888] line-clamp-1"
                  >
                    {currentTrack.artist} · {currentTrack.album}
                  </p>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => handleTogglePlay()}
                    className="bg-white text-black hover:bg-neutral-200 font-semibold text-sm px-6 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    {isPlaying ? (
                      <>
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                          <rect x="6.5" y="5" width="3.5" height="14" rx="1" />
                          <rect x="14" y="5" width="3.5" height="14" rx="1" />
                        </svg>
                        <span>Jeda</span>
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 translate-x-0.5">
                          <path d="M8 5.7c0-1.2 1.3-1.9 2.3-1.2l10 6.3a1.4 1.4 0 0 1 0 2.4l-10 6.3A1.5 1.5 0 0 1 8 18.3V5.7Z" />
                        </svg>
                        <span>Putar sekarang</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column: Album Art */}
              <div className="relative bg-[#0d0d0d] flex items-center justify-center p-6 md:p-8 min-h-[260px]">
                {currentTrack.artworkUrl ? (
                  <img
                    src={currentTrack.artworkUrl}
                    alt={currentTrack.title}
                    className="w-full max-w-[280px] aspect-square object-cover rounded-xl shadow-2xl"
                  />
                ) : (
                  <div className="w-full max-w-[280px] aspect-square bg-[#1a1a1a] rounded-xl flex items-center justify-center text-[#555555]">
                    No Cover
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Results Grid */}
          {tracks.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between text-xs text-[#777777]">
                <span className="font-semibold text-white tracking-wide text-sm">
                  Daftar Lagu ({tracks.length})
                </span>
                <span>Klik lagu untuk memutar</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {tracks.map((track, idx) => (
                  <TrackCard
                    key={track.id}
                    track={track}
                    isActive={idx === currentIndex}
                    isPlaying={isPlaying && idx === currentIndex}
                    onTogglePlay={handleTogglePlay}
                  />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Persistent Audio Player Bar */}
      <AudioPlayer
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlayPause={() => handleTogglePlay()}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    </div>
  );
};

export default App;