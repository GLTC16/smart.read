// services/translationService.ts

export async function translateText(text: string, targetLang: string): Promise<string> {
    if (!text) return "";

    try {
        // Ahora llamamos a NUESTRA propia API interna (/api/translate)
        // Esto evita el bloqueo CORS y es más seguro.
        const response = await fetch(`/api/translate?text=${encodeURIComponent(text)}&lang=${targetLang}`);

        if (!response.ok) throw new Error("Error en la petición API interna");

        const data = await response.json();

        // MyMemory devuelve la traducción aquí:
        if (data && data.responseData && data.responseData.translatedText) {
            return data.responseData.translatedText;
        }

        return "No se pudo traducir.";

    } catch (error) {
        console.error("Error de traducción:", error);
        return "Error de conexión.";
    }
}