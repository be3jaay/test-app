'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mic, MicOff, Send, Bot, X } from 'lucide-react'
import ApiService from '@/services/api-services'

export function ChatbotAgent({ onClose }: { onClose: () => void }) {
    const [input, setInput] = useState('')
    const [logs, setLogs] = useState<string[]>([])
    const [status, setStatus] = useState('Idle')
    const [isListening, setIsListening] = useState(false)
    const [isThinking, setIsThinking] = useState(false)

    const recognitionRef = useRef<any>(null)
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
    const conversationRef = useRef<{ role: string; content: string }[]>([])

    useEffect(() => {
        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

        if (!SpeechRecognition) return

        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onresult = (event: any) => {
            let transcript = ''
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript
            }
            setInput(transcript)
        }

        recognition.onend = () => setIsListening(false)

        recognitionRef.current = recognition

        return () => { recognition.stop() }
    }, [])

    const sendMessage = useCallback(async () => {
        if (!input.trim() || isThinking) return

        const userMessage = input
        setInput('')
        setIsThinking(true)

        conversationRef.current.push({ role: 'user', content: userMessage })
        setLogs((prev) => [...prev, `[You] ${userMessage}`])
        setStatus('Thinking...')

        try {
            const response = await ApiService.post<any>(
                '/denki/chat',
                { messages: conversationRef.current }
            )

            const data = response?.data ?? response
            const denki = data?.data ?? data

            conversationRef.current.push({ role: 'assistant', content: denki.message })
            setLogs((prev) => [...prev, `[Denki] ${denki.message}`])

            if (denki.phase === 'summarizing' && denki.summary) {
                setLogs((prev) => [
                    ...prev,
                    `── Summary: ${denki.summary}`,
                    `── Category: ${denki.category} | Urgency: ${denki.urgency}`,
                ])
            }

            if (denki.phase === 'ready' && denki.summary) {
                setLogs((prev) => [...prev, `[Denki] Matching you with a professional...`])
                setStatus('Matching...')

                let longitude: number | undefined
                let latitude: number | undefined
                try {
                    const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
                    )
                    longitude = pos.coords.longitude
                    latitude = pos.coords.latitude
                } catch { /* location not available */ }

                const matchRes = await ApiService.post<any>('/denki/match', {
                    category: denki.category,
                    summary: denki.summary,
                    urgency: denki.urgency,
                    longitude,
                    latitude,
                })

                const matchData = matchRes?.data?.data ?? matchRes?.data ?? matchRes
                const best = matchData?.bestMatch

                if (best) {
                    setLogs((prev) => [
                        ...prev,
                        `[Denki] Found a match!`,
                        `── ${best.name} (★ ${best.rating}) — ${best.skills?.join(', ')}`,
                        `── Job created: ${matchData.job?._id}`,
                    ])
                    setStatus('Match found!')
                } else {
                    setLogs((prev) => [
                        ...prev,
                        `[Denki] Job posted! Waiting for a worker to accept.`,
                        `── Job ID: ${matchData.job?._id}`,
                    ])
                    setStatus('Job posted')
                }
            } else {
                setStatus(
                    denki.phase === 'gathering' ? 'Listening...' :
                        denki.phase === 'summarizing' ? 'Confirm your request' : 'Ready'
                )
            }
        } catch (err) {
            console.error('Denki error:', err)
            setLogs((prev) => [...prev, `[Denki] Sorry, something went wrong. Try again.`])
            setStatus('Error — try again')
        } finally {
            setIsThinking(false)
        }
    }, [input, isThinking])

    useEffect(() => {
        if (isListening && input.trim().length > 0) {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)

            silenceTimerRef.current = setTimeout(() => {
                sendMessage()
                stopListening()
            }, 3000)
        }

        return () => {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
        }
    }, [input, isListening, sendMessage])

    const startListening = () => {
        if (!recognitionRef.current) return
        setIsListening(true)
        recognitionRef.current.start()
        setStatus('Listening...')
    }

    const stopListening = () => {
        recognitionRef.current?.stop()
        setIsListening(false)
        setStatus('Idle')
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
    }

    return (
        <div className="flex flex-col h-full bg-background">

            {/* Agent Header */}
            <div className="border-b p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Bot className="w-6 h-6 text-primary" />
                    <div>
                        <h2 className="font-semibold">Denki Agent</h2>
                        <p className="text-xs text-muted-foreground">
                            Autonomous Worker Finder
                        </p>
                    </div>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    aria-label="Close chatbot agent"
                >
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {/* Agent Status */}
            <div className="px-6 py-3 border-b text-sm">
                Status: <span className="font-medium">{status}</span>
            </div>

            {/* Agent Logs */}
            <div className="flex-1 overflow-y-auto p-6 space-y-2 text-sm font-mono">
                {logs.map((log, i) => (
                    <div key={i} className="text-muted-foreground">
                        {log}
                    </div>
                ))}
            </div>

            {/* Input Dock */}
            <div className="border-t p-4">
                <div className="flex items-center gap-2 border rounded-xl px-3 py-2">

                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={isListening ? stopListening : startListening}
                    >
                        {isListening ? (
                            <MicOff className="w-5 h-5 text-red-500 animate-pulse" />
                        ) : (
                            <Mic className="w-5 h-5" />
                        )}
                    </Button>

                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Describe your problem..."
                        className="border-none focus-visible:ring-0 flex-1"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') sendMessage()
                        }}
                    />

                    <Button size="icon" onClick={sendMessage}>
                        <Send className="w-4 h-4" />
                    </Button>

                </div>
            </div>
        </div>
    )
}