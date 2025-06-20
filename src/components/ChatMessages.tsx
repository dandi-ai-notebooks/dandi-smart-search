import { useEffect, useRef, type FormEvent } from 'react'
import MarkdownContent from './MarkdownContent'
import type { ORMessage } from '../completion/openRouterTypes'

interface ChatMessagesProps {
  messages: ORMessage[]
  isLoading: boolean
  followUpQuery: string
  onFollowUpChange: (value: string) => void
  onFollowUpSubmit: (e: FormEvent) => void
  status: string
}

export function ChatMessages({
  messages,
  isLoading,
  followUpQuery,
  onFollowUpChange,
  onFollowUpSubmit,
  status
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  if (messages.length === 0) return null

  return (
    <div className="chat-container">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`message ${message.role}`}
        >
          <MarkdownContent
            content={(message.content || 'no content') as string}
          />
        </div>
      ))}
      {isLoading && (
        <div className="loading">{status || "Processing your query..."}</div>
      )}
      {!isLoading && (
        <form onSubmit={onFollowUpSubmit} className="follow-up-form">
          <input
            type="text"
            value={followUpQuery}
            onChange={(e) => onFollowUpChange(e.target.value)}
            placeholder="Ask a follow-up question..."
            className="search-input"
          />
          <button type="submit" className="search-button">
            Send
          </button>
        </form>
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}
