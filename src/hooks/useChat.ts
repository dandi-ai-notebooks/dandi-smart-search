import { useState } from 'react'
import type { FormEvent } from 'react'
import type { ChatMessage } from '../types'
import { processMessage } from '../utils/processMessage'

const model = "google/gemini-2.0-flash-001"

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [mainQuery, setMainQuery] = useState('')
  const [followUpQuery, setFollowUpQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState('')

  const handleMainSearch = async (e: FormEvent) => {
    e.preventDefault()
    if (!mainQuery.trim()) return

    setMessages([{ role: 'user', content: mainQuery }])
    setIsLoading(true)
    setFollowUpQuery('')
    setStatus('Searching DANDI archive...')

    try {
      const response = await processMessage(mainQuery, [], setStatus, model)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response
      }])
      setMainQuery('')
    } finally {
      setStatus('')
      setIsLoading(false)
    }
  }

  const handleFollowUp = async (e: FormEvent) => {
    e.preventDefault()
    if (!followUpQuery.trim()) return

    setMessages(prev => [...prev, { role: 'user', content: followUpQuery }])
    setIsLoading(true)
    setStatus('Processing follow-up query...')

    try {
      const response = await processMessage(followUpQuery, messages, setStatus, model)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response
      }])
      setFollowUpQuery('')
    } finally {
      setStatus('')
      setIsLoading(false)
    }
  }

  return {
    messages,
    mainQuery,
    followUpQuery,
    isLoading,
    setMainQuery,
    setFollowUpQuery,
    handleMainSearch,
    handleFollowUp,
    status
  }
}
