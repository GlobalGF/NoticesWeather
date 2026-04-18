"use client";

import type { SolarSubsidyStatus } from "@/data/types";
import { AlertCircle, CheckCircle, Clock, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface ProgrammaticUrgencyStatusProps {
  municipio: string;
  className?: string;
  finPlazo?: string | null;
  status?: SolarSubsidyStatus;
}

/**
 * ProgrammaticUrgencyStatus
 * Strategic trust component for PSEO pages to boost CTR and conversion.
 * Shows a real-time status mapped from BDNS synchronization.
 */
export function ProgrammaticUrgencyStatus({ 
  municipio, 
  finPlazo,
  status = "ABIERTA",
  className = "" 
}: ProgrammaticUrgencyStatusProps) {
  const currentMonth = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date());
  
  // Calcular días restantes si hay fecha fin
  let diasRestantes = null;
  if (finPlazo) {
      const fin = new Date(finPlazo).getTime();
      const hoy = new Date().getTime();
      const diffTime = fin - hoy;
      if (diffTime > 0) {
          diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
  }

  const isCerrada = status === "CERRADA" || status === "AGOTADA";
  
  // Theme selection
  const bgClass = isCerrada ? "bg-amber-50/50 border-amber-100" : "bg-emerald-50/50 border-emerald-100";
  const iconBgClass = isCerrada ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600";
  const textClass = isCerrada ? "text-amber-900" : "text-emerald-900";
  const subTextClass = isCerrada ? "text-amber-700" : "text-emerald-700";
  const badgeClass = isCerrada ? "bg-amber-500 ring-amber-500/10" : "bg-emerald-500 ring-emerald-500/10";

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-xl border p-4 shadow-sm ${bgClass} ${className}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconBgClass}`}>
            {isCerrada ? <AlertCircle className="h-6 w-6" /> : <CheckCircle className="h-6 w-6" />}
          </div>
          <div>
            <p className={`text-sm font-bold leading-tight ${textClass}`}>
              Estado de las ayudas en {municipio} hoy
            </p>
            <p className={`text-xs font-medium ${subTextClass}`}>
              {diasRestantes && !isCerrada 
                ? <span className="flex items-center gap-1 mt-0.5"><Clock className="h-3 w-3" /> Quedan {diasRestantes} días en plazo BDNS</span> 
                : `Actualizado para ${currentMonth} de ${new Date().getFullYear()}`
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm ring-4 ${badgeClass}`}>
            {!isCerrada && <Zap className="h-3 w-3 fill-current" />}
            <span>{status === "ABIERTA" ? "Disponibles" : status}</span>
          </div>
          {!isCerrada && <div className={`h-2 w-2 rounded-full animate-pulse ${badgeClass.split(' ')[0]}`} />}
        </div>
      </div>
      
      {/* Decorative background pulse */}
      <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full blur-2xl opacity-10 ${badgeClass.split(' ')[0]}`} />
    </motion.div>
  );
}

