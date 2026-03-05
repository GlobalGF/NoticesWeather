export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      municipalities: {
        Row: {
          id: number;
          name: string;
          slug: string;
          province: string;
          autonomous_community: string;
          population: number;
          priority_score: number;
        };
      };
      ibi_bonifications: {
        Row: {
          municipality_slug: string;
          percentage: number;
          years: number;
          source_url: string | null;
          updated_at: string;
        };
      };
      tariffs: {
        Row: {
          slug: string;
          name: string;
        };
      };
      consumption_bands: {
        Row: {
          slug: string;
          min_kwh: number;
          max_kwh: number;
        };
      };
      solar_metrics: {
        Row: {
          municipality_slug: string;
          annual_irradiance_kwh_m2: number;
        };
      };
      municipios_energia: {
        Row: {
          municipio: string;
          provincia: string;
          comunidad_autonoma: string;
          habitantes: number;
          horas_sol: number;
          ahorro_estimado: number;
          bonificacion_ibi: number | null;
          bonificacion_icio: number | null;
          subvencion_autoconsumo: number | null;
          irradiacion_solar: number;
          precio_medio_luz: number;
          slug: string;
        };
      };
      solar_subsidies: {
        Row: {
          municipality_slug: string;
          program_slug: string;
          program_name: string;
          amount_eur: number;
          source_url: string | null;
          updated_at: string;
        };
      };
      urban_regulations: {
        Row: {
          municipality_slug: string;
          rule_slug: string;
          title: string;
          license_required: boolean;
          summary: string;
          updated_at: string;
        };
      };
      inverter_ev_compatibility: {
        Row: {
          inverter_slug: string;
          charger_slug: string;
          tariff_slug: string;
          compatible: boolean;
          notes: string | null;
          efficiency_score: number;
          updated_at: string;
        };
      };
      radiation_profiles: {
        Row: {
          municipality_slug: string;
          annual_kwh_m2: number;
          optimal_tilt_deg: number;
          source: string | null;
          updated_at: string;
        };
      };
      shared_self_consumption_coefficients: {
        Row: {
          municipality_slug: string;
          mode_slug: string;
          coefficient: number;
          legal_reference: string | null;
          updated_at: string;
        };
      };
    };
  };
};