import { useState } from 'react'
import styled from 'styled-components'
import { useGetSingersQuery, useGetQuartetSongsQuery } from '../store/apiSlice'
import type { Part, QuartetSong } from '../types/api'

const PARTS: Part[] = ['Tenor', 'Lead', 'Baritone', 'Bass']

const PART_COVERAGE_KEY: Record<Part, keyof QuartetSong['coverage']> = {
  Tenor: 'tenor',
  Lead: 'lead',
  Baritone: 'baritone',
  Bass: 'bass',
}

const SingerGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`

const SingerChip = styled.label<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.9rem;
  border: 2px solid ${({ $selected }) => ($selected ? '#222' : '#ccc')};
  border-radius: 20px;
  cursor: pointer;
  background: ${({ $selected }) => ($selected ? '#222' : '#fff')};
  color: ${({ $selected }) => ($selected ? '#fff' : '#444')};
  user-select: none;
  transition: all 0.1s;
  &:hover { border-color: #555; }
`

const ResultTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;

  th, td {
    padding: 0.5rem 0.75rem;
    border: 1px solid #e5e5e5;
    text-align: left;
  }

  th { background: #f5f5f5; font-weight: 600; }
`

const PartCell = styled.td<{ $covered: boolean }>`
  color: ${({ $covered }) => ($covered ? '#166534' : '#d1d5db')};
  font-weight: ${({ $covered }) => ($covered ? '500' : 'normal')};
`

const SectionTitle = styled.h3`
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
`

const Hint = styled.p`
  color: #999;
  font-style: italic;
`

export default function QuartetFinderPage() {
  const { data: singers = [], isLoading } = useGetSingersQuery()
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  const selectedIdArray = Array.from(selectedIds).sort((a, b) => a - b)
  const { data: songs = [], isFetching } = useGetQuartetSongsQuery(
    selectedIdArray,
    { skip: selectedIdArray.length === 0 },
  )

  function toggle(id: number) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else if (next.size < 4) {
        next.add(id)
      }
      return next
    })
  }

  const complete = songs.filter(s => s.isComplete)
  const incomplete = songs.filter(s => !s.isComplete)

  return (
    <div>
      <h2>Find a Quartet</h2>
      <p>Select up to 4 singers to see which songs they can perform together.</p>

      {isLoading ? (
        <Hint>Loading singers…</Hint>
      ) : (
        <SingerGrid>
          {singers.map(singer => (
            <SingerChip key={singer.id} $selected={selectedIds.has(singer.id)}>
              <input
                type="checkbox"
                checked={selectedIds.has(singer.id)}
                onChange={() => toggle(singer.id)}
                style={{ display: 'none' }}
              />
              {singer.name}
            </SingerChip>
          ))}
        </SingerGrid>
      )}

      {selectedIdArray.length === 0 && !isLoading && (
        <Hint>Select singers above to see matching songs.</Hint>
      )}

      {isFetching && <Hint>Loading songs…</Hint>}

      {!isFetching && selectedIdArray.length > 0 && songs.length === 0 && (
        <Hint>No songs in common.</Hint>
      )}

      {!isFetching && complete.length > 0 && (
        <>
          <SectionTitle>Ready to Sing ({complete.length})</SectionTitle>
          <SongTable songs={complete} />
        </>
      )}

      {!isFetching && incomplete.length > 0 && (
        <>
          <SectionTitle>Missing Parts ({incomplete.length})</SectionTitle>
          <SongTable songs={incomplete} />
        </>
      )}
    </div>
  )
}

function SongTable({ songs }: { songs: QuartetSong[] }) {
  return (
    <ResultTable>
      <thead>
        <tr>
          <th>Song</th>
          {PARTS.map(p => <th key={p}>{p}</th>)}
        </tr>
      </thead>
      <tbody>
        {songs.map(song => (
          <tr key={song.title}>
            <td>{song.title}</td>
            {PARTS.map(p => {
              const singers = song.coverage[PART_COVERAGE_KEY[p]]
              return (
                <PartCell key={p} $covered={singers.length > 0}>
                  {singers.join(', ') || '—'}
                </PartCell>
              )
            })}
          </tr>
        ))}
      </tbody>
    </ResultTable>
  )
}
