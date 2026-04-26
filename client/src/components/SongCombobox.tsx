import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useGetSongsQuery } from '../store/apiSlice'
import type { SongSummary } from '../types/api'

const Wrapper = styled.div`
  position: relative;
  flex: 1;
  min-width: 180px;
  @media (max-width: 480px) {
    flex-basis: 100%;
  }
`

const Input = styled.input`
  width: 100%;
  padding: 0.45rem 0.7rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
  background: var(--bg-input);
  color: var(--text);
  &:focus { outline: 2px solid var(--text-muted); }
  &:disabled { background: var(--bg-disabled); }
`

const Dropdown = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin: 2px 0 0;
  padding: 0;
  list-style: none;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  max-height: 220px;
  overflow-y: auto;
`

const DropdownItem = styled.li<{ $highlighted: boolean }>`
  padding: 0.45rem 0.7rem;
  cursor: pointer;
  background: ${({ $highlighted }) => ($highlighted ? 'var(--surface)' : 'transparent')};
  &:hover { background: var(--surface); }
`

const ItemTitle = styled.div``

const ItemMeta = styled.div`
  font-size: 0.8rem;
  color: var(--text-faint);
`

function songMeta(arranger: string | null, voicing: string | null) {
  return [arranger, voicing].filter(Boolean).join(' · ')
}

interface Props {
  inputValue: string
  onInputChange: (v: string) => void
  onSelect: (song: SongSummary | null) => void
  disabled?: boolean
  placeholder?: string
}

export default function SongCombobox({ inputValue, onInputChange, onSelect, disabled, placeholder }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const { data: suggestions = [] } = useGetSongsQuery(searchQuery, { skip: searchQuery.length < 2 })

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(inputValue), 200)
    return () => clearTimeout(timer)
  }, [inputValue])

  function handleSelect(song: SongSummary) {
    onInputChange(song.title)
    onSelect(song)
    setIsOpen(false)
    setHighlightedIndex(-1)
  }

  return (
    <Wrapper>
      <Input
        value={inputValue}
        onChange={e => { onInputChange(e.target.value); onSelect(null); setIsOpen(true); setHighlightedIndex(-1) }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        onKeyDown={e => {
          if (!isOpen || suggestions.length === 0) return
          if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightedIndex(i => Math.min(i + 1, suggestions.length - 1)) }
          else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightedIndex(i => Math.max(i - 1, -1)) }
          else if (e.key === 'Enter' && highlightedIndex >= 0) { e.preventDefault(); handleSelect(suggestions[highlightedIndex]) }
          else if (e.key === 'Escape') setIsOpen(false)
        }}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
      />
      {isOpen && suggestions.length > 0 && (
        <Dropdown>
          {suggestions.map((song, i) => (
            <DropdownItem key={song.id} $highlighted={i === highlightedIndex} onMouseDown={() => handleSelect(song)}>
              <ItemTitle>{song.title}</ItemTitle>
              {songMeta(song.arranger, song.voicing) && <ItemMeta>{songMeta(song.arranger, song.voicing)}</ItemMeta>}
            </DropdownItem>
          ))}
        </Dropdown>
      )}
    </Wrapper>
  )
}
