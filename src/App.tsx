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
      <div style={{padding: '10px', margin: '10px 0', backgroundColor: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '4px', color: '#856404'}}>
        <p style={{margin: 0}}>Note: This application is experimental and in early development. It will only work when the job runner service is online (running on JFM's laptop).</p>
      </div>
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
