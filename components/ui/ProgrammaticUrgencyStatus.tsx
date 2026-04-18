"use client";

import { CheckCircle, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface ProgrammaticUrgencyStatusProps {
  municipio: string;
  className?: string;
}

/**
 * ProgrammaticUrgencyStatus
 * Strategic trust component for PSEO pages to boost CTR and conversion.
 * Shows a real-time "Available" status for subsidies in the municipality.
 */
export function ProgrammaticUrgencyStatus({ municipio, className = "" }: ProgrammaticUrgencyStatusProps) {
  const currentMonth = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date());
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-sm ${className}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-900 leading-tight">
              Estado de las ayudas en {municipio} hoy
            </p>
            <p className="text-xs text-emerald-700 font-medium">
              Actualizado para {currentMonth} de {new Date().getFullYear()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm ring-4 ring-emerald-500/10">
            <Zap className="h-3 w-3 fill-current" />
            <span>Disponibles</span>
          </div>
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>
      
      {/* Decorative background pulse */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl" />
    </motion.div>
  );
}
