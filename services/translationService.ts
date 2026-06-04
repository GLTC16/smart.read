// services/translationService.ts

/**
 * Traduce texto usando la API pública de MyMemory como principal.
 * Si falla o supera el límite, usa Google Translate API como respaldo.
 */
export async function translateText(text: string, targetLang: string): Promise<string> {
    if (!text) return "";

    // 1. Intentar con MyMemory
    try {
        const langPair = `Autodetect|${targetLang}`;
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}&de=tornaghi.gl@gmail.com`;
        
        const response = await fetch(url);
        const data = await response.json();

        // Verificar si es válido y no es un error de cuota ("QUERY LENGTH LIMIT EXCEEDED" o similar)
        if (data && data.responseData && data.responseData.translatedText) {
            const translated = data.responseData.translatedText;
            // MyMemory devuelve advertencias en el texto traducido cuando se pasa el límite
            if (!translated.includes("MYMEMORY WARNING") && !translated.includes("LIMIT EXCEEDED")) {
                return translated;
            }
        }
    } catch (error) {
        console.warn("MyMemory falló, intentando con API secundaria...", error);
    }

    // 2. Fallback: Google Translate API (No oficial, endpoint público)
    try {
        console.log("Usando API secundaria (Google)...");
        const fallbackUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        const response = await fetch(fallbackUrl);
        const data = await response.json();
        
        // El formato de Google es [[["Texto traducido", "Original", ...]]]
        if (data && data[0] && data[0][0] && data[0][0][0]) {
            return data[0][0][0];
        }
    } catch (error) {
        console.error("Ambas APIs de traducción fallaron:", error);
    }

    return "No se pudo traducir en este momento. Intenta más tarde.";
}