"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface CityResult {
    id: string;
    name: string;
    subtitle: string;
    url: string;
}

export default function CitySearchInput() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<CityResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchCities = async () => {
            if (query.length < 2) {
                setResults([]);
                setIsOpen(false);
                return;
            }

            setIsLoading(true);
            try {
                const res = await fetch(`/api/search-cities?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data.results || []);
                    setIsOpen(true);
                }
            } catch (err) {
                console.error("Error searching cities", err);
            } finally {
                setIsLoading(false);
            }
        };

        const timerId = setTimeout(() => {
            fetchCities();
        }, 300); // 300ms debounce

        return () => clearTimeout(timerId);
    }, [query]);

    const handleSelect = (url: string) => {
        setIsOpen(false);
        setQuery("");
        router.push(url);
    };

    return (
        <div className="relative max-w-lg w-full mx-auto" ref={dropdownRef}>
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <input
                    type="text"
                    className="block w-full pl-11 pr-10 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-[16px] transition-all shadow-lg"
                    placeholder="Escribe tu ciudad (ej. Madrid, Valencia...)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => { if (results.length > 0) setIsOpen(true) }}
                />
                {isLoading && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <div className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
                    </div>
                )}
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform opacity-100 scale-100 transition-all origin-top duration-200">
                    <ul className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                        {results.map((r) => (
                            <li key={r.id}>
                                <button
                                    className="w-full text-left px-5 py-4 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none transition-colors flex flex-col items-start group"
                                    onClick={() => handleSelect(r.url)}
                                >
                                    <span className="text-slate-800 font-bold group-hover:text-emerald-600 transition-colors">{r.name}</span>
                                    <span className="text-xs text-slate-500 mt-1">{r.subtitle}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
