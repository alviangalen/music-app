import React, { useState, useEffect, useRef } from "react";

interface SearchBarProps {
  onSearch: (term: string) => void;
  isLoading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onSearch(searchTerm.trim());
    }, 450);

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
    onSearch(searchTerm.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-center w-full max-w-md bg-[#121212] border border-[#1e1e1e] hover:border-[#2a2a2a] focus-within:border-[#3a3a3a] rounded-xl px-3.5 py-2 transition-colors"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={`w-4 h-4 text-[#777777] mr-2.5 flex-shrink-0 ${
          isLoading ? "animate-spin" : ""
        }`}
      >
        <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Cari lagu, artis, atau album"
        aria-label="Cari lagu, artis, atau album"
        className="w-full bg-transparent text-sm text-[#f4f4f4] placeholder-[#555555] outline-none"
      />

      <button
        type="submit"
        aria-label="Submit search"
        className="ml-2 text-[10px] font-mono text-[#555555] hover:text-[#aaaaaa] border border-[#2a2a2a] px-1.5 py-0.5 rounded tracking-wider flex-shrink-0 transition-colors uppercase cursor-pointer"
      >
        ENTER
      </button>
    </form>
  );
};