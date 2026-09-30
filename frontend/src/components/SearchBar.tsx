import React, { useState, useEffect, useRef } from "react";
import { Search, X, Loader2, Sparkles } from "lucide-react";

interface SearchBarProps {
  initialQuery?: string;
  onSearch: (term: string) => void;
  isLoading: boolean;
}

const POPULAR_TAGS = [
  "Daft Punk",
  "The Weeknd",
  "Radiohead",
  "Billie Eilish",
  "Dua Lipa",
  "Hans Zimmer",
  "Kendrick Lamar",
];

export const SearchBar: React.FC<SearchBarProps> = ({
  initialQuery = "",
  onSearch,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  // Debounced search trigger
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (searchTerm.trim()) {
        onSearch(searchTerm.trim());
      }
    }, 400);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm, onSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  const handleClear = () => {
    setSearchTerm("");
  };

  const handleTagClick = (tag: string) => {
    setSearchTerm(tag);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    onSearch(tag);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-4 pointer-events-none text-secondary">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search songs, artists, or albums..."
          aria-label="Search music"
          className="w-full pl-12 pr-12 py-3.5 bg-surface border border-surface-hover rounded-2xl text-primary placeholder-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-glow transition-all duration-200 text-base shadow-lg shadow-black/20"
        />

        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 text-secondary hover:text-primary transition-colors p-1 rounded-full hover:bg-surface-hover"
            aria-label="Clear search input"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Suggested Search Pills */}
      <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
        <span className="flex items-center gap-1 text-muted font-medium mr-1">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          Popular:
        </span>
        {POPULAR_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => handleTagClick(tag)}
            className={`px-3 py-1 rounded-full border transition-all duration-150 ${
              searchTerm.toLowerCase() === tag.toLowerCase()
                ? "bg-accent/20 border-accent text-primary font-medium"
                : "bg-surface/60 border-surface-hover text-secondary hover:border-accent/50 hover:text-primary hover:bg-surface-hover"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};