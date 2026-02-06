// services/translationService.ts

/**
 * Traduce texto usando la API pública y gratuita de MyMemory.
 * Límite: 500 palabras/día para usuarios anónimos.
 */
export async function translateText(text: string, targetLang: string): Promise<string> {
    if (!text) return "";

    // MyMemory usa el formato "IDIOMA_ORIGEN|IDIOMA_DESTINO"
    // Usamos 'Autodetect' para el origen y el idioma que elijas para el destino
    const langPair = `Autodetect|${targetLang}`;

    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        // Verificamos si la respuesta es válida
        if (data && data.responseData && data.responseData.translatedText) {
            return data.responseData.translatedText;
        } else {
            console.warn("La API no devolvió una traducción válida:", data);
            return "No se pudo traducir.";
        }
    } catch (error) {
        console.error("Error conectando con el servicio de traducción:", error);
        return "Error de conexión.";
    }
}