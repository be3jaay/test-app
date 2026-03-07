'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SpeakingOrbProps {
  isActive?: boolean // Agent is talking
  isListening?: boolean // User is talking
  className?: string
}

export function SpeakingOrb({ isActive = false, isListening = false, className }: SpeakingOrbProps) {
  return (
    <div className={cn("relative flex items-center justify-center w-full h-48", className)}>
      
      {/* Outer Ambient Glow - Only shows when active or listening */}
      <AnimatePresence>
        {(isActive || isListening) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={cn(
              "absolute w-40 h-40 rounded-full blur-3xl opacity-30",
              isActive ? "bg-primary" : "bg-blue-400"
            )}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>

      {/* Pulsing Outer Rings */}
      <AnimatePresence>
        {isListening && (
          <>
            {[1, 1.2, 1.4].map((scale, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: [0, 0.4, 0], scale: scale }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-full border border-primary/30"
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Main Orb Body */}
      <motion.div
        animate={{
          scale: isActive ? 1.1 : isListening ? 1.05 : 1,
          borderRadius: isActive 
            ? ["50% 50% 50% 50%", "45% 55% 48% 52%", "52% 48% 55% 45%", "50% 50% 50% 50%"] 
            : "50%",
        }}
        transition={{
          borderRadius: { duration: 2, repeat: Infinity, ease: "linear" },
          scale: { duration: 0.3 }
        }}
        className={cn(
          "relative w-32 h-32 flex items-center justify-center transition-colors duration-500",
          "bg-gradient-to-tr shadow-[0_0_40px_rgba(var(--primary),0.5)]",
          isActive 
            ? "from-primary via-primary/90 to-primary/70" 
            : isListening 
              ? "from-primary/80 via-blue-500/80 to-primary/60" 
              : "from-muted via-muted/80 to-muted/50"
        )}
      >
        {/* Glossy Surface Reflection */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />

        {/* Center Visualizer */}
        <div className="flex items-center justify-center gap-1.5 z-10">
          <AnimatePresence mode="wait">
            {isActive ? (
              /* Speaking State: 5 Fluctuating Bars */
              <motion.div 
                key="speaking" 
                className="flex items-center gap-1.5 h-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: [12, 40, 18, 48, 15],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.1,
                      ease: "easeInOut",
                    }}
                    className="w-1.5 bg-white rounded-full shadow-sm"
                  />
                ))}
              </motion.div>
            ) : isListening ? (
              /* Listening State: 3 Breathing Dots */
              <motion.div 
                key="listening" 
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                    className="w-2.5 h-2.5 bg-white rounded-full"
                  />
                ))}
              </motion.div>
            ) : (
              /* Idle State: Static center dot */
              <motion.div
                key="idle"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-3 h-3 bg-white/40 rounded-full blur-[1px]"
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Floor Shadow Reflection */}
      <motion.div
        animate={{
          opacity: isActive || isListening ? 0.4 : 0.1,
          scale: isActive ? 1.2 : 1,
        }}
        className="absolute -bottom-10 w-24 h-4 bg-primary/40 rounded-[100%] blur-xl"
      />
    </div>
  )
}