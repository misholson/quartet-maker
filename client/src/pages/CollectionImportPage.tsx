import { useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAppSelector } from '../store'
import { useImportCollectionCsvMutation, useAddSongByNameMutation } from '../store/apiSlice'
import type { CsvSkippedRow } from '../types/api'

// ── Styled components ──────────────────────────────────────────────────────────

const Page = styled.div`padding: 1.5rem 0;`
const H1 = styled.h1`margin: 0 0 1.5rem; font-size: 1.4rem;`

const Section = styled.section`
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
`

const Hint = styled.p`margin: 0 0 0.75rem; font-size: 0.875rem; color: var(--text-muted);`

const FileLabel = styled.label`
  display: inline-block;
  padding: 0.5rem 1rem;
  background: none;
  color: var(--btn-ghost-text);
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  &:hover { background: var(--bg-subtle); }
`

const HiddenInput = styled.input`display: none;`

const Divider = styled.div`
  text-align: center;
  margin: 0.75rem 0;
  color: var(--text-muted);
  font-size: 0.85rem;
  position: relative;
  &::before, &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 44%;
    height: 1px;
    background: var(--border);
  }
  &::before { left: 0; }
  &::after { right: 0; }
`

const Textarea = styled.textarea`
  padding: 0.5rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg-input);
  color: var(--text);
  font-size: 0.9rem;
  font-family: monospace;
  resize: vertical;
  width: 100%;
  min-height: 160px;
`

const ButtonRow = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 0.75rem;
`

const PrimaryButton = styled.button`
  padding: 0.5rem 1.1rem;
  background: var(--btn-primary-bg);
  color: var(--btn-primary-text);
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  &:disabled { opacity: 0.5; cursor: default; }
`

const SecondaryButton = styled.button`
  padding: 0.5rem 1rem;
  background: none;
  color: var(--btn-ghost-text);
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  &:hover { background: var(--bg-subtle); }
`

const SmallButton = styled.button`
  padding: 0.3rem 0.7rem;
  background: var(--btn-primary-bg);
  color: var(--btn-primary-text);
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  &:disabled { opacity: 0.5; cursor: default; }
`

const CandidateSelect = styled.select`
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg-input);
  color: var(--text);
  font-size: 0.8rem;
  max-width: 220px;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  margin-top: 0.75rem;
`

const Th = styled.th`
  text-align: left;
  padding: 0.4rem 0.5rem;
  border-bottom: 2px solid var(--border-strong);
  color: var(--text-muted);
  font-weight: 600;
`

const Td = styled.td`padding: 0.35rem 0.5rem; border-bottom: 1px solid var(--border-subtle);`

const ReasonTd = styled(Td)`color: var(--danger-text); font-style: italic;`

const ResolvedTd = styled(Td)`color: var(--success); font-weight: 600;`

const ResolveTd = styled(Td)`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
`

const ResultBanner = styled.div`
  padding: 0.75rem 1rem;
  border-radius: 6px;
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  color: var(--success);
  font-size: 0.9rem;
  margin-top: 0.75rem;
