import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import styled from 'styled-components'
import {
  useGetMyQuartetsQuery,
  useGetQuartetQuery,
  useGetQuartetSongsQuery,
  useCreateQuartetMutation,
} from '../store/apiSlice'
import type { Part, QuartetSong } from '../types/api'
import { randomQuartetName } from '../utils/randomQuartetName'

const PARTS: Part[] = ['Tenor', 'Lead', 'Baritone', 'Bass']
const PART_KEY: Record<Part, keyof QuartetSong['coverage']> = {
  Tenor: 'tenor', Lead: 'lead', Baritone: 'baritone', Bass: 'bass',
}

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`

const SmallButton = styled.button<{ $variant?: 'ghost' }>`
  padding: 0.35rem 0.9rem;
  font-size: 0.9rem;
  background: ${({ $variant }) => ($variant === 'ghost' ? 'transparent' : 'var(--btn-primary-bg)')};
  color: ${({ $variant }) => ($variant === 'ghost' ? 'var(--btn-ghost-text)' : 'var(--btn-primary-text)')};
  border: 1px solid ${({ $variant }) => ($variant === 'ghost' ? 'var(--border)' : 'var(--btn-primary-bg)')};
  border-radius: 4px;
  cursor: pointer;
  &:hover { opacity: 0.85; }
  &:disabled { opacity: 0.5; cursor: default; }
`

const CreateForm = styled.form`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
`

const RerollButton = styled.button`
  background: none;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0.35rem 0.6rem;
  font-size: 1rem;
  cursor: pointer;
  color: var(--text-muted);
  line-height: 1;
  &:hover { border-color: var(--text-faint); color: var(--text); }
`

const NameInput = styled.input`
  flex: 1;
  padding: 0.4rem 0.7rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 0.95rem;
  background: var(--bg-input);
  color: var(--text);
  &:focus { outline: 2px solid var(--text-muted); }
  &:disabled { background: var(--bg-disabled); }
`

const QuartetList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1.5rem;
`

const QuartetCard = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  width: 100%;
  padding: 0.6rem 1rem;
  background: ${({ $selected }) => ($selected ? 'var(--btn-primary-bg)' : 'var(--bg-subtle)')};
  color: ${({ $selected }) => ($selected ? 'var(--btn-primary-text)' : 'var(--text)')};
  border: 2px solid ${({ $selected }) => ($selected ? 'var(--btn-primary-bg)' : 'var(--border-subtle)')};
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  font-size: 1rem;
  transition: background 0.1s, border-color 0.1s;
  &:hover { border-color: var(--text-muted); }
`

const CardMeta = styled.span<{ $selected: boolean }>`
  font-size: 0.8rem;
  color: ${({ $selected }) => ($selected ? 'var(--text-faint)' : 'var(--text-faint)')};
  text-align: right;
  @media (max-width: 480px) {
    flex-basis: 100%;
    text-align: left;
    margin-top: 0.15rem;
  }
`

const Divider = styled.hr`
  border: none;
  border-top: 1px solid var(--border-subtle);
  margin: 1.5rem 0;
`

const DetailHeader = styled.h3`
  margin: 0 0 0.75rem;
`

const MemberRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
`

const MemberChip = styled.span`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.7rem;
  background: var(--surface);
  border-radius: 20px;
  font-size: 0.9rem;
`

const OwnerBadge = styled.span`
  font-size: 0.68rem;
  background: var(--btn-primary-bg);
  color: var(--btn-primary-text);
  padding: 0.1rem 0.4rem;
  border-radius: 8px;
`

const InviteSection = styled.div`
  margin-bottom: 1.5rem;
`

const InviteLabel = styled.p`
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
`

const InviteRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
`

const InviteLinkInput = styled.input`
  flex: 1;
  padding: 0.4rem 0.7rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 0.82rem;
  background: var(--bg-subtle);
  color: var(--text-muted);
  cursor: default;
  min-width: 0;
`

const SectionTitle = styled.h3`
  margin: 1.5rem 0 0.5rem;
`

const Hint = styled.p`
  color: var(--text-placeholder);
  font-style: italic;
`

const TableScroller = styled.div`
  overflow-x: auto;
  @media (max-width: 600px) { display: none; }
`

const ResultTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
  th, td { padding: 0.5rem 0.75rem; border: 1px solid var(--border-subtle); text-align: left; }
  th { background: var(--bg-subtle); font-weight: 600; }
`

const PartCell = styled.td<{ $covered: boolean }>`
  color: ${({ $covered }) => ($covered ? 'var(--covered)' : 'var(--uncovered)')};
  font-weight: ${({ $covered }) => ($covered ? '500' : 'normal')};
`

const CardList = styled.div`
  display: none;
  flex-direction: column;
  gap: 0.5rem;
  @media (max-width: 600px) { display: flex; }
`

const SongCard = styled.div`
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  padding: 0.65rem 0.75rem;
`

const SongCardTitle = styled.div`
  font-weight: 600;
  margin-bottom: 0.45rem;
`

const SongCardParts = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.25rem 0.75rem;
`

const SongCardPart = styled.div<{ $covered: boolean }>`
  font-size: 0.85rem;
  color: ${({ $covered }) => ($covered ? 'var(--text)' : 'var(--uncovered)')};
`

const PartLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-faint);
  margin-right: 0.2rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
`

function formatJoinedAt(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
}

export default function QuartetFinderPage() {
  const location = useLocation()
  const initialId = (location.state as { selectQuartetId?: number } | null)?.selectQuartetId ?? null

  const [selectedId, setSelectedId] = useState<number | null>(initialId)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')

  function toggleCreate() {
    setShowCreate(v => {
      if (!v) setNewName(randomQuartetName())
      return !v
    })
  }
  const [showQr, setShowQr] = useState(false)
  const [copied, setCopied] = useState(false)

  const { data: myQuartets = [], isLoading: loadingList } = useGetMyQuartetsQuery()
  const { data: quartet } = useGetQuartetQuery(selectedId!, { skip: selectedId === null })
  const { data: songs = [], isFetching: fetchingSongs } = useGetQuartetSongsQuery(selectedId!, { skip: selectedId === null })
  const [createQuartet, { isLoading: creating }] = useCreateQuartetMutation()

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const name = newName.trim() || randomQuartetName()
    const result = await createQuartet({ name }).unwrap()
    setNewName('')
    setShowCreate(false)
    setSelectedId(result.id)
  }

  const inviteUrl = quartet ? `${window.location.origin}/join/${quartet.inviteCode}` : ''

  function copyLink() {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const complete = songs.filter(s => s.isComplete)
  const incomplete = songs
    .filter(s => !s.isComplete && Object.values(s.coverage).filter(v => v.length > 0).length >= 2)
    .sort((a, b) => {
      const missingA = Object.values(a.coverage).filter(v => v.length === 0).length
      const missingB = Object.values(b.coverage).filter(v => v.length === 0).length
      return missingA - missingB || a.title.localeCompare(b.title)
    })

  return (
    <div>
      <PageHeader>
        <h2 style={{ margin: 0 }}>Find a Quartet</h2>
        <SmallButton $variant={showCreate ? 'ghost' : undefined} onClick={toggleCreate}>
          {showCreate ? 'Cancel' : '+ New'}
        </SmallButton>
      </PageHeader>

      {showCreate && (
        <CreateForm onSubmit={handleCreate}>
          <NameInput
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Quartet name"
            autoFocus
            disabled={creating}
          />
          <RerollButton
            type="button"
            title="New random name"
            onClick={() => setNewName(randomQuartetName())}
            disabled={creating}
          >↻</RerollButton>
          <SmallButton type="submit" disabled={creating}>
            {creating ? 'Creating…' : 'Create'}
          </SmallButton>
        </CreateForm>
      )}

      {loadingList ? (
        <Hint>Loading…</Hint>
      ) : myQuartets.length === 0 && !showCreate ? (
        <Hint>No quartets yet — create one to get started.</Hint>
      ) : (
        <QuartetList>
          {myQuartets.map(q => (
            <QuartetCard key={q.id} $selected={q.id === selectedId} onClick={() => setSelectedId(q.id)}>
              <span>{q.name}</span>
              <CardMeta $selected={q.id === selectedId}>
                {q.memberCount} {q.memberCount === 1 ? 'singer' : 'singers'}
                {' · '}joined {formatJoinedAt(q.joinedAt)}
              </CardMeta>
            </QuartetCard>
          ))}
        </QuartetList>
      )}

      {quartet && (
        <>
          <Divider />
          <DetailHeader>{quartet.name}</DetailHeader>

          <MemberRow>
            {quartet.members.map(m => (
              <MemberChip key={m.singerId}>
                {m.name}
                {m.isOwner && <OwnerBadge>owner</OwnerBadge>}
              </MemberChip>
            ))}
          </MemberRow>

          <InviteSection>
            <InviteLabel>Invite singers:</InviteLabel>
            <InviteRow>
              <InviteLinkInput readOnly value={inviteUrl} onClick={e => (e.target as HTMLInputElement).select()} />
              <SmallButton $variant="ghost" onClick={copyLink}>{copied ? 'Copied!' : 'Copy'}</SmallButton>
              <SmallButton $variant="ghost" onClick={() => setShowQr(v => !v)}>QR</SmallButton>
            </InviteRow>
            {showQr && <QRCodeSVG value={inviteUrl} size={180} style={{ display: 'block', margin: '0.75rem 0' }} />}
          </InviteSection>

          {fetchingSongs ? (
            <Hint>Loading songs…</Hint>
          ) : songs.length === 0 ? (
            <Hint>No songs in common yet — members need to add songs to their repertoire.</Hint>
          ) : (
            <>
              {complete.length > 0 && (
                <>
                  <SectionTitle>Ready to Sing ({complete.length})</SectionTitle>
                  <SongTable songs={complete} />
                </>
              )}
              {incomplete.length > 0 && (
                <>
                  <SectionTitle>Missing Parts ({incomplete.length})</SectionTitle>
                  <SongTable songs={incomplete} />
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

function SongTable({ songs }: { songs: QuartetSong[] }) {
  return (
    <>
      <TableScroller>
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
                  const names = song.coverage[PART_KEY[p]]
                  return (
                    <PartCell key={p} $covered={names.length > 0}>
                      {names.join(', ') || '—'}
                    </PartCell>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </ResultTable>
      </TableScroller>

      <CardList>
        {songs.map(song => (
          <SongCard key={song.title}>
            <SongCardTitle>{song.title}</SongCardTitle>
            <SongCardParts>
              {PARTS.map(p => {
                const names = song.coverage[PART_KEY[p]]
                return (
                  <SongCardPart key={p} $covered={names.length > 0}>
                    <PartLabel>{p}</PartLabel>
                    {names.join(', ') || '—'}
                  </SongCardPart>
                )
              })}
            </SongCardParts>
          </SongCard>
        ))}
      </CardList>
    </>
  )
}
