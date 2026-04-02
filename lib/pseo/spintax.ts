import { createHash } from "crypto";

/**
 * Convierte un string en un número determinista para usarlo como semilla.
 */
function getDeterministicSeed(input: string): number {
    const hash = createHash("md5").update(input).digest("hex");
    return parseInt(hash.substring(0, 8), 16);
}

/**
 * Procesa un texto en formato Spintax: {Opcion1|Opcion2|Opcion3}
 * Utiliza una semilla determinista (ej. nombre de la ciudad) para devolver siempre
 * la misma variación para una semilla dada. Soporta spintax recursivo/anidado.
 */
export function parseSpintax(text: string, seedString: string): string {
    let result = text;
    let baseSeed = getDeterministicSeed(seedString);
    
    // Función recursiva para procesar anidamientos desde adentro hacia afuera
    const processSpintax = (str: string): string => {
        const regex = /\{([^{}]+)\}/g;
        let match;
        let hasMatches = false;
        
        let tempStr = str;

        while ((match = regex.exec(tempStr)) !== null) {
            hasMatches = true;
            const fullMatch = match[0];
            const options = match[1].split("|");
            
            // Usamos un ligero offset por match index + baseSeed para variar elecciones en el mismo texto
            const localSeed = baseSeed + match.index;
            const selectedIndex = localSeed % options.length;
            
            tempStr = tempStr.substring(0, match.index) + options[selectedIndex] + tempStr.substring(match.index + fullMatch.length);
            
            // Reiniciar el regex al haber modificado el string original
            regex.lastIndex = 0;
        }

        return hasMatches ? processSpintax(tempStr) : tempStr;
    };

    return processSpintax(result);
}

/**
 * Reemplaza tokens simples en el string resultante tras procesar el Spintax.
 * Ejemplo: "[CITY]" por "Madrid".
 */
export function replaceTokens(text: string, variables: Record<string, string | number>): string {
    let result = text;
    for (const [key, value] of Object.entries(variables)) {
        // Ignora valores indefinidos o nulos asegurando que entran como string vacío si ocurre
        const safeValue = value !== null && value !== undefined ? String(value) : '';
        const regex = new RegExp(`\\[${key}\\]`, "g");
        result = result.replace(regex, safeValue);
    }
    return result;
}

/**
 * Flujo completo para un párrafo. 
 * Combina Spintax Determinista y Reemplazo de Variables de Base de Datos.
 */
export function generateDynamicText(spintaxTemplate: string, seed: string, variables: Record<string, string | number>): string {
    const spun = parseSpintax(spintaxTemplate, seed);
    return replaceTokens(spun, variables);
}