`

const ErrorText = styled.p`color: var(--danger-text); font-size: 0.85rem; margin: 0.5rem 0 0;`

// ── CSV parsing ────────────────────────────────────────────────────────────────

interface ParsedRow { title: string; collection: string }

function splitCsvLine(line: string): string[] {
  const fields: string[] = []
  let i = 0
  while (i < line.length) {
    if (line[i] === '"') {
      i++
      let field = ''
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') { field += '"'; i += 2 }
        else if (line[i] === '"') { i++; break }
        else { field += line[i++] }
      }
      fields.push(field)
      if (line[i] === ',') i++
    } else {
      const end = line.indexOf(',', i)
      if (end === -1) { fields.push(line.slice(i)); break }
      fields.push(line.slice(i, end))
      i = end + 1
    }
  }
  return fields
}

function parseCsv(raw: string): { rows: ParsedRow[]; error?: string } {
  const lines = raw.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return { rows: [], error: 'Need at least a header row and one data row.' }
  const headers = splitCsvLine(lines[0]).map(h => h.trim().toLowerCase())
  const titleIdx = headers.indexOf('title')
  const collectionIdx = headers.indexOf('collection')
  if (titleIdx === -1) return { rows: [], error: 'No "Title" column found in header row.' }
  if (collectionIdx === -1) return { rows: [], error: 'No "Collection" column found in header row.' }
  const rows: ParsedRow[] = []
  for (const line of lines.slice(1)) {
    const fields = splitCsvLine(line).map(f => f.trim())
    const title = fields[titleIdx] ?? ''
    const collection = fields[collectionIdx] ?? ''
    if (title || collection) rows.push({ title, collection })
  }
  return { rows }
}

function candidateLabel(arranger: string | null, voicing: string | null) {
  const parts = [arranger || 'Unknown arranger', voicing || ''].filter(Boolean)
  return parts.join(' · ')
}

// ── Skipped row component ──────────────────────────────────────────────────────

function SkippedRow({ row, index, onResolved }: {
  row: CsvSkippedRow
  index: number
  onResolved: (index: number) => void
}) {
  const [addSong, { isLoading }] = useAddSongByNameMutation()
  const [selectedId, setSelectedId] = useState<number>(row.candidates?.[0]?.id ?? 0)
  const [resolved, setResolved] = useState(false)
  const [error, setError] = useState(false)

  const isAmbiguous = (row.candidates?.length ?? 0) > 0

  async function handleAdd() {
    if (!selectedId) return
    setError(false)
    try {
      await addSong({ collectionName: row.collection, songId: selectedId }).unwrap()
      setResolved(true)
      onResolved(index)
    } catch {
      setError(true)
    }
  }

  return (
    <tr>
      <Td>{row.title}</Td>
      <Td>{row.collection}</Td>
      {resolved ? (
        <ResolvedTd colSpan={2}>Added</ResolvedTd>
      ) : isAmbiguous ? (
        <>
          <ResolveTd>
            <CandidateSelect
              value={selectedId}
              onChange={e => setSelectedId(Number(e.target.value))}
            >
              {row.candidates!.map(c => (
                <option key={c.id} value={c.id}>{candidateLabel(c.arranger, c.voicing)}</option>
              ))}
            </CandidateSelect>
            <SmallButton onClick={handleAdd} disabled={isLoading}>
              {isLoading ? '…' : 'Add'}
            </SmallButton>
            {error && <span style={{ color: 'var(--danger-text)', fontSize: '0.8rem' }}>Failed</span>}
          </ResolveTd>
          <Td />
        </>
      ) : (
        <ReasonTd colSpan={2}>{row.reason}</ReasonTd>
      )}
    </tr>
  )
}

// ── Page component ─────────────────────────────────────────────────────────────

export default function CollectionImportPage() {
  const isAdmin = useAppSelector(s => s.auth.role === 'Admin')
  const navigate = useNavigate()
  if (!isAdmin) return <Navigate to="/collections" replace />

  const [csvText, setCsvText] = useState('')
  const [preview, setPreview] = useState<ParsedRow[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [result, setResult] = useState<{ added: number; skipped: CsvSkippedRow[] } | null>(null)
  const [resolvedCount, setResolvedCount] = useState(0)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const fileRef = useRef<HTMLInputElement>(null)
  const [importCsv, { isLoading }] = useImportCollectionCsvMutation()

  function handleCsvChange(text: string) {
    setCsvText(text)
    setResult(null)
    setResolvedCount(0)
    setSubmitError(null)
    if (!text.trim()) { setPreview([]); setParseError(null); return }
    const { rows, error } = parseCsv(text)
    setParseError(error ?? null)
    setPreview(rows)
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => handleCsvChange(ev.target?.result as string)
    reader.readAsText(file)
    e.target.value = ''
  }

  async function handleImport() {
    setSubmitError(null)
    const validRows = preview.filter(r => r.title && r.collection)
    if (validRows.length === 0) return
    try {
      const res = await importCsv({ rows: validRows }).unwrap()
      setResult(res)
      setResolvedCount(0)
      setCsvText('')
      setPreview([])
    } catch {
      setSubmitError('Import failed. Please try again.')
    }
  }

  const validRows = preview.filter(r => r.title && r.collection)
  const pendingSkipped = result ? result.skipped.length - resolvedCount : 0

  return (
    <Page>
      <H1>Import Collections from CSV</H1>

      <Section>
        <Hint>
          The CSV must have a header row with columns named <strong>Title</strong> and{' '}
          <strong>Collection</strong> (case-insensitive, any order). Each row adds the song to the
          named collection, creating it if needed. If a title matches multiple songs you can pick
          which one to use after importing.
        </Hint>

        <FileLabel htmlFor="col-csv-file">Upload CSV file</FileLabel>
        <HiddenInput id="col-csv-file" ref={fileRef} type="file" accept=".csv,text/csv" onChange={handleFileUpload} />

        <Divider>or paste below</Divider>

        <Textarea
          value={csvText}
          onChange={e => handleCsvChange(e.target.value)}
          placeholder={'Collection,Title\n"Contest Songs","Sweet Adeline"'}
          spellCheck={false}
        />

        {parseError && <ErrorText>{parseError}</ErrorText>}

        {preview.length > 0 && !parseError && (
          <>
            <Table>
              <thead>
                <tr><Th>Title</Th><Th>Collection</Th></tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i}>
                    <Td>{row.title || <em style={{ color: 'var(--text-faint)' }}>(empty)</em>}</Td>
                    <Td>{row.collection || <em style={{ color: 'var(--text-faint)' }}>(empty)</em>}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {validRows.length} row{validRows.length !== 1 ? 's' : ''} ready to import
            </p>
          </>
        )}

        <ButtonRow>
          <PrimaryButton onClick={handleImport} disabled={isLoading || validRows.length === 0 || !!parseError}>
            {isLoading ? 'Importing…' : `Import ${validRows.length > 0 ? `${validRows.length} row${validRows.length !== 1 ? 's' : ''}` : 'rows'}`}
          </PrimaryButton>
          {csvText && (
            <SecondaryButton onClick={() => { setCsvText(''); setPreview([]); setParseError(null); setResult(null) }}>
              Clear
            </SecondaryButton>
          )}
          <SecondaryButton onClick={() => navigate('/collections')}>Back to Collections</SecondaryButton>
        </ButtonRow>

        {submitError && <ErrorText>{submitError}</ErrorText>}
      </Section>

      {result && (
        <Section>
          <ResultBanner>
            {result.added} song{result.added !== 1 ? 's' : ''} added.
            {pendingSkipped > 0 && ` ${pendingSkipped} row${pendingSkipped !== 1 ? 's' : ''} skipped — resolve ambiguous ones below.`}
            {pendingSkipped === 0 && result.skipped.length > 0 && ' All skipped rows resolved.'}
          </ResultBanner>

          {result.skipped.length > 0 && (
            <>
              <h3 style={{ margin: '1rem 0 0.25rem', fontSize: '0.95rem' }}>Skipped rows</h3>
              <Table>
                <thead>
                  <tr>
                    <Th>Title</Th>
                    <Th>Collection</Th>
                    <Th colSpan={2}>Reason / Resolve</Th>
                  </tr>
                </thead>
                <tbody>
                  {result.skipped.map((row, i) => (
                    <SkippedRow
                      key={i}
                      row={row}
                      index={i}
                      onResolved={() => setResolvedCount(c => c + 1)}
                    />
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </Section>
      )}
    </Page>
  )
}
