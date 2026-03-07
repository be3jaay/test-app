'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Bot, Mic, MicOff, X, Send, StopCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SpeakingOrb } from '@/components/speaking-orb'
import { cn } from '@/lib/utils'
import ApiService from '@/services/api-services'
import { useRouter } from 'next/navigation'

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
    const [status, setStatus] = useState('Initializing...')
    const [logs, setLogs] = useState<{ role: 'user' | 'agent'; text: string }[]>([])
    const [isListening, setIsListening] = useState(false)
    const [isSupported, setIsSupported] = useState(true)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [input, setInput] = useState('')
    const [recommendedWorker, setRecommendedWorker] = useState<any>(null)
    const [denkiPhase, setDenkiPhase] = useState<string>('gathering')
    const [matchData, setMatchData] = useState<any>(null)
    const [isBooking, setIsBooking] = useState(false)

    const recognitionRef = useRef<WebSpeechRecognition | null>(null)
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
    const accumulatedTranscriptRef = useRef<string>('')
    const lastProcessedTranscriptRef = useRef<string>('')
    const SILENCE_DELAY_MS = 2000
    const ttsQueueRef = useRef<string[]>([])
    const ttsAudioRef = useRef<HTMLAudioElement | null>(null)
    const isPlayingTtsRef = useRef(false)
    const isSpeakingRef = useRef(false)
    const isProcessingRef = useRef(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const conversationRef = useRef<{ role: string; content: string }[]>([])
    const lastDenkiResult = useRef<any>(null)
    const recommendedWorkerRef = useRef<any>(null)
    const excludedWorkerIdsRef = useRef<string[]>([])
    const runAgentFlowRef = useRef<(msg: string) => void>(() => {})
    const startListeningRef = useRef<() => void>(() => {})
    const router = useRouter()

    // Keep refs in sync with state so callbacks always have fresh values
    useEffect(() => { isSpeakingRef.current = isSpeaking }, [isSpeaking])
    useEffect(() => { recommendedWorkerRef.current = recommendedWorker }, [recommendedWorker])

    // --- Scroll ---
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

    // --- Start & Stop recognition ---
    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.onresult = null
            recognitionRef.current.stop()
        }
        setIsListening(false)
        clearSilenceTimer()
        accumulatedTranscriptRef.current = ''
        if (ttsAudioRef.current) {
            ttsAudioRef.current.pause()
            ttsAudioRef.current = null
        }
        isPlayingTtsRef.current = false
        isSpeakingRef.current = false
        setIsSpeaking(false)
    }, [clearSilenceTimer])

    const handleRecognitionResult = useCallback((event: SpeechRecognitionResultEvent) => {
        if (isSpeakingRef.current || isProcessingRef.current) return

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i]
            const transcript = result[0]?.transcript ?? ''
            if (result.isFinal && transcript.trim()) {
                accumulatedTranscriptRef.current += (accumulatedTranscriptRef.current ? ' ' : '') + transcript.trim()
            }
        }
        clearSilenceTimer()
        if (accumulatedTranscriptRef.current.trim()) {
            silenceTimerRef.current = setTimeout(() => {
                if (isSpeakingRef.current || isProcessingRef.current) return
                const toSend = accumulatedTranscriptRef.current.trim()
                if (toSend) runAgentFlowRef.current(toSend)
                accumulatedTranscriptRef.current = ''
            }, SILENCE_DELAY_MS)
        }
    }, [clearSilenceTimer])

    const startListening = useCallback(() => {
        if (!recognitionRef.current || !isSupported || isSpeakingRef.current || isPlayingTtsRef.current) return
        try {
            accumulatedTranscriptRef.current = ''
            recognitionRef.current.onresult = handleRecognitionResult
            recognitionRef.current.start()
            setIsListening(true)
            setStatus('Listening...')
        } catch (e) {}
    }, [isSupported, handleRecognitionResult])

    // --- TTS Queue ---
    const playTtsQueue = useCallback(async () => {
        if (isPlayingTtsRef.current || ttsQueueRef.current.length === 0) return
        const text = ttsQueueRef.current.shift()
        if (!text) return

        // Stop recognition fully
        if (recognitionRef.current) {
            recognitionRef.current.onresult = null
            recognitionRef.current.stop()
        }
        setIsListening(false)
        clearSilenceTimer()
        accumulatedTranscriptRef.current = ''
        isPlayingTtsRef.current = true
        isSpeakingRef.current = true
        setIsSpeaking(true)
        setStatus('Agent is speaking...')

        // Delay to avoid ghost transcripts
        await new Promise(r => setTimeout(r, 200))

        try {
            const res = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            })
            const result = await res.json()
            const audioBuffer = Uint8Array.from(atob(result.audioContent), c => c.charCodeAt(0))
            const url = URL.createObjectURL(new Blob([audioBuffer], { type: 'audio/mpeg' }))
            const audio = new Audio(url)
            ttsAudioRef.current = audio

            audio.onended = () => {
                URL.revokeObjectURL(url)
                isPlayingTtsRef.current = false
                isSpeakingRef.current = false
                setIsSpeaking(false)
                // Clear any transcript the mic may have picked up during playback
                accumulatedTranscriptRef.current = ''

                setTimeout(() => {
                    if (ttsQueueRef.current.length > 0) {
                        playTtsQueue()
                    } else {
                        // Longer delay before restarting mic to avoid picking up tail-end audio
                        setTimeout(() => {
                            accumulatedTranscriptRef.current = ''
                            setStatus('Listening...')
                            startListeningRef.current()
                        }, 500)
                    }
                }, 200)
            }
            await audio.play()
        } catch (err) {
            console.error(err)
            isPlayingTtsRef.current = false
            isSpeakingRef.current = false
            setIsSpeaking(false)
            startListeningRef.current()
        }
    }, [])

    const handleBookNow = useCallback(async () => {
        const denki = lastDenkiResult.current
        if (!denki?.category || !denki?.summary) return

        setIsBooking(true)
        setDenkiPhase('booking')
        setStatus('Booking...')
        const bookingLines = ["On it, setting that up now!"]
        setLogs((prev) => [...prev, ...bookingLines.map(r => ({ role: 'agent' as const, text: r }))])
        ttsQueueRef.current = [...bookingLines]
        playTtsQueue()

        try {
            let longitude: number | undefined
            let latitude: number | undefined
            try {
                const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
                )
                longitude = pos.coords.longitude
                latitude = pos.coords.latitude
            } catch { /* no location */ }

            const response = await ApiService.post<any>('/denki/match', {
                category: denki.category,
                summary: denki.summary,
                urgency: denki.urgency,
                workerId: recommendedWorkerRef.current?._id,
                longitude,
                latitude,
            })

            const data = response?.data?.data ?? response?.data ?? response
            setMatchData(data)

            const best = data?.bestMatch
            const confirmLines = best
                ? [`Sent a request to ${best.name}! You can tap View Request to check your booking status.`]
                : ["Your request is posted! Tap View Request to see the status."]

            setLogs((prev) => [...prev, ...confirmLines.map(r => ({ role: 'agent' as const, text: r }))])
            ttsQueueRef.current = [...confirmLines]
            setIsBooking(false)
            setDenkiPhase('matched')
            setStatus('Waiting for worker')
            playTtsQueue()
        } catch {
            setIsBooking(false)
            const errLines = ["Sorry, something went wrong. You can try again."]
            setLogs((prev) => [...prev, ...errLines.map(r => ({ role: 'agent' as const, text: r }))])
            ttsQueueRef.current = [...errLines]
            setDenkiPhase('summarizing')
            setStatus('Error')
            playTtsQueue()
        }
    }, [playTtsQueue, router])

    const handleSearchAnother = useCallback(async () => {
        const denki = lastDenkiResult.current
        if (!denki?.category) return

        // Add current worker to exclusion list
        if (recommendedWorkerRef.current?._id) {
            excludedWorkerIdsRef.current.push(recommendedWorkerRef.current._id)
        }

        setRecommendedWorker(null)
        setStatus('Searching...')
        const searchLines = ["Let me find someone else."]
        setLogs((prev) => [...prev, ...searchLines.map(r => ({ role: 'agent' as const, text: r }))])
        ttsQueueRef.current = [...searchLines]
        playTtsQueue()

        try {
            // Re-call chat with excluded workers so we get a different one
            conversationRef.current.push({ role: 'user', content: 'Can you find someone else?' })
            const response = await ApiService.post<any>('/denki/chat', {
                messages: conversationRef.current,
                excludeWorkerIds: excludedWorkerIdsRef.current,
            })

            const result = response?.data?.data ?? response?.data ?? response
            const worker = result?.recommendation?.worker

            if (worker) {
                // Force phase to summarizing so voice "book now" works
                result.phase = 'summarizing'
                lastDenkiResult.current = result
                setRecommendedWorker(worker)
                const ratingText = worker.rating > 0 ? `, rated ${worker.rating} out of 5` : ''
                const lines = [`How about ${worker.name}${ratingText}?`]
                conversationRef.current.push({ role: 'assistant', content: lines[0] })
                setLogs((prev) => [...prev, ...lines.map(r => ({ role: 'agent' as const, text: r }))])
                ttsQueueRef.current = [...lines]
                setDenkiPhase('summarizing')
                setStatus('Found another option')
            } else {
                lastDenkiResult.current = result
                const lines = ["No one else available right now. Want to go with the previous one?"]
                setLogs((prev) => [...prev, ...lines.map(r => ({ role: 'agent' as const, text: r }))])
                ttsQueueRef.current = [...lines]
                setStatus('No more results')
            }
            playTtsQueue()
        } catch {
            const errLines = ["Sorry, the search didn't work. Try again in a moment."]
            setLogs((prev) => [...prev, ...errLines.map(r => ({ role: 'agent' as const, text: r }))])
            ttsQueueRef.current = [...errLines]
            setStatus('Error')
            playTtsQueue()
        }
    }, [playTtsQueue])

    // --- Agent flow ---
    const runAgentFlow = useCallback(async (userMessage: string) => {
        const cleanMsg = userMessage.trim()
        if (!cleanMsg || cleanMsg === lastProcessedTranscriptRef.current) return
        if (isSpeakingRef.current || isProcessingRef.current) return

        isProcessingRef.current = true
        lastProcessedTranscriptRef.current = cleanMsg

        // Stop mic while processing to prevent self-listening
        if (recognitionRef.current) {
            recognitionRef.current.onresult = null
            recognitionRef.current.stop()
        }
        setIsListening(false)
        clearSilenceTimer()
        accumulatedTranscriptRef.current = ''

        setLogs(prev => [...prev, { role: 'user', text: cleanMsg }])
        setStatus('Thinking...')

        setTimeout(() => { lastProcessedTranscriptRef.current = '' }, 2000)

        // Check if user wants to try another worker
        const anotherIntent = /\b(another|different|someone else|other one|next one|try another|find another|search another)\b/i.test(cleanMsg)
        if (anotherIntent && lastDenkiResult.current?.phase === 'summarizing' && recommendedWorkerRef.current) {
            isProcessingRef.current = false
            handleSearchAnother()
            return
        }

        // Check if user said "book now" or similar while we have a recommendation
        const bookIntent = /\b(book|yes|go ahead|do it|confirm|let's go|match me|book now|sure|yeah)\b/i.test(cleanMsg)
        if (bookIntent && lastDenkiResult.current?.phase === 'summarizing' && recommendedWorkerRef.current) {
            isProcessingRef.current = false
            handleBookNow()
            return
        }

        try {
            conversationRef.current.push({ role: 'user', content: cleanMsg })

            let longitude: number | undefined
            let latitude: number | undefined
            try {
                const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
                )
                longitude = pos.coords.longitude
                latitude = pos.coords.latitude
            } catch { /* no location */ }

            const response = await ApiService.post<any>('/denki/chat', {
                messages: conversationRef.current,
                excludeWorkerIds: excludedWorkerIdsRef.current,
                longitude,
                latitude,
            })

            const data = response?.data?.data ?? response?.data ?? response
            lastDenkiResult.current = data
            setDenkiPhase(data.phase)

            const speechLines: string[] = data.speechLines || [data.message || "Hmm, I didn't catch that. Can you try again?"]

            // Store assistant reply in conversation
            conversationRef.current.push({ role: 'assistant', content: speechLines.join(' ') })

            // If we got a worker recommendation, track it
            if (data.recommendation?.worker) {
                setRecommendedWorker(data.recommendation.worker)
            }

            // If phase is ready (user confirmed via text that Gemini detected), auto-book
            if (data.phase === 'ready') {
                handleBookNow()
                return
            }

            setLogs((prev) => [...prev, ...speechLines.map(r => ({ role: 'agent' as const, text: r }))])
            ttsQueueRef.current = [...speechLines]
            setStatus(data.phase === 'summarizing' ? 'Confirm your request' : 'Listening...')
            playTtsQueue()
        } catch (err) {
            console.error('Denki error:', err)
            const errLines = ["Sorry, I'm having trouble right now. Can you say that again?"]
            setLogs((prev) => [...prev, ...errLines.map(r => ({ role: 'agent' as const, text: r }))])
            ttsQueueRef.current = [...errLines]
            setStatus('Error')
            playTtsQueue()
        } finally {
            isProcessingRef.current = false
        }
    }, [playTtsQueue, handleBookNow, handleSearchAnother, clearSilenceTimer])

    // Keep function refs current so stable callbacks can call latest versions
    runAgentFlowRef.current = runAgentFlow
    startListeningRef.current = startListening

    const sendTextMessage = () => {
        if (!input.trim()) return
        runAgentFlow(input.trim())
        setInput('')
    }

    const toggleListening = () => {
        if (isListening || isSpeaking) {
            stopListening()
            setStatus('Paused')
        } else {
            startListening()
        }
    }

    // --- Setup recognition (once) ---
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

        recognition.onend = () => {
            setIsListening(false)
            accumulatedTranscriptRef.current = ''
        }

        recognitionRef.current = recognition

        // Auto-start on mount
        try {
            recognition.onresult = handleRecognitionResult
            recognition.start()
            setIsListening(true)
            setStatus('Listening...')
        } catch (e) {}

        return () => {
            recognition.onresult = null
            recognition.stop()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // --- Render ---
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
                        <p className="text-[10px] text-muted-foreground mt-1 uppercase font-semibold tracking-tighter">{status}</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Speaking Orb & Messages */}
            <div className="flex-1 overflow-hidden bg-gradient-to-b from-transparent to-muted/5 flex flex-col">
                {/* Orb Section */}
                {logs.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <SpeakingOrb isActive={isSpeaking} isListening={isListening} className="h-80" />
                        <p className="text-sm font-medium text-muted-foreground mt-8">Listening for your request...</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-center py-8 px-4">
                            <SpeakingOrb isActive={isSpeaking} isListening={isListening} className="h-48" />
                        </div>
                        {/* Messages scroll */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                            {logs.map((log, index) => (
                                <div key={index} className={cn("flex w-full animate-in slide-in-from-bottom-2 duration-300", log.role === 'user' ? "justify-end" : "justify-start")}>
                                    <div className={cn(
                                        "max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-sm",
                                        log.role === 'user' 
                                            ? "bg-primary text-primary-foreground rounded-br-none" 
                                            : "bg-muted/80 border rounded-bl-none backdrop-blur-sm"
                                    )}>{log.text}</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Booking Animation */}
            {isBooking && (
                <div className="px-4 py-6 border-t bg-muted/10 flex flex-col items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="h-3 w-3 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                        <div className="h-3 w-3 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                        <div className="h-3 w-3 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">Finding your professional...</p>
                </div>
            )}

            {/* Action Buttons — shown when Denki has a recommendation */}
            {denkiPhase === 'summarizing' && recommendedWorker && !isBooking && (
                <div className="px-4 py-3 border-t bg-muted/10 flex gap-2">
                    <Button
                        className="flex-1 rounded-full h-12"
                        onClick={handleBookNow}
                    >
                        Book now with {recommendedWorker.name}
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1 rounded-full h-12"
                        onClick={handleSearchAnother}
                    >
                        Try another
                    </Button>
                </div>
            )}

            {/* Matched — show view request (chat opens after worker accepts) */}
            {denkiPhase === 'matched' && matchData?.job?._id && (
                <div className="px-4 py-3 border-t bg-green-50 flex gap-2">
                    <Button
                        className="flex-1 rounded-full h-12"
                        onClick={() => router.push(`/client/job/${matchData.job._id}`)}
                    >
                        View Request
                    </Button>
                </div>
            )}

            {/* Controls */}
            <div className="border-t bg-muted/30 p-6 space-y-6 backdrop-blur-lg">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative flex items-center justify-center">
                        {isListening && <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping scale-150" />}
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
                            {isSpeaking ? <StopCircle className="h-8 w-8 animate-pulse" /> : isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                        </Button>
                    </div>
                </div>

                <div className="relative flex items-center gap-2 max-w-sm mx-auto w-full group">
                    <Input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Type instead..."
                        className="rounded-full bg-background/80 h-14 border-muted-foreground/20 pr-12 focus-visible:ring-primary/30 transition-all"
                        onKeyDown={e => e.key === 'Enter' && sendTextMessage()}
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
