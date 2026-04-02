"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { searchLocations, type LocationResult } from "@/app/actions/searchLocations";
import { useDebounce } from "use-debounce";

type Props = {
  baseRoute: string; // e.g. "/placas-solares"
  placeholder?: string;
};

export function LocationSearchBar({ baseRoute, placeholder = "Busca tu ciudad o provincia..." }: Props) {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchResults() {
      if (debouncedQuery.length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }
      setLoading(true);
      try {
        const data = await searchLocations(debouncedQuery);
        setResults(data);
        setIsOpen(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (result: LocationResult) => {
    setIsOpen(false);
    setQuery("");
    if (result.type === "provincia") {
      router.push(`${baseRoute}?provincia=${result.slug}`);
    } else {
      router.push(`${baseRoute}/${result.slug}`);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={wrapperRef}>
      <div className="relative flex items-center w-full h-10 sm:h-14 rounded-xl sm:rounded-2xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
        <div className="grid place-items-center h-full w-10 sm:w-14 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
        <input
          className="peer h-full w-full outline-none text-slate-700 font-medium bg-transparent text-sm sm:text-lg placeholder-slate-400 pr-4"
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
        />
        {loading && (
          <div className="absolute right-4 grid place-items-center">
            <div className="w-5 h-5 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
          <ul className="max-h-[300px] overflow-auto">
            {results.map((res, i) => (
              <li key={`${res.slug}-${i}`}>
                <button
                  type="button"
                  onClick={() => handleSelect(res)}
                  className="w-full text-left px-5 py-3 hover:bg-slate-50 transition-colors flex items-center justify-between group border-b border-slate-50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${res.type === 'provincia' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {res.type === 'provincia' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-base">{res.label}</p>
                      <p className="text-xs text-slate-500 font-medium">{res.sublabel || 'Municipio'}</p>
                    </div>
                  </div>
                  <span className="text-slate-300 group-hover:text-blue-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {isOpen && !loading && query.length >= 2 && results.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 text-center animate-in fade-in">
          <p className="text-slate-500">No encontramos ningún municipio o provincia coincidente.</p>
        </div>
      )}
    </div>
  );
}
