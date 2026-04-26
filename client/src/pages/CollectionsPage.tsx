import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
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
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  margin-bottom: 1rem;
  box-sizing: border-box;
  &:focus { outline: 2px solid #555; }
`

const SmallButton = styled.button<{ $ghost?: boolean }>`
  padding: 0.35rem 0.9rem;
  font-size: 0.9rem;
  background: ${({ $ghost }) => ($ghost ? '#fff' : '#222')};
  color: ${({ $ghost }) => ($ghost ? '#444' : '#fff')};
  border: 1px solid ${({ $ghost }) => ($ghost ? '#ccc' : '#222')};
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
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.95rem;
  &:focus { outline: 2px solid #555; }
  &:disabled { background: #f5f5f5; }
`

const DescInput = styled.input`
  flex: 2;
  min-width: 200px;
  padding: 0.4rem 0.7rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.95rem;
  &:focus { outline: 2px solid #555; }
  &:disabled { background: #f5f5f5; }
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
  background: #f8f8f8;
  border: 2px solid #e5e5e5;
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: border-color 0.1s;
  &:hover { border-color: #555; }
`

const CardName = styled.span`
  font-size: 1rem;
  font-weight: 600;
`

const CardDesc = styled.span`
  font-size: 0.85rem;
  color: #666;
`

const CardMeta = styled.span`
  font-size: 0.8rem;
  color: #999;
  margin-top: 0.15rem;
`

const Hint = styled.p`
  color: #999;
  font-style: italic;
`

export default function CollectionsPage() {
  const navigate = useNavigate()
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
        <SmallButton $ghost={showCreate} onClick={() => setShowCreate(v => !v)}>
          {showCreate ? 'Cancel' : '+ New'}
        </SmallButton>
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
