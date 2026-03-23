export interface ProvinceMetadata {
    backgroundUrl: string;
    description: string;
    highlights: string[];
}

export const PROVINCES_METADATA: Record<string, ProvinceMetadata> = {
    "madrid": {
        backgroundUrl: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&q=80&w=800",
        description: "Líder en instalaciones residenciales con altas bonificaciones IBI.",
        highlights: ["Alta rentabilidad", "Subvenciones activas"]
    },
    "barcelona": {
        backgroundUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&q=80&w=800",
        description: "Gran densidad de instaladores certificados y clima mediterráneo ideal.",
        highlights: ["Soporte técnico local", "Ahorro garantizado"]
    },
    "sevilla": {
        backgroundUrl: "https://images.unsplash.com/photo-1559121225-4c96221d6dbb?auto=format&fit=crop&q=80&w=800",
        description: "Máxima radiación solar para un retorno de inversión récord.",
        highlights: ["Sol todo el año", "Máximo rendimiento"]
    },
    "valencia": {
        backgroundUrl: "https://images.unsplash.com/photo-1534305858711-2309192934c9?auto=format&fit=crop&q=80&w=800",
        description: "Excelente balance entre irradiación y costes de instalación.",
        highlights: ["Equilibrio coste/ahorro", "Clima óptimo"]
    },
    "malaga": {
        backgroundUrl: "https://images.unsplash.com/photo-1512753360425-422325bb081d?auto=format&fit=crop&q=80&w=800",
        description: "La costa del sol ofrece condiciones premium para el autoconsumo.",
        highlights: ["3000 horas de sol", "ROI acelerado"]
    },
    "alicante": {
        backgroundUrl: "https://images.unsplash.com/photo-1544911845-1f34a3eb46b1?auto=format&fit=crop&q=80&w=800",
        description: "Región con gran tradición solar y políticas locales favorables.",
        highlights: ["Ecosistema solar MAD", "Ayudas locales"]
    },
    "cadiz": {
        backgroundUrl: "https://images.unsplash.com/photo-1584282766327-0cf87515f401?auto=format&fit=crop&q=80&w=800",
        description: "Radiación atlántica de alta intensidad para baterías de litio.",
        highlights: ["Vientos favorables", "Máxima eficiencia"]
    },
    "islas-baleares": {
        backgroundUrl: "https://images.unsplash.com/photo-1572099351052-ccd8715bd8fc?auto=format&fit=crop&q=80&w=800",
        description: "Especialmente rentable debido a los altos costes de energía insular.",
        highlights: ["Ahorro insular", "Energía limpia"]
    },
    "granada": {
        backgroundUrl: "https://images.unsplash.com/photo-1563725585501-831ae637841c?auto=format&fit=crop&q=80&w=800",
        description: "Combinación de altitud y sol que mejora el rendimiento de paneles.",
        highlights: ["Rendimiento térmico", "Gran irradiación"]
    },
    "murcia": {
        backgroundUrl: "https://images.unsplash.com/photo-1563212693-02685712f2df?auto=format&fit=crop&q=80&w=800",
        description: "La huerta de Europa es también una mina de energía solar.",
        highlights: ["Clima desértico ideal", "Instalación rápida"]
    }
};

export const DEFAULT_PROVINCE_METADATA: ProvinceMetadata = {
    backgroundUrl: "https://images.unsplash.com/photo-150939136634b-614bb32e050b?auto=format&fit=crop&q=80&w=800",
    description: "Descubre la rentabilidad de las baterías solares en tu zona.",
    highlights: ["Energía 100% renovable", "Ahorro mensual"]
};

export function getProvinceMetadata(slug: string): ProvinceMetadata {
    return PROVINCES_METADATA[slug] || DEFAULT_PROVINCE_METADATA;
}
