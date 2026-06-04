import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { secret } = body;
        
        if (!secret || typeof secret !== 'string') {
            return NextResponse.json({ error: 'Falta el secreto' }, { status: 400 });
        }

        const devSecret = process.env.DEV_BYPASS_SECRET;

        if (secret === devSecret) {
            const cookieStore = await cookies();
            // Guardar cookie segura (HttpOnly por defecto via cookies())
            cookieStore.set({
                name: 'DEV_BYPASS_TOKEN',
                value: secret,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                path: '/',
                maxAge: 60 * 60 * 24 * 7 // 1 semana
            });

            return NextResponse.json({ success: true, message: 'Dev Bypass Activado' });
        } else {
            return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}
