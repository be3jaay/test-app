'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Bot, Mic, MicOff, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

type SpeechRecognitionResultEvent = Event & {
    resultIndex: number
    results: {
        length: number
        [index: number]: {
            isFinal: boolean
            [index: number]: { transcript: string }
        }
    }
}

type WebSpeechRecognition = {
    continuous: boolean
    interimResults: boolean
    lang: string
    onresult: ((event: SpeechRecognitionResultEvent) => void) | null
    onend: (() => void) | null
    start: () => void
    stop: () => void
}

type SpeechRecognitionConstructor = new () => WebSpeechRecognition

declare global {
    interface Window {
        SpeechRecognition?: SpeechRecognitionConstructor
        webkitSpeechRecognition?: SpeechRecognitionConstructor
    }
}

type ChatbotVoiceAgentProps = {
    onClose?: () => void
}

export function ChatbotVoiceAgent({ onClose }: ChatbotVoiceAgentProps) {
    const [status, setStatus] = useState('Preparing microphone...')
    const [logs, setLogs] = useState<string[]>([])
    const [isListening, setIsListening] = useState(false)
    const [isSupported, setIsSupported] = useState(true)

    const recognitionRef = useRef<WebSpeechRecognition | null>(null)
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)

    const clearSilenceTimer = useCallback(() => {
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current)
            silenceTimerRef.current = null
        }
    }, [])

    const runAgentFlow = useCallback((userMessage: string) => {
        setLogs((prev) => [...prev, `[User] ${userMessage}`])
        setStatus('Understanding request...')

        setTimeout(() => {
            setLogs((prev) => [...prev, '[Agent] Analyzing problem...'])
            setStatus('Analyzing')
        }, 500)

        setTimeout(() => {
            setLogs((prev) => [...prev, '[Agent] Searching nearby workers...'])
            setStatus('Searching workers')
        }, 1200)

        setTimeout(() => {
            setLogs((prev) => [...prev, '[Agent] Found 3 workers near your location.'])
            setStatus('Listening...')
        }, 2000)
    }, [])

    const stopListening = useCallback(() => {
        recognitionRef.current?.stop()
        setIsListening(false)
        clearSilenceTimer()
    }, [clearSilenceTimer])

    const startListening = useCallback(() => {
        if (!recognitionRef.current || !isSupported) return

        try {
            recognitionRef.current.start()
            setIsListening(true)
            setStatus('Listening...')
        } catch {
            setStatus('Listening is already active...')
        }
    }, [isSupported])

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

        if (!SpeechRecognition) {
            setIsSupported(false)
            setStatus('Speech recognition is not supported on this browser.')
            return
        }

        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onresult = (event) => {
            let transcript = ''

            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript
            }

            if (!transcript.trim()) return

            clearSilenceTimer()
            silenceTimerRef.current = setTimeout(() => {
                runAgentFlow(transcript.trim())
            }, 2000)
        }

        recognition.onend = () => {
            setIsListening(false)
            setStatus((prev) => (prev === 'Speech recognition is not supported on this browser.' ? prev : 'Stopped'))
        }

        recognitionRef.current = recognition

        // Voice mode starts immediately when the sheet mounts.
        startListening()

        return () => {
            stopListening()
        }
    }, [clearSilenceTimer, runAgentFlow, startListening, stopListening])

    const toggleListening = () => {
        if (isListening) {
            stopListening()
            setStatus('Stopped')
            return
        }
        startListening()
    }

    return (
        <div className="flex h-full flex-col bg-background animate-in fade-in-0 zoom-in-95 duration-500">
            <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center gap-3">
                    <Bot className="h-6 w-6 text-primary" />
                    <div>
                        <h2 className="font-semibold">Denki Voice Agent</h2>
                        <p className="text-xs text-muted-foreground">Speech-first worker finder</p>
                    </div>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    aria-label="Close voice agent"
                >
                    <X className="h-5 w-5" />
                </Button>
            </div>

            <div className="border-b px-6 py-3 text-sm">
                Status: <span className="font-medium">{status}</span>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-6 text-sm font-mono">
                {logs.length === 0 ? (
                    <p className="text-muted-foreground">Speak now. I am already listening.</p>
                ) : (
                    logs.map((log, index) => (
                        <div key={index} className="text-muted-foreground">
                            {log}
                        </div>
                    ))
                )}
            </div>

            <div className="border-t px-6 py-8">
                <div className="flex items-center justify-center animate-in zoom-in-50 fade-in-0 duration-700 delay-150">
                    <Button
                        type="button"
                        size="icon"
                        variant={isListening ? 'default' : 'outline'}
                        className="h-24 w-24 rounded-full"
                        onClick={toggleListening}
                        disabled={!isSupported}
                        aria-label={isListening ? 'Stop listening' : 'Start listening'}
                    >
                        {isListening ? (
                            <MicOff className="h-10 w-10 animate-pulse" />
                        ) : (
                            <Mic className="h-10 w-10" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
