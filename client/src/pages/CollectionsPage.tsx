import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAppSelector } from '../store'
import { useGetCollectionsQuery, useCreateCollectionMutation } from '../store/apiSlice'

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 1rem;
  margin-bottom: 1rem;
  box-sizing: border-box;
  background: var(--bg-input);
  color: var(--text);
  &:focus { outline: 2px solid var(--text-muted); }
`

const SmallButton = styled.button<{ $ghost?: boolean }>`
  padding: 0.35rem 0.9rem;
  font-size: 0.9rem;
  background: ${({ $ghost }) => ($ghost ? 'transparent' : 'var(--btn-primary-bg)')};
  color: ${({ $ghost }) => ($ghost ? 'var(--btn-ghost-text)' : 'var(--btn-primary-text)')};
  border: 1px solid ${({ $ghost }) => ($ghost ? 'var(--border)' : 'var(--btn-primary-bg)')};
  border-radius: 4px;
  cursor: pointer;
  &:hover { opacity: 0.85; }
  &:disabled { opacity: 0.5; cursor: default; }
`

const CreateForm = styled.form`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
`

const NameInput = styled.input`
  flex: 1;
  min-width: 160px;
  padding: 0.4rem 0.7rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 0.95rem;
  background: var(--bg-input);
  color: var(--text);
  &:focus { outline: 2px solid var(--text-muted); }
  &:disabled { background: var(--bg-disabled); }
`

const DescInput = styled.input`
  flex: 2;
  min-width: 200px;
  padding: 0.4rem 0.7rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 0.95rem;
  background: var(--bg-input);
  color: var(--text);
  &:focus { outline: 2px solid var(--text-muted); }
  &:disabled { background: var(--bg-disabled); }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 0.75rem;
`

const Card = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  padding: 0.9rem 1rem;
  background: var(--bg-subtle);
  border: 2px solid var(--border-subtle);
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  width: 100%;
  color: var(--text);
  transition: border-color 0.1s;
  &:hover { border-color: var(--text-muted); }
`

const CardName = styled.span`
  font-size: 1rem;
  font-weight: 600;
`

const CardDesc = styled.span`
  font-size: 0.85rem;
  color: var(--text-link);
`

const CardMeta = styled.span`
  font-size: 0.8rem;
  color: var(--text-placeholder);
  margin-top: 0.15rem;
`

const Hint = styled.p`
  color: var(--text-placeholder);
  font-style: italic;
`

export default function CollectionsPage() {
  const navigate = useNavigate()
  const isAdmin = useAppSelector(s => s.auth.role === 'Admin')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')

  const { data: collections = [], isLoading } = useGetCollectionsQuery(debouncedSearch)
  const [createCollection, { isLoading: creating }] = useCreateCollectionMutation()

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    const result = await createCollection({ name: newName.trim(), description: newDesc.trim() || undefined }).unwrap()
    setNewName('')
    setNewDesc('')
    setShowCreate(false)
    navigate(`/collections/${result.id}`)
  }

  return (
    <div>
      <PageHeader>
        <h2 style={{ margin: 0 }}>Collections</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {isAdmin && (
            <SmallButton $ghost onClick={() => navigate('/collections/import')}>
              Import CSV
            </SmallButton>
          )}
          <SmallButton $ghost={showCreate} onClick={() => setShowCreate(v => !v)}>
            {showCreate ? 'Cancel' : '+ New'}
          </SmallButton>
        </div>
      </PageHeader>

      {showCreate && (
        <CreateForm onSubmit={handleCreate}>
          <NameInput
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Collection name"
            autoFocus
            disabled={creating}
          />
          <DescInput
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            disabled={creating}
          />
          <SmallButton type="submit" disabled={creating || !newName.trim()}>
            {creating ? 'Creating…' : 'Create'}
          </SmallButton>
        </CreateForm>
      )}

      <SearchInput
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search collections…"
      />

      {isLoading ? (
        <Hint>Loading…</Hint>
      ) : collections.length === 0 ? (
        <Hint>{search ? 'No collections match your search.' : 'No collections yet.'}</Hint>
      ) : (
        <Grid>
          {collections.map(c => (
            <Card key={c.id} onClick={() => navigate(`/collections/${c.id}`)}>
              <CardName>{c.name}</CardName>
              {c.description && <CardDesc>{c.description}</CardDesc>}
              <CardMeta>{c.songCount} {c.songCount === 1 ? 'song' : 'songs'} · by {c.createdBy}</CardMeta>
            </Card>
          ))}
        </Grid>
      )}
    </div>
  )
}
