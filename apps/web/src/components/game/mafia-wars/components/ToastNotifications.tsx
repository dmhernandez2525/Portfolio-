// ========================================
// MAFIA WARS - TOAST NOTIFICATIONS
// ========================================

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { GameMessage } from '../types'

interface ToastNotificationsProps {
  messages: GameMessage[]
}

export function ToastNotifications({ messages }: ToastNotificationsProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {messages.map(msg => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className={cn(
              'px-4 py-2 rounded-lg shadow-lg text-sm font-medium max-w-xs',
              msg.type === 'success' && 'bg-green-600 text-white',
              msg.type === 'error' && 'bg-red-600 text-white',
              msg.type === 'warning' && 'bg-amber-600 text-white',
              msg.type === 'info' && 'bg-zinc-700 text-white'
            )}
          >
            {msg.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
