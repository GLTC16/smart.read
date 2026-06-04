// services/translationService.ts

/**
 * High-precision translation service.
 * Primary: Google Translate Neural Machine Translation (NMT)
 * Fallback: MyMemory Translation Memory
 *
 * Google NMT endpoint supports ~5000 chars per request.
 * For longer texts we split into chunks and concatenate results.
 */

const GOOGLE_CHUNK_LIMIT = 4800; // leave margin below 5000

/**
 * Split text into chunks that respect sentence boundaries when possible.
 */
function splitIntoChunks(text: string, maxLen: number): string[] {
    if (text.length <= maxLen) return [text];

    const chunks: string[] = [];
    let remaining = text;

    while (remaining.length > 0) {
        if (remaining.length <= maxLen) {
            chunks.push(remaining);
            break;
        }

        // Try to split at the last sentence boundary within limit
        const slice = remaining.slice(0, maxLen);
        const lastPeriod = Math.max(
            slice.lastIndexOf('. '),
            slice.lastIndexOf('。'),
            slice.lastIndexOf('.\n'),
            slice.lastIndexOf('! '),
            slice.lastIndexOf('? '),
        );

        let splitAt: number;
        if (lastPeriod > maxLen * 0.3) {
            // Found a sentence boundary in the latter portion
            splitAt = lastPeriod + 1;
        } else {
            // No good boundary — split at last space
            const lastSpace = slice.lastIndexOf(' ');
            splitAt = lastSpace > maxLen * 0.3 ? lastSpace : maxLen;
        }

        chunks.push(remaining.slice(0, splitAt).trim());
        remaining = remaining.slice(splitAt).trim();
    }

    return chunks;
}

/**
 * Translate using Google Translate NMT (primary).
 * Concatenates all sentence segments from the response for complete paragraph translation.
 */
async function translateWithGoogle(text: string, targetLang: string): Promise<string | null> {
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        const response = await fetch(url);
        if (!response.ok) return null;

        const data = await response.json();

        // Google returns [[[translated_segment_1, original_1, ...], [translated_segment_2, ...], ...]]
        // We must concatenate ALL segments for complete paragraph translation
        if (data && Array.isArray(data[0])) {
            const fullTranslation = data[0]
                .filter((segment: unknown[]) => segment && segment[0])
                .map((segment: unknown[]) => segment[0])
                .join('');
            if (fullTranslation.trim()) return fullTranslation;
        }

        return null;
    } catch {
        return null;
    }
}

/**
 * Translate using MyMemory (fallback).
 */
async function translateWithMyMemory(text: string, targetLang: string): Promise<string | null> {
    try {
        const langPair = `Autodetect|${targetLang}`;
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}&de=tornaghi.gl@gmail.com`;

        const response = await fetch(url);
        if (!response.ok) return null;

        const data = await response.json();

        if (data?.responseData?.translatedText) {
            const translated = data.responseData.translatedText;
            if (!translated.includes('MYMEMORY WARNING') && !translated.includes('LIMIT EXCEEDED')) {
                return translated;
            }
        }

        return null;
    } catch {
        return null;
    }
}

/**
 * Main translation function.
 * - For texts under the Google limit: single request
 * - For longer texts: split into chunks, translate each, concatenate
 * - Falls back to MyMemory if Google fails
 */
export async function translateText(text: string, targetLang: string): Promise<string> {
    if (!text || !text.trim()) return '';

    const trimmed = text.trim();
    const chunks = splitIntoChunks(trimmed, GOOGLE_CHUNK_LIMIT);

    // Try Google NMT first (high quality neural translation)
    try {
        const results = await Promise.all(
            chunks.map(chunk => translateWithGoogle(chunk, targetLang))
        );

        // Check if all chunks succeeded
        if (results.every(r => r !== null)) {
            return results.join(' ');
        }
    } catch {
        // Fall through to MyMemory
    }

    // Fallback: MyMemory (limited to ~500 chars, so only use first chunk)
    try {
        // MyMemory has a strict 500 char limit, so truncate if needed
        const truncated = trimmed.slice(0, 490);
        const result = await translateWithMyMemory(truncated, targetLang);
        if (result) return result;
    } catch {
        // Both providers failed
    }

    return '';
}