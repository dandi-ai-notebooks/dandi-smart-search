import './App.css'
import { ChatMessages } from './components/ChatMessages'
import { SearchForm } from './components/SearchForm'
import { SuggestedQueries } from './components/SuggestedQueries'
import { useChat } from './hooks/useChat'

function App() {
  const {
    messages,
    mainQuery,
    followUpQuery,
    isLoading,
    setMainQuery,
    setFollowUpQuery,
    handleMainSearch,
    handleFollowUp,
    status
  } = useChat()

  const handleSuggestedQuery = (q: string) => {
    setMainQuery(q)
  }

  return (
    <main className="container">
      <div className="search-container">
        {messages.length === 0 && (
          <SuggestedQueries onQuerySelect={handleSuggestedQuery} />
        )}
        <SearchForm
          query={mainQuery}
          onQueryChange={setMainQuery}
          onSubmit={handleMainSearch}
          isLoading={isLoading}
        />
      </div>

      <ChatMessages
        messages={messages}
        isLoading={isLoading}
        followUpQuery={followUpQuery}
        onFollowUpChange={setFollowUpQuery}
        onFollowUpSubmit={handleFollowUp}
        status={status}
      />
    </main>
  )
}

export default App
