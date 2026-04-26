import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { useAppSelector } from '../store'
import {
  useGetCollectionQuery,
  useGetSingerQuery,
  useUpdateCollectionMutation,
  useDeleteCollectionMutation,
  useAddSongToCollectionMutation,
  useRemoveSongFromCollectionMutation,
  useImportCollectionMutation,
  useAddSongMutation,
} from '../store/apiSlice'
import type { Part, SongSummary } from '../types/api'
import SongCombobox from '../components/SongCombobox'

const PARTS: Part[] = ['Tenor', 'Lead', 'Baritone', 'Bass']

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.9rem;
  color: #666;
  text-decoration: none;
  margin-bottom: 1.25rem;
  &:hover { color: #111; }
`

const Header = styled.div`
  margin-bottom: 1.25rem;
`

const TitleRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  flex-wrap: wrap;
`

const CollectionTitle = styled.h2`
  margin: 0;
  flex: 1;
`

const Description = styled.p`
  color: #555;
  margin: 0.3rem 0 0;
  font-size: 0.95rem;
`

const Creator = styled.p`
  color: #888;
  font-size: 0.85rem;
  margin: 0.25rem 0 0;
`

const SmallButton = styled.button<{ $ghost?: boolean; $danger?: boolean }>`
  padding: 0.3rem 0.75rem;
  font-size: 0.85rem;
  background: ${({ $ghost, $danger }) => $danger ? '#fee2e2' : $ghost ? '#fff' : '#222'};
  color: ${({ $ghost, $danger }) => $danger ? '#c00' : $ghost ? '#444' : '#fff'};
  border: 1px solid ${({ $ghost, $danger }) => $danger ? '#fca5a5' : $ghost ? '#ccc' : '#222'};
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  &:hover { opacity: 0.85; }
  &:disabled { opacity: 0.5; cursor: default; }
`

const EditForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
`

const TextInput = styled.input`
  padding: 0.4rem 0.7rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.95rem;
  &:focus { outline: 2px solid #555; }
`

const EditRow = styled.div`
  display: flex;
  gap: 0.5rem;
`

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #e5e5e5;
  margin: 1.25rem 0;
`

const ImportRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
`

const ImportLabel = styled.span`
  font-size: 0.9rem;
  color: #555;
`

const PartSelect = styled.select`
  padding: 0.35rem 0.6rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
  &:focus { outline: 2px solid #555; }
`

const ImportResult = styled.span`
  font-size: 0.85rem;
  color: #166534;
`

const SongList = styled.div``

const SongRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
`

const SongInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const SongTitle = styled.span`
  display: block;
`

const SongMeta = styled.span`
  font-size: 0.8rem;
  color: #888;
`

const RowActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
`

const RemoveButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #bbb;
  font-size: 1rem;
  line-height: 1;
  padding: 0.2rem;
  &:hover { color: #c00; }
`

const AddToRepertoireRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
`

const AddSongSection = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1.25rem;
`

const Hint = styled.p`
  color: #999;
  font-style: italic;
`

const StatusMessage = styled.p`
  color: #999;
`

function meta(arranger: string | null, voicing: string | null) {
  return [arranger, voicing].filter(Boolean).join(' · ')
}

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const collectionId = Number(id)
  const navigate = useNavigate()
  const singerId = useAppSelector(s => s.auth.singerId!)

  const { data: collection, isLoading, isError } = useGetCollectionQuery(collectionId)
  const { data: singer } = useGetSingerQuery(singerId)

  const [updateCollection, { isLoading: updating }] = useUpdateCollectionMutation()
  const [deleteCollection] = useDeleteCollectionMutation()
  const [addSongToCollection] = useAddSongToCollectionMutation()
  const [removeSongFromCollection] = useRemoveSongFromCollectionMutation()
  const [importCollection] = useImportCollectionMutation()
  const [addSong] = useAddSongMutation()

  const isOwner = collection?.createdById === singerId

  // Edit mode
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')

  function startEdit() {
    setEditName(collection!.name)
    setEditDesc(collection!.description ?? '')
    setEditing(true)
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editName.trim()) return
    await updateCollection({ id: collectionId, name: editName.trim(), description: editDesc.trim() || undefined })
    setEditing(false)
  }

  // Import part (defaults to preferred part once singer loads)
  const [importPart, setImportPart] = useState<Part>('Tenor')
  const partInitialized = useRef(false)
  useEffect(() => {
    if (!partInitialized.current && singer?.preferredPart) {
      partInitialized.current = true
      setImportPart(singer.preferredPart)
    }
  }, [singer?.preferredPart])

  // Per-song add-to-repertoire part (same as importPart)
  const [importResult, setImportResult] = useState<string | null>(null)

  async function handleImportAll() {
    const result = await importCollection({ collectionId, part: importPart, singerId }).unwrap()
    setImportResult(
      result.added > 0
        ? `Added ${result.added} song${result.added !== 1 ? 's' : ''}${result.skipped > 0 ? ` (${result.skipped} already in repertoire)` : ''}`
        : `All songs already in your repertoire as ${importPart}`
    )
    setTimeout(() => setImportResult(null), 4000)
  }

  async function handleAddToRepertoire(title: string, arranger: string | null, voicing: import('../types/api').Voicing | null) {
    await addSong({ singerId, body: { songTitle: title, part: importPart, arranger: arranger ?? undefined, voicing: voicing ?? undefined } })
  }

  // Add song to collection
  const [addInput, setAddInput] = useState('')
  const [addSelected, setAddSelected] = useState<SongSummary | null>(null)

  async function handleAddToCollection(e: React.FormEvent) {
    e.preventDefault()
    if (!addSelected) return
    await addSongToCollection({ collectionId, songId: addSelected.id })
    setAddInput('')
    setAddSelected(null)
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${collection?.name}"? This cannot be undone.`)) return
    await deleteCollection(collectionId)
    navigate('/collections')
  }

  if (isLoading) return <StatusMessage>Loading…</StatusMessage>
  if (isError || !collection) return <StatusMessage>Collection not found.</StatusMessage>

  return (
    <div>
      <BackLink to="/collections">← Collections</BackLink>

      {editing ? (
        <EditForm onSubmit={saveEdit}>
          <TextInput
            value={editName}
            onChange={e => setEditName(e.target.value)}
            placeholder="Collection name"
            autoFocus
          />
          <TextInput
            value={editDesc}
            onChange={e => setEditDesc(e.target.value)}
            placeholder="Description (optional)"
          />
          <EditRow>
            <SmallButton type="submit" disabled={updating || !editName.trim()}>
              {updating ? 'Saving…' : 'Save'}
            </SmallButton>
            <SmallButton type="button" $ghost onClick={() => setEditing(false)}>Cancel</SmallButton>
          </EditRow>
        </EditForm>
      ) : (
        <Header>
          <TitleRow>
            <CollectionTitle>{collection.name}</CollectionTitle>
            {isOwner && (
              <>
                <SmallButton $ghost onClick={startEdit}>Edit</SmallButton>
                <SmallButton $danger onClick={handleDelete}>Delete</SmallButton>
              </>
            )}
          </TitleRow>
          {collection.description && <Description>{collection.description}</Description>}
          <Creator>By {collection.createdBy} · {collection.songs.length} {collection.songs.length === 1 ? 'song' : 'songs'}</Creator>
        </Header>
      )}

      <Divider />

      <ImportRow>
        <ImportLabel>Add to My Songs as:</ImportLabel>
        <PartSelect value={importPart} onChange={e => setImportPart(e.target.value as Part)}>
          {PARTS.map(p => <option key={p} value={p}>{p}</option>)}
        </PartSelect>
        <SmallButton onClick={handleImportAll} disabled={collection.songs.length === 0}>
          Import All {collection.songs.length > 0 ? `(${collection.songs.length})` : ''}
        </SmallButton>
        {importResult && <ImportResult>{importResult}</ImportResult>}
      </ImportRow>

      <SongList>
        {collection.songs.length === 0 ? (
          <Hint>No songs in this collection yet.</Hint>
        ) : (
          collection.songs.map(song => (
            <SongRow key={song.songId}>
              <SongInfo>
                <SongTitle>{song.title}</SongTitle>
                {meta(song.arranger, song.voicing) && <SongMeta>{meta(song.arranger, song.voicing)}</SongMeta>}
              </SongInfo>
              <RowActions>
                <AddToRepertoireRow>
                  <SmallButton $ghost onClick={() => handleAddToRepertoire(song.title, song.arranger, song.voicing)}>
                    + My Songs
                  </SmallButton>
                </AddToRepertoireRow>
                {isOwner && (
                  <RemoveButton
                    onClick={() => removeSongFromCollection({ collectionId, songId: song.songId })}
                    aria-label={`Remove ${song.title}`}
                  >
                    ✕
                  </RemoveButton>
                )}
              </RowActions>
            </SongRow>
          ))
        )}
      </SongList>

      {isOwner && (
        <AddSongSection as="form" onSubmit={handleAddToCollection}>
          <SongCombobox
            inputValue={addInput}
            onInputChange={setAddInput}
            onSelect={setAddSelected}
            placeholder="Add a song to this collection…"
          />
          <SmallButton type="submit" disabled={!addSelected}>Add</SmallButton>
        </AddSongSection>
      )}
    </div>
  )
}
