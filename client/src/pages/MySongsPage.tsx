import { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { useAppSelector } from '../store'
import { useGetSingerQuery, useAddSongMutation, useRemoveSongMutation, useSetPreferredPartMutation } from '../store/apiSlice'
import type { Part, SongSummary } from '../types/api'
import SongCombobox from '../components/SongCombobox'

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

const PreferredRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1.25rem;
  font-size: 0.9rem;
  color: #555;
`

const Empty = styled.p`
  color: #999;
  font-style: italic;
`

const StatusMessage = styled.p`
  color: #999;
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

export default function MySongsPage() {
  const currentSingerId = useAppSelector(s => s.auth.singerId!)
  const { data: singer, isLoading, isError } = useGetSingerQuery(currentSingerId)
  const [addSong, { isLoading: isAdding }] = useAddSongMutation()
  const [removeSong] = useRemoveSongMutation()
  const [setPreferredPart] = useSetPreferredPartMutation()

  const [inputValue, setInputValue] = useState('')
  const [selectedSong, setSelectedSong] = useState<SongSummary | null>(null)
  const [part, setPart] = useState<Part>('Tenor')
  const partInitialized = useRef(false)

  useEffect(() => {
    if (!partInitialized.current && singer?.preferredPart) {
      partInitialized.current = true
      setPart(singer.preferredPart)
    }
  }, [singer?.preferredPart])

  async function handlePreferredPartChange(newPart: Part) {
    setPart(newPart)
    await setPreferredPart({ singerId: currentSingerId, part: newPart })
  }

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
      <PreferredRow>
        <label htmlFor="preferred-part">Preferred part:</label>
        <Select
          id="preferred-part"
          value={singer.preferredPart ?? ''}
          onChange={e => handlePreferredPartChange(e.target.value as Part)}
        >
          <option value="" disabled>— select —</option>
          {PARTS.map(p => <option key={p} value={p}>{p}</option>)}
        </Select>
      </PreferredRow>
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
