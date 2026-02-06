import { NextResponse } from 'next/server';

// ⚠️ ¡IMPORTANTE! Debe decir "export async function"
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text');
    const targetLang = searchParams.get('lang');

    if (!text || !targetLang) {
        return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    // Si quieres usar el límite alto gratuito, pon tu email aquí.
    const email = 'tornaghi.gl@gmail.com'; 

    const externalUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=Autodetect|${targetLang}&de=${email}`;

    try {
        const response = await fetch(externalUrl);
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Error al conectar con MyMemory' }, { status: 500 });
    }
}
