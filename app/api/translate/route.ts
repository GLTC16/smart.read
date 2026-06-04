import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiting for serverless instance defense
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 50; // 50 requests
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // per 1 minute

export async function POST(request: NextRequest) {
    try {
        // --- 1. RATE LIMITING ---
        const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
        const now = Date.now();
        const userLimit = rateLimitMap.get(ip);
        
        if (userLimit && now < userLimit.resetTime) {
            if (userLimit.count >= RATE_LIMIT_MAX) {
                return NextResponse.json({ error: 'Too Many Requests (Rate Limit Exceeded)' }, { status: 429 });
            }
            userLimit.count++;
        } else {
            rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
        }
        // Cleanup old entries randomly to avoid memory leak in long-lived instances
        if (Math.random() < 0.1) {
            rateLimitMap.forEach((val, key) => { if (now > val.resetTime) rateLimitMap.delete(key); });
        }

        // --- 2. INPUT VALIDATION ---
        const body = await request.json();
        const { text, targetLang } = body;

        if (!text || typeof text !== 'string') {
            return NextResponse.json({ error: 'El texto es inválido o está vacío' }, { status: 400 });
        }
        if (text.length > 3000) {
            return NextResponse.json({ error: 'Payload Too Large: El texto excede el límite seguro de 3000 caracteres' }, { status: 413 });
        }
        if (!targetLang || typeof targetLang !== 'string' || targetLang.length > 10) {
            return NextResponse.json({ error: 'El idioma destino es inválido' }, { status: 400 });
        }

        // 2. IMPORTANTE: Añadir email para aumentar el límite gratuito (50,000 caracteres/día)
        const email = process.env.TRANSLATION_API_EMAIL || 'support@smartread.com'; 

        const langPair = `Autodetect|${targetLang}`;
        
        // Añadimos el parámetro '&de=' al final
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}&de=${email}`;

        const response = await fetch(url);

        // 3. Verificar si la red falló (status no es 200-299)
        if (!response.ok) {
            return NextResponse.json(
                { error: `Error de red al conectar con MyMemory: ${response.statusText}` }, 
                { status: response.status }
            );
        }

        const data = await response.json();

        // 4. Verificar errores específicos de MyMemory (ej: Cuota excedida)
        // responseStatus 403 o 429 suelen indicar problemas de límite
        if (data.responseStatus > 200 && data.responseStatus !== 200) {
             console.warn("MyMemory API Warning:", data.responseDetails);
             // A veces devuelven traducción parcial incluso con error, pero mejor avisar
        }

        if (data && data.responseData && data.responseData.translatedText) {
            return NextResponse.json({ 
                translatedText: data.responseData.translatedText,
                match: data.match 
            });
        } else {
            return NextResponse.json({ error: 'No se pudo obtener la traducción' }, { status: 500 });
        }

    } catch (error) {
        // Evitar fugar la pila de errores interna (Stack Trace) al cliente
        console.error('Security/Translation Error:', error);
        return NextResponse.json({ error: 'Error interno de procesamiento' }, { status: 500 });
    }
}