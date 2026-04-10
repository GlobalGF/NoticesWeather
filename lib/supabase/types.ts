/**
 * Supabase database types — aligned with the actual production tables.
 *
 * Primary read tables (pSEO):
 *   - municipios_energia       ← denormalized, used by all municipality pages
 *   - pseo_index               ← slug index for sitemap + fallback
 *
 * Normalized schema tables (used as write/ETL source, not for page reads):
 *   - municipios, provincias, comunidades_autonomas
 *   - radiacion_solar, subvenciones_solares, bonificaciones_ibi, etc.
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      // -----------------------------------------------------------------------
      // PRIMARY pSEO READ TABLE
      // -----------------------------------------------------------------------
      municipios_energia: {
        Row: {
          id: number;
          slug: string;
          municipio: string;
          provincia: string;
          comunidad_autonoma: string;
          habitantes: number;
          horas_sol: number | null;
          ahorro_estimado: number | null;
          bonificacion_ibi: number | null;
          bonificacion_icio: number | null;
          subvencion_autoconsumo: number | null;
          irradiacion_solar: number | null;
          precio_medio_luz: number | null;
          precio_instalacion_min_eur: number | null;
          precio_instalacion_medio_eur: number | null;
          precio_instalacion_max_eur: number | null;
          eur_por_watio: number | null;
          updated_at: string;
          created_at: string;
        };
      };

      // -----------------------------------------------------------------------
      // SLUG INDEX TABLE (sitemap + fallback)
      // -----------------------------------------------------------------------
      pseo_slug_index: {
        Row: {
          slug: string;
          municipio: string | null;
          provincia: string | null;
          comunidad_autonoma: string | null;
          updated_at: string | null;
        };
      };

      pseo_index: {
        Row: {
          slug: string;
          municipio: string | null;
          provincia: string | null;
          comunidad_autonoma: string | null;
          irradiacion_solar: number | null;
          ahorro_estimado: number | null;
          precio_medio_luz: number | null;
          updated_at: string | null;
        };
      };

      // -----------------------------------------------------------------------
      // NORMALIZED SCHEMA TABLES (write / ETL only)
      // -----------------------------------------------------------------------
      municipios: {
        Row: {
          id: number;
          provincia_id: number;
          nombre: string;
          slug: string;
          codigo_ine: string | null;
          lat: number | null;
          lon: number | null;
          poblacion: number | null;
          superficie_km2: number | null;
          altitud_m: number | null;
          zona_climatica: string | null;
          seo_priority_score: number;
          activo: boolean;
          created_at: string;
          updated_at: string;
        };
      };

      provincias: {
        Row: {
          id: number;
          comunidad_id: number;
          nombre: string;
          slug: string;
          codigo_ine: string | null;
          lat: number | null;
          lon: number | null;
          created_at: string;
          updated_at: string;
        };
      };

      comunidades_autonomas: {
        Row: {
          id: number;
          nombre: string;
          slug: string;
          codigo_ine: string | null;
          lat: number | null;
          lon: number | null;
          created_at: string;
          updated_at: string;
        };
      };

      radiacion_solar: {
        Row: {
          id: number;
          municipio_id: number;
          fuente: string;
          anual_kwh_m2: number;
          horas_sol_anuales: number | null;
          inclinacion_optima_deg: number | null;
          azimut_optimo_deg: number | null;
          mensual_kwh_m2: number[] | null;
          confidence_score: number | null;
          vigente_desde: string | null;
          vigente_hasta: string | null;
          created_at: string;
          updated_at: string;
        };
      };

      subvenciones_solares: {
        Row: {
          id: number;
          titulo: string;
          slug: string;
          ambito: "nacional" | "comunidad" | "provincia" | "municipio";
          comunidad_id: number | null;
          provincia_id: number | null;
          municipio_id: number | null;
          organismo_convocante: string;
          programa: string | null;
          porcentaje_subvencion: number | null;
          importe_min_eur: number | null;
          importe_max_eur: number | null;
          estado: "abierta" | "cerrada" | "proxima" | "agotada";
          fecha_inicio: string | null;
          fecha_fin: string | null;
          url_oficial: string | null;
          notas: string | null;
          created_at: string;
          updated_at: string;
        };
      };

      bonificaciones_ibi: {
        Row: {
          id: number;
          municipio_id: number;
          porcentaje: number;
          anos_vigencia: number | null;
          limite_cuota_eur: number | null;
          aplica_residencial: boolean;
          aplica_empresas: boolean;
          requisitos: Json | null;
          fecha_inicio: string | null;
          fecha_fin: string | null;
          fuente_url: string | null;
          activo: boolean;
          created_at: string;
          updated_at: string;
        };
      };

      bonificaciones_icio: {
        Row: {
          id: number;
          municipio_id: number;
          porcentaje: number;
          tope_eur: number | null;
          aplica_residencial: boolean;
          aplica_empresas: boolean;
          requisitos: Json | null;
          fecha_inicio: string | null;
          fecha_fin: string | null;
          fuente_url: string | null;
          activo: boolean;
          created_at: string;
          updated_at: string;
        };
      };

      equipos_solares: {
        Row: {
          id: number;
          tipo: "panel" | "inversor" | "microinversor" | "optimizador" | "estructura" | "kit";
          fabricante: string;
          modelo: string;
          slug: string;
          potencia_w: number | null;
          eficiencia_pct: number | null;
          fases: 1 | 3 | null;
          mppt: number | null;
          tension_v: number | null;
          compatible_bateria: boolean;
          ficha_tecnica_url: string | null;
          activo: boolean;
          created_at: string;
          updated_at: string;
        };
      };

      baterias_solares: {
        Row: {
          id: number;
          fabricante: string;
          modelo: string;
          slug: string;
          tecnologia: "LFP" | "NMC" | "AGM" | "GEL" | "LTO" | "OTRA";
          capacidad_kwh: number;
          potencia_descarga_kw: number | null;
          ciclos: number | null;
          profundidad_descarga_pct: number | null;
          eficiencia_roundtrip_pct: number | null;
          tension_v: number | null;
          garantia_anos: number | null;
          ficha_tecnica_url: string | null;
          activo: boolean;
          created_at: string;
          updated_at: string;
        };
      };

      tarifas_electricas: {
        Row: {
          id: number;
          codigo: string;
          nombre: string;
          tipo_consumidor: "domestico" | "pyme" | "industrial" | "mixto";
          discriminacion_horaria: boolean;
          peaje_acceso: string | null;
          comercializadora: string | null;
          activa: boolean;
          created_at: string;
          updated_at: string;
        };
      };

      // -----------------------------------------------------------------------
      // LEAD FUNNEL TABLES (Phase 2+)
      // -----------------------------------------------------------------------
      leads: {
        Row: {
          id: number;
          nombre: string;
          telefono: string;
          email: string | null;
          tipo_vivienda: "unifamiliar" | "piso" | "empresa" | null;
          consumo_kwh: number | null;
          municipio_nombre: string | null;
          municipio_slug: string | null;
          provincia: string | null;
          estado: "nuevo" | "contactado" | "vendido" | "descartado";
          score: number | null;
          precio_venta_eur: number | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          ip_hash: string | null;
          direccion: string | null;
          codigo_postal: string | null;
          interes_bateria: string | null;
          tipo_tejado: string | null;
          consumo_mensual: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          nombre: string;
          telefono: string;
          email?: string | null;
          tipo_vivienda?: "unifamiliar" | "piso" | "empresa" | null;
          consumo_kwh?: number | null;
          municipio_nombre?: string | null;
          municipio_slug?: string | null;
          provincia?: string | null;
          estado?: "nuevo" | "contactado" | "vendido" | "descartado";
          score?: number | null;
          precio_venta_eur?: number | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          ip_hash?: string | null;
          direccion?: string | null;
          codigo_postal?: string | null;
          interes_bateria?: string | null;
          tipo_tejado?: string | null;
          consumo_mensual?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          nombre?: string;
          telefono?: string;
          email?: string | null;
          tipo_vivienda?: "unifamiliar" | "piso" | "empresa" | null;
          consumo_kwh?: number | null;
          municipio_nombre?: string | null;
          municipio_slug?: string | null;
          provincia?: string | null;
          estado?: "nuevo" | "contactado" | "vendido" | "descartado";
          score?: number | null;
          precio_venta_eur?: number | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          ip_hash?: string | null;
          direccion?: string | null;
          codigo_postal?: string | null;
          interes_bateria?: string | null;
          tipo_tejado?: string | null;
          consumo_mensual?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      publish_queue: {
        Row: {
          id: number;
          slug: string;
          municipio: string | null;
          provincia: string | null;
          comunidad: string | null;
          ruta_tipo: string | null;
          priority_score: number | null;
          status: "pending" | "published" | "indexed" | "error";
          sitemap_batch: string | null;
          scheduled_for: string | null;
          published_at: string | null;
          indexed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          slug: string;
          municipio?: string | null;
          provincia?: string | null;
          comunidad?: string | null;
          ruta_tipo?: string | null;
          priority_score?: number | null;
          status?: "pending" | "published" | "indexed" | "error";
          sitemap_batch?: string | null;
          scheduled_for?: string | null;
          published_at?: string | null;
          indexed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          slug?: string;
          municipio?: string | null;
          provincia?: string | null;
          comunidad?: string | null;
          ruta_tipo?: string | null;
          priority_score?: number | null;
          status?: "pending" | "published" | "indexed" | "error";
          sitemap_batch?: string | null;
          scheduled_for?: string | null;
          published_at?: string | null;
          indexed_at?: string | null;
          created_at?: string;
        };
      };

      indexing_log: {
        Row: {
          id: number;
          url: string;
          status: "submitted" | "indexed" | "error" | "skipped" | null;
          http_status: number | null;
          google_response: Json | null;
          queue_id: number | null;
          submitted_at: string;
        };
        Insert: {
          id?: number;
          url: string;
          status?: "submitted" | "indexed" | "error" | "skipped" | null;
          http_status?: number | null;
          google_response?: Json | null;
          queue_id?: number | null;
          submitted_at?: string;
        };
        Update: {
          id?: number;
          url?: string;
          status?: "submitted" | "indexed" | "error" | "skipped" | null;
          http_status?: number | null;
          google_response?: Json | null;
          queue_id?: number | null;
          submitted_at?: string;
        };
      };

      page_metrics: {
        Row: {
          id: number;
          slug: string;
          date: string;
          clicks: number | null;
          impressions: number | null;
          ctr: number | null;
          position: number | null;
          source: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          slug: string;
          date: string;
          clicks?: number | null;
          impressions?: number | null;
          ctr?: number | null;
          position?: number | null;
          source?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          slug?: string;
          date?: string;
          clicks?: number | null;
          impressions?: number | null;
          ctr?: number | null;
          position?: number | null;
          source?: string | null;
          created_at?: string;
        };
      };
    };
  };
};