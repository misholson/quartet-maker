import { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { useAppDispatch, useAppSelector } from '../store'
import { useGetSingerQuery, useAddSongMutation, useRemoveSongMutation, useSetPreferredPartMutation, useSetNicknameMutation } from '../store/apiSlice'
import { setName } from '../store/authSlice'
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
  margin-bottom: 1.5rem;
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

const SettingsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #555;
`

const NicknameInput = styled.input`
  padding: 0.4rem 0.6rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
  width: 14rem;
  &:focus { outline: 2px solid #555; }
`

const Section = styled.div`
  margin-bottom: 1.5rem;
`

const SectionHeading = styled.h3<{ $part: Part }>`
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #555;
  margin: 0 0 0.25rem;
  padding: 0.25rem 0.6rem;
  background: ${({ $part }) => PART_COLORS[$part]};
  border-radius: 4px;
  display: inline-block;
`

const SortBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: #888;
`

const SortButton = styled.button<{ $active: boolean }>`
  background: ${({ $active }) => ($active ? '#222' : 'none')};
  color: ${({ $active }) => ($active ? '#fff' : '#555')};
  border: 1px solid ${({ $active }) => ($active ? '#222' : '#ccc')};
  border-radius: 4px;
  padding: 0.2rem 0.55rem;
  font-size: 0.8rem;
  cursor: pointer;
  &:hover:not([data-active='true']) { border-color: #888; color: #111; }
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

type SortField = 'part' | 'title' | 'arranger' | 'voicing'

const SORT_LABELS: Record<SortField, string> = {
  part: 'Part', title: 'Title', arranger: 'Arranger', voicing: 'Voicing',
}


function orderedParts(preferred: Part | null): Part[] {
  const base: Part[] = ['Tenor', 'Lead', 'Baritone', 'Bass']
  if (!preferred) return base
  return [preferred, ...base.filter(p => p !== preferred)]
}

function songMeta(arranger: string | null, voicing: string | null): string {
  return [arranger, voicing].filter(Boolean).join(' · ')
}

export default function MySongsPage() {
  const dispatch = useAppDispatch()
  const currentSingerId = useAppSelector(s => s.auth.singerId!)
  const { data: singer, isLoading, isError } = useGetSingerQuery(currentSingerId)
  const [addSong, { isLoading: isAdding }] = useAddSongMutation()
  const [removeSong] = useRemoveSongMutation()
  const [setPreferredPart] = useSetPreferredPartMutation()
  const [setNickname] = useSetNicknameMutation()

  const [inputValue, setInputValue] = useState('')
  const [selectedSong, setSelectedSong] = useState<SongSummary | null>(null)
  const [part, setPart] = useState<Part>('Tenor')
  const [sortBy, setSortBy] = useState<SortField>('title')
  const [nicknameInput, setNicknameInput] = useState('')
  const partInitialized = useRef(false)
  const nicknameInitialized = useRef(false)

  useEffect(() => {
    if (!partInitialized.current && singer?.preferredPart) {
      partInitialized.current = true
      setPart(singer.preferredPart)
    }
  }, [singer?.preferredPart])

  useEffect(() => {
    if (!nicknameInitialized.current && singer) {
      nicknameInitialized.current = true
      setNicknameInput(singer.nickname ?? '')
    }
  }, [singer])

  async function handleNicknameBlur() {
    const trimmed = nicknameInput.trim()
    const current = singer?.nickname ?? ''
    if (trimmed === current) return
    const result = await setNickname({ singerId: currentSingerId, nickname: trimmed || null })
    if ('data' in result) {
      dispatch(setName(trimmed || singer!.name))
    }
  }

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
      <SettingsRow>
        <label htmlFor="nickname">Nickname:</label>
        <NicknameInput
          id="nickname"
          value={nicknameInput}
          placeholder={singer.name}
          onChange={e => setNicknameInput(e.target.value)}
          onBlur={handleNicknameBlur}
          onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur() }}
        />
      </SettingsRow>
      <SettingsRow>
        <label htmlFor="preferred-part">Preferred part:</label>
        <Select
          id="preferred-part"
          value={singer.preferredPart ?? ''}
          onChange={e => handlePreferredPartChange(e.target.value as Part)}
        >
          <option value="" disabled>— select —</option>
          {PARTS.map(p => <option key={p} value={p}>{p}</option>)}
        </Select>
      </SettingsRow>
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
      <SortBar>
        Sort by:
        {(['part', 'title', 'arranger', 'voicing'] as SortField[]).map(f => (
          <SortButton key={f} $active={sortBy === f} onClick={() => setSortBy(f)}>
            {SORT_LABELS[f]}
          </SortButton>
        ))}
      </SortBar>
      {singer.repertoire.length === 0 ? (
        <Empty>No songs yet — add one below.</Empty>
      ) : sortBy === 'part' ? (
        orderedParts(singer.preferredPart).map(p => {
          const entries = [...singer.repertoire.filter(e => e.part === p)].sort((a, b) => a.songTitle.localeCompare(b.songTitle))
          if (entries.length === 0) return null
          return (
            <Section key={p}>
              <SectionHeading $part={p}>{p}</SectionHeading>
              {entries.map(entry => (
                <SongRow key={`${entry.songId}-${entry.part}`}>
                  <SongInfo>
                    <span>{entry.songTitle}</span>
                    {songMeta(entry.arranger, entry.voicing) && (
                      <SongMeta>{songMeta(entry.arranger, entry.voicing)}</SongMeta>
                    )}
                  </SongInfo>
                  <RemoveButton
                    onClick={() => removeSong({ singerId: currentSingerId, songId: entry.songId, part: entry.part })}
                    aria-label={`Remove ${entry.songTitle}`}
                  >✕</RemoveButton>
                </SongRow>
              ))}
            </Section>
          )
        })
      ) : (
        [...singer.repertoire]
          .sort((a, b) => {
            const va = sortBy === 'title' ? a.songTitle
              : sortBy === 'arranger' ? (a.arranger ?? '￿')
              : sortBy === 'voicing'  ? (a.voicing  ?? '￿')
              : ''
            const vb = sortBy === 'title' ? b.songTitle
              : sortBy === 'arranger' ? (b.arranger ?? '￿')
              : sortBy === 'voicing'  ? (b.voicing  ?? '￿')
              : ''
            return va.localeCompare(vb) || a.songTitle.localeCompare(b.songTitle)
          })
          .map(entry => (
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
              >✕</RemoveButton>
            </SongRow>
          ))
      )}
    </div>
  )
}
