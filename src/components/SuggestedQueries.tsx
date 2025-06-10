import { SUGGESTED_QUERIES } from '../constants'
import styles from './SuggestedQueries.module.css'

interface SuggestedQueriesProps {
  onQuerySelect: (query: string) => void
}

export function SuggestedQueries({ onQuerySelect }: SuggestedQueriesProps) {
  return (
    <div className={styles.suggestions}>
      {/* <h2>Try asking about...</h2> */}
      <div className={styles.suggestionsGrid}>
        {SUGGESTED_QUERIES.map((q, index) => (
          <button
            key={index}
            className={styles.suggestionButton}
            onClick={() => onQuerySelect(q)}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}
