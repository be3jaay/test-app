'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mic, MicOff, Send, Bot } from 'lucide-react'

export function ChatbotAgent() {
    const [input, setInput] = useState('')
    const [logs, setLogs] = useState<string[]>([])
    const [status, setStatus] = useState('Idle')
    const [isListening, setIsListening] = useState(false)

    const recognitionRef = useRef<any>(null)
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)

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

        return () => recognition.stop()
    }, [])

    const sendMessage = useCallback(() => {
        if (!input.trim()) return

        const userMessage = input
        setInput('')

        setLogs((prev) => [...prev, `[User] ${userMessage}`])
        setStatus('Understanding request...')

        setTimeout(() => {
            setLogs((prev) => [...prev, `[Agent] Analyzing problem...`])
            setStatus('Analyzing')
        }, 500)

        setTimeout(() => {
            setLogs((prev) => [...prev, `[Agent] Searching nearby workers...`])
            setStatus('Searching workers')
        }, 1200)

        setTimeout(() => {
            setLogs((prev) => [...prev, `[Agent] Found 3 workers near your location.`])
            setStatus('Task complete')
        }, 2000)
    }, [input])

    useEffect(() => {
        if (isListening && input.trim().length > 0) {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)

            silenceTimerRef.current = setTimeout(() => {
                sendMessage()
                stopListening()
            }, 5000)
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
            <div className="border-b p-4 flex items-center gap-3">
                <Bot className="w-6 h-6 text-primary" />
                <div>
                    <h2 className="font-semibold">Denki Agent</h2>
                    <p className="text-xs text-muted-foreground">
                        Autonomous Worker Finder
                    </p>
                </div>
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