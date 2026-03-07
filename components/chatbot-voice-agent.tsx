'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Bot, Mic, MicOff, X, Send, StopCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

// --- Types & Globals ---
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

interface ChatbotVoiceAgentProps {
    onClose?: () => void
}

export function ChatbotVoiceAgent({ onClose }: ChatbotVoiceAgentProps) {
    // --- State ---
    const [status, setStatus] = useState('Initializing...')
    const [logs, setLogs] = useState<{ role: 'user' | 'agent'; text: string }[]>([])
    const [isListening, setIsListening] = useState(false)
    const [isSupported, setIsSupported] = useState(true)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [input, setInput] = useState('')

    const recognitionRef = useRef<WebSpeechRecognition | null>(null)
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
    const accumulatedTranscriptRef = useRef<string>('')
    const lastProcessedTranscriptRef = useRef<string>('')
    const SILENCE_DELAY_MS = 2000 
    const ttsQueueRef = useRef<string[]>([])
    const ttsAudioRef = useRef<HTMLAudioElement | null>(null)
    const isPlayingTtsRef = useRef(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth',
            })
        }
    }, [logs])

    const clearSilenceTimer = useCallback(() => {
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current)
            silenceTimerRef.current = null
        }
    }, [])

    const playTtsQueue = useCallback(async () => {
        if (isPlayingTtsRef.current || ttsQueueRef.current.length === 0) return
        const text = ttsQueueRef.current.shift()
        if (!text) return

        recognitionRef.current?.stop()
        setIsListening(false)
        isPlayingTtsRef.current = true
        setIsSpeaking(true)
        setStatus('Agent is speaking...')

        try {
            const res = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            })
            if (!res.ok) throw new Error('TTS failed')
            
            const result = await res.json()
            if (!result.audioContent) throw new Error('No audio')

            const audioBuffer = Uint8Array.from(atob(result.audioContent), (c) => c.charCodeAt(0))
            const url = URL.createObjectURL(new Blob([audioBuffer], { type: 'audio/mpeg' }))
            const audio = new Audio(url)
            ttsAudioRef.current = audio

            audio.onended = () => {
                URL.revokeObjectURL(url)
                isPlayingTtsRef.current = false
                setIsSpeaking(false)
                if (ttsQueueRef.current.length > 0) {
                    playTtsQueue()
                } else {
                    setStatus('Listening...')
                    startListening()
                }
            }
            await audio.play()
        } catch (err) {
            console.error(err)
            isPlayingTtsRef.current = false
            setIsSpeaking(false)
            startListening()
        }
    }, [])

    const runAgentFlow = useCallback(async (userMessage: string) => {
        const cleanMsg = userMessage.trim()
        if (!cleanMsg || cleanMsg === lastProcessedTranscriptRef.current) return
        
        lastProcessedTranscriptRef.current = cleanMsg
        setLogs((prev) => [...prev, { role: 'user', text: cleanMsg }])
        setStatus('Thinking...')

        setTimeout(() => { lastProcessedTranscriptRef.current = '' }, 2000)

        setTimeout(() => {
            const replies = [
                "I've started analyzing your request.",
                "Searching for available workers in your area...",
                "I found 3 highly-rated workers nearby. Would you like their details?"
            ]
            
            setLogs((prev) => [...prev, ...replies.map(r => ({ role: 'agent' as const, text: r }))])
            ttsQueueRef.current = [...replies]
            playTtsQueue()
        }, 1200)
    }, [playTtsQueue])

    const sendTextMessage = () => {
        if (!input.trim()) return
        runAgentFlow(input.trim())
        setInput('')
    }

    // --- Speech Recognition Setup ---
    const stopListening = useCallback(() => {
        recognitionRef.current?.stop()
        setIsListening(false)
        clearSilenceTimer()
        accumulatedTranscriptRef.current = ''
        if (ttsAudioRef.current) {
            ttsAudioRef.current.pause()
            ttsAudioRef.current = null
        }
        isPlayingTtsRef.current = false
        setIsSpeaking(false)
    }, [clearSilenceTimer])

    const startListening = useCallback(() => {
        if (!recognitionRef.current || !isSupported || isSpeaking) return
        try {
            recognitionRef.current.start()
            setIsListening(true)
            setStatus('Listening...')
        } catch (e) {
            // Already started
        }
    }, [isSupported, isSpeaking])

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SpeechRecognition) {
            setIsSupported(false)
            setStatus('Browser not supported')
            return
        }

        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onresult = (event) => {
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i]
                const transcript = result[0]?.transcript ?? ''
                if (result.isFinal && transcript.trim()) {
                    accumulatedTranscriptRef.current += (accumulatedTranscriptRef.current ? ' ' : '') + transcript.trim()
                }
            }
            // Reset silence timer on any activity (final or interim) so we only send after user stops talking
            clearSilenceTimer()
            if (accumulatedTranscriptRef.current.trim()) {
                silenceTimerRef.current = setTimeout(() => {
                    const toSend = accumulatedTranscriptRef.current.trim()
                    if (toSend) runAgentFlow(toSend)
                    accumulatedTranscriptRef.current = ''
                }, SILENCE_DELAY_MS)
            }
        }

        recognition.onend = () => {
            setIsListening(false)
            accumulatedTranscriptRef.current = ''
        }
        recognitionRef.current = recognition
        startListening()

        return () => stopListening()
    }, [runAgentFlow, startListening, stopListening, clearSilenceTimer])

    const toggleListening = () => {
        if (isListening || isSpeaking) {
            stopListening()
            setStatus('Paused')
        } else {
            startListening()
        }
    }

    return (
        <div className="flex h-full flex-col bg-background animate-in fade-in-0 zoom-in-95 duration-500 overflow-hidden shadow-2xl border rounded-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4 bg-muted/20 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Bot className={cn("h-6 w-6 transition-all", isSpeaking ? "text-primary scale-110" : "text-muted-foreground")} />
                        {isSpeaking && (
                             <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                             </span>
                        )}
                    </div>
                    <div>
                        <h2 className="font-bold text-sm leading-none">Denki Voice</h2>
                        <p className="text-[10px] text-muted-foreground mt-1 uppercase font-semibold tracking-tighter">
                            {status}
                        </p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Message Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth bg-gradient-to-b from-transparent to-muted/5">
                {logs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-4 grayscale">
                        <Mic className="h-12 w-12 text-primary animate-pulse" />
                        <p className="text-sm font-medium">Listening for your request...</p>
                    </div>
                ) : (
                    logs.map((log, index) => (
                        <div key={index} className={cn("flex w-full animate-in slide-in-from-bottom-2 duration-300", log.role === 'user' ? "justify-end" : "justify-start")}>
                            <div className={cn(
                                "max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-sm",
                                log.role === 'user' 
                                    ? "bg-primary text-primary-foreground rounded-br-none" 
                                    : "bg-muted/80 border rounded-bl-none backdrop-blur-sm"
                            )}>
                                {log.text}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Controls Section */}
            <div className="border-t bg-muted/30 p-6 space-y-6 backdrop-blur-lg">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative flex items-center justify-center">
                        {isListening && (
                            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping scale-150" />
                        )}
                        <Button
                            type="button"
                            size="icon"
                            variant={isListening ? 'default' : isSpeaking ? 'destructive' : 'outline'}
                            className={cn(
                                "h-20 w-20 rounded-full shadow-xl relative z-10 transition-all duration-300",
                                isListening && "scale-110 shadow-primary/20 ring-4 ring-primary/10"
                            )}
                            onClick={toggleListening}
                            disabled={!isSupported}
                        >
                            {isSpeaking ? (
                                <StopCircle className="h-8 w-8 animate-pulse" />
                            ) : isListening ? (
                                <MicOff className="h-8 w-8" />
                            ) : (
                                <Mic className="h-8 w-8" />
                            )}
                        </Button>
                    </div>
                </div>

                <div className="relative flex items-center gap-2 max-w-sm mx-auto w-full group">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type instead..."
                        className="rounded-full bg-background/80 h-14 border-muted-foreground/20 pr-12 focus-visible:ring-primary/30 transition-all"
                        onKeyDown={(e) => e.key === 'Enter' && sendTextMessage()}
                    />
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="absolute right-1 h-8 w-8 rounded-full hover:bg-primary/10 text-primary opacity-0 group-focus-within:opacity-100 transition-opacity"
                        onClick={sendTextMessage}
                        disabled={!input.trim()}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}