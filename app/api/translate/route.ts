import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { text, targetLang } = body;

        // 1. Validación más estricta
        if (!text) {
            return NextResponse.json({ error: 'El texto es obligatorio' }, { status: 400 });
        }
        if (!targetLang) {
            return NextResponse.json({ error: 'El idioma destino es obligatorio' }, { status: 400 });
        }

        // 2. IMPORTANTE: Añadir email para aumentar el límite gratuito (50,000 caracteres/día)
        // Puedes usar tu email real o uno genérico válido.
        const email = 'tornaghi.gl@gmail.com'; 

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
                match: data.match // Opcional: devuelve la calidad de la coincidencia
            });
        } else {
            return NextResponse.json({ error: 'No se pudo obtener la traducción' }, { status: 500 });
        }

    } catch (error) {
        console.error('Error interno de traducción:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}