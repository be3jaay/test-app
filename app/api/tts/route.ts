import { NextResponse } from 'next/server'

const INWORLD_TTS_API = process.env.INWORLD_TTS_API_URL || 'https://api.inworld.ai/tts/v1/voice'

export async function POST(request: Request) {
    const apiKey = process.env.INWORLD_TTS_API_KEY
    if (!apiKey) {
        return NextResponse.json(
            { error: 'TTS API key not configured (INWORLD_TTS_API_KEY)' },
            { status: 500 }
        )
    }

    let body: { text?: string }
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const text = body.text?.trim()
    if (!text) {
        return NextResponse.json({ error: 'Missing or empty "text" in body' }, { status: 400 })
    }

    try {
        const res = await fetch(INWORLD_TTS_API, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text,
                voiceId: 'default-lc-nkbmxzib3qgqmzb9gfa__design-voice-ee5b4dcb',
                modelId: 'inworld-tts-1.5-max',
                timestampType: 'WORD',
                speakingRate: 1.08,
                temperature: 1.02,
            }),
        })

        if (!res.ok) {
            const errText = await res.text()
            return NextResponse.json(
                { error: `TTS API error: ${res.status} ${errText}` },
                { status: res.status }
            )
        }

        const result = (await res.json()) as { audioContent?: string }
        if (!result.audioContent) {
            return NextResponse.json({ error: 'No audio content in TTS response' }, { status: 502 })
        }

        return NextResponse.json(result)
    } catch (err) {
        console.error('TTS proxy error:', err)
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'TTS request failed' },
            { status: 500 }
        )
    }
}
