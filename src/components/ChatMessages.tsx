import ReactMarkdown from 'react-markdown'
import type { FormEvent } from 'react'
import type { ChatMessage } from '../types'
import MarkdownContent from './MarkdownContent'

interface ChatMessagesProps {
  messages: ChatMessage[]
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
  if (messages.length === 0) return null

  return (
    <div className="chat-container">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`message ${message.role === 'assistant' ? 'assistant' : 'user'}`}
        >
          <MarkdownContent
            content={message.content}
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
    </div>
  )
}
