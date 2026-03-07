'use client'

import { motion } from 'framer-motion'
import { MapPin, Navigation } from 'lucide-react'

export function MatchmakingLoading() {
    return (
        <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
            {/* Map Background Pattern (Simulated) */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/pinstriped-suit.png")` }}
            />

            <div className="relative flex flex-col items-center">
                {/* Pulsing Radar Rings */}
                <div className="relative flex items-center justify-center">
                    <motion.div
                        animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                        className="absolute w-24 h-24 bg-primary/20 rounded-full"
                    />
                    <motion.div
                        animate={{ scale: [1, 2], opacity: [0.3, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                        className="absolute w-24 h-24 bg-primary/20 rounded-full"
                    />

                    {/* Center Icon */}
                    <div className="relative z-10 bg-primary p-5 rounded-full shadow-xl shadow-primary/40">
                        <Navigation className="w-8 h-8 text-primary-foreground fill-current animate-pulse" />
                    </div>
                </div>

                {/* Status Text */}
                <div className="mt-12 text-center space-y-2">
                    <h2 className="text-xl font-bold tracking-tight">Finding your worker...</h2>
                    <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>Searching nearby area</span>
                    </div>
                </div>

                {/* Dynamic Floating Worker Dots (Grab Style) */}
                {[...Array(4)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-3 h-3 bg-primary rounded-full border-2 border-background shadow-sm"
                        initial={{ opacity: 0, x: 0, y: 0 }}
                        animate={{
                            opacity: [0, 1, 0],
                            x: [0, (i % 2 === 0 ? 80 : -80) * Math.random()],
                            y: [0, (i < 2 ? 80 : -80) * Math.random()],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.7,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>

            {/* Bottom Branding/Tip */}
            <div className="absolute bottom-12 w-full px-8 max-w-xs">
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-primary"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                </div>
                <p className="text-[10px] text-center mt-3 text-muted-foreground uppercase tracking-widest font-bold">
                    Connecting to nearest agent
                </p>
            </div>
        </div>
    )
}