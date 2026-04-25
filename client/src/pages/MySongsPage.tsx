import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useAppSelector } from '../store'
import { useGetSingerQuery, useAddSongMutation, useRemoveSongMutation, useGetSongsQuery } from '../store/apiSlice'
import type { Part, SongSummary } from '../types/api'

const PARTS: Part[] = ['Tenor', 'Lead', 'Baritone', 'Bass']

const PART_COLORS: Record<Part, string> = {
  Tenor: '#dbeafe',
  Lead: '#dcfce7',
  Baritone: '#fef9c3',
  Bass: '#ffe4e6',
}

const SongRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
`

const PartBadge = styled.span<{ $part: Part }>`
  background: ${({ $part }) => PART_COLORS[$part]};
  padding: 0.15rem 0.55rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
`

const RemoveButton = styled.button`
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: #bbb;
  font-size: 1rem;
  line-height: 1;
  padding: 0.2rem;
  &:hover { color: #c00; }
`

const Form = styled.form`
  display: flex;
  gap: 0.5rem;
  margin-top: 1.5rem;
`

const StyledInput = styled.input`
  width: 100%;
  padding: 0.45rem 0.7rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
  &:focus { outline: 2px solid #555; }
  &:disabled { background: #f5f5f5; }
`

const Select = styled.select`
  padding: 0.45rem 0.7rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  &:focus { outline: 2px solid #555; }
`

const AddButton = styled.button`
  padding: 0.45rem 1rem;
  background: #222;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  &:hover:not(:disabled) { background: #000; }
  &:disabled { opacity: 0.5; cursor: default; }
`

const Empty = styled.p`
  color: #999;
  font-style: italic;
`

const StatusMessage = styled.p`
  color: #999;
`

const ComboWrapper = styled.div`
  position: relative;
  flex: 1;
`

const Dropdown = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin: 2px 0 0;
  padding: 0;
  list-style: none;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  max-height: 220px;
  overflow-y: auto;
`

const DropdownItem = styled.li<{ $highlighted: boolean }>`
  padding: 0.45rem 0.7rem;
  cursor: pointer;
  background: ${({ $highlighted }) => ($highlighted ? '#f0f0f0' : 'transparent')};
  &:hover { background: #f0f0f0; }
`

const SongMeta = styled.span`
  color: #888;
  font-size: 0.8rem;
`

const SongInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
`

function songMeta(arranger: string | null, voicing: string | null): string {
  return [arranger, voicing].filter(Boolean).join(' · ')
}

function SongCombobox({
  inputValue,
  onInputChange,
  onSelect,
  disabled,
  placeholder,
}: {
  inputValue: string
  onInputChange: (v: string) => void
  onSelect: (song: SongSummary | null) => void
  disabled?: boolean
  placeholder?: string
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const { data: suggestions = [] } = useGetSongsQuery(searchQuery, {
    skip: searchQuery.length < 2,
  })

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
    <ComboWrapper>
      <StyledInput
        value={inputValue}
        onChange={e => {
          onInputChange(e.target.value)
          onSelect(null)
          setIsOpen(true)
          setHighlightedIndex(-1)
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        onKeyDown={e => {
          if (!isOpen || suggestions.length === 0) return
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setHighlightedIndex(i => Math.min(i + 1, suggestions.length - 1))
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setHighlightedIndex(i => Math.max(i - 1, -1))
          } else if (e.key === 'Enter' && highlightedIndex >= 0) {
            e.preventDefault()
            handleSelect(suggestions[highlightedIndex])
          } else if (e.key === 'Escape') {
            setIsOpen(false)
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
      />
      {isOpen && suggestions.length > 0 && (
        <Dropdown>
          {suggestions.map((song, i) => (
            <DropdownItem
              key={song.id}
              $highlighted={i === highlightedIndex}
              onMouseDown={() => handleSelect(song)}
            >
              <SongInfo>
                <span>{song.title}</span>
                {songMeta(song.arranger, song.voicing) && (
                  <SongMeta>{songMeta(song.arranger, song.voicing)}</SongMeta>
                )}
              </SongInfo>
            </DropdownItem>
          ))}
        </Dropdown>
      )}
    </ComboWrapper>
  )
}

export default function MySongsPage() {
  const currentSingerId = useAppSelector(s => s.auth.singerId!)
  const { data: singer, isLoading, isError } = useGetSingerQuery(currentSingerId)
  const [addSong, { isLoading: isAdding }] = useAddSongMutation()
  const [removeSong] = useRemoveSongMutation()

  const [inputValue, setInputValue] = useState('')
  const [selectedSong, setSelectedSong] = useState<SongSummary | null>(null)
  const [part, setPart] = useState<Part>('Tenor')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedSong) return
    await addSong({ singerId: currentSingerId, body: { songTitle: selectedSong.title, part } })
    setInputValue('')
    setSelectedSong(null)
  }

  if (isLoading) return <StatusMessage>Loading…</StatusMessage>
  if (isError || !singer) return <StatusMessage>Could not load singer data.</StatusMessage>

  return (
    <div>
      <h2>{singer.name}&apos;s Songs</h2>
      {singer.repertoire.length === 0 ? (
        <Empty>No songs yet — add one below.</Empty>
      ) : (
        singer.repertoire.map(entry => (
          <SongRow key={`${entry.songId}-${entry.part}`}>
            <SongInfo>
              <span>{entry.songTitle}</span>
              {songMeta(entry.arranger, entry.voicing) && (
                <SongMeta>{songMeta(entry.arranger, entry.voicing)}</SongMeta>
              )}
            </SongInfo>
            <PartBadge $part={entry.part}>{entry.part}</PartBadge>
            <RemoveButton
              onClick={() => removeSong({ singerId: currentSingerId, songId: entry.songId, part: entry.part })}
              aria-label={`Remove ${entry.songTitle}`}
            >
              ✕
            </RemoveButton>
          </SongRow>
        ))
      )}
      <Form onSubmit={handleSubmit}>
        <SongCombobox
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSelect={setSelectedSong}
          placeholder="Search for a song…"
          disabled={isAdding}
        />
        <Select value={part} onChange={e => setPart(e.target.value as Part)}>
          {PARTS.map(p => <option key={p} value={p}>{p}</option>)}
        </Select>
        <AddButton type="submit" disabled={isAdding || !selectedSong}>
          {isAdding ? 'Adding…' : 'Add'}
        </AddButton>
      </Form>
    </div>
  )
}
