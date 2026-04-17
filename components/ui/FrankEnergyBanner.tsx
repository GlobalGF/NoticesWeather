"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";

interface FrankEnergyBannerProps {
  municipio: string;
  className?: string;
}

/**
 * Premium Frank Energy Affiliate Banner
 * Designed for high CTR with vibrant colors and smooth animations.
 */
export function FrankEnergyBanner({ municipio, className = "" }: FrankEnergyBannerProps) {
  // Clean punctuation from municipio name for the sub-id if necessary, 
  // but usually encodeURIComponent is enough.
  const affiliateUrl = `https://glp8.net/c/?si=19823&li=1845132&wi=419863&ws=${encodeURIComponent(municipio)}`;

  return (
    <motion.a
      href={affiliateUrl}
      target="_blank"
      rel="sponsored noopener noreferrer"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`group relative block overflow-hidden rounded-2xl bg-[#1a1a1a] shadow-lg transition-all hover:shadow-2xl hover:shadow-[#E6007E]/10 ${className}`}
    >
      {/* Glossy overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#E6007E]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative flex flex-col gap-4 px-5 py-5 border border-white/5 rounded-2xl md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E6007E] text-white shadow-lg shadow-[#E6007E]/30 group-hover:rotate-6 transition-transform">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight break-words">
              Ahorra en luz en <span className="text-[#E6007E]">{municipio}</span>
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-400 font-medium tracking-tight">
              Calcula tu ahorro con la tarifa de Frank Energy aquí
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#1a1a1a] shadow-xl transition-all group-hover:bg-[#E6007E] group-hover:text-white self-start md:self-center whitespace-nowrap">
          <span>Calcular ahora</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
      
      {/* Bottom accent bar */}
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-[#E6007E] transition-all duration-500 group-hover:w-full" />
    </motion.a>
  );
}
