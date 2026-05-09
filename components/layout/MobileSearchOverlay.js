'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import SearchDropdown from '../search/SearchDropdown'
import styles from './MobileSearchOverlay.module.css'

export default function MobileSearchOverlay({
  open,
  onClose,
  query,
  setQuery,
  results,
  loading,
  recent,
  saveRecent,
  onRemoveRecent,
  onClearRecent,
  activeIndex,
  setActiveIndex,
}) {
  const router = useRouter()
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      // Lock body scroll
      document.body.style.overflow = 'hidden'
      setTimeout(() => inputRef.current?.focus(), 80)
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const commit = (term) => {
    const t = (term || query).trim()
    if (!t) return
    saveRecent(t)
    router.push(`/search?q=${encodeURIComponent(t)}`)
    onClose()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') commit(query)
    if (e.key === 'Escape') onClose()
  }

  if (!open) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        {/* Search bar */}
        <div className={styles.searchBar}>
          <svg className={styles.searchIcon} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search products, categories..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            className={styles.input}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
          {query && (
            <button className={styles.clearInput} onClick={() => setQuery('')} aria-label="Clear">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
        </div>

        {/* Results */}
        <div className={styles.results}>
          <SearchDropdown
            query={query}
            results={results}
            loading={loading}
            recent={recent}
            onSelect={(term) => commit(term)}
            onRemoveRecent={onRemoveRecent}
            onClearRecent={onClearRecent}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
          />
        </div>
      </div>
    </div>
  )
}
