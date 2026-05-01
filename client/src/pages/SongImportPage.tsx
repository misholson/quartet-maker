import { useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAppSelector } from '../store'
import { useCreateSongMutation, useImportSongsMutation } from '../store/apiSlice'
import type { CreateSongRequest, Voicing } from '../types/api'

const VOICING_OPTIONS: Voicing[] = ['TTBB', 'SATB', 'SSAA', 'Other']

// ── Styled components ──────────────────────────────────────────────────────────

const Page = styled.div`
  padding: 1.5rem 0;
`

const H1 = styled.h1`
  margin: 0 0 1.5rem;
  font-size: 1.4rem;
`

const Section = styled.section`
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
`

const SectionTitle = styled.h2`
  margin: 0 0 1rem;
  font-size: 1rem;
  font-weight: 600;
`

const FormRow = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
`

const FormGroup = styled.div<{ $grow?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex: ${({ $grow }) => ($grow ? '1 1 200px' : '0 1 auto')};
  min-width: 0;
`

const Label = styled.label`
  font-size: 0.85rem;
  color: var(--text-muted);
`

const Input = styled.input`
  padding: 0.45rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg-input);
  color: var(--text);
  font-size: 0.95rem;
  width: 100%;
`

const Select = styled.select`
  padding: 0.45rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg-input);
  color: var(--text);
  font-size: 0.95rem;
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

const HiddenInput = styled.input`
  display: none;
`

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

const ResultBanner = styled.div<{ $success?: boolean }>`
  padding: 0.75rem 1rem;
  border-radius: 6px;
  background: ${({ $success }) => ($success ? 'var(--bg-subtle)' : 'var(--danger-bg)')};
  border: 1px solid ${({ $success }) => ($success ? 'var(--border)' : 'var(--danger-border)')};
  color: ${({ $success }) => ($success ? 'var(--success)' : 'var(--danger-text)')};
  font-size: 0.9rem;
  margin-top: 0.75rem;
`

const ErrorText = styled.p`
  color: var(--danger-text);
  font-size: 0.85rem;
  margin: 0.5rem 0 0;
`

const PreviewTable = styled.table`
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

const Td = styled.td`
  padding: 0.35rem 0.5rem;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text);
`

const ErrorTd = styled(Td)`
  color: var(--danger-text);
  font-style: italic;
`

// ── CSV parsing ────────────────────────────────────────────────────────────────

interface ParsedRow {
  title: string
  arranger: string | undefined
  voicing: Voicing | undefined
  error?: string
}

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

function parseCsv(raw: string): ParsedRow[] {
  const lines = raw.split(/\r?\n/).filter(l => l.trim())
  if (lines.length === 0) return []

  const firstFields = splitCsvLine(lines[0]).map(f => f.trim().toLowerCase())
  const hasHeader =
    firstFields.includes('song') ||
    firstFields.includes('title') ||
    firstFields.includes('arranger') ||
    firstFields.includes('voicing')

  const dataLines = hasHeader ? lines.slice(1) : lines

  return dataLines
    .filter(l => l.trim())
    .map(line => {
      const fields = splitCsvLine(line).map(f => f.trim())
      const title = fields[0] ?? ''
      if (!title) return { title: '', arranger: undefined, voicing: undefined, error: 'Missing title' }

      const arranger = fields[1] || undefined
      const voicingRaw = fields[2]?.trim()
      let voicing: Voicing | undefined
      if (voicingRaw) {
        if ((VOICING_OPTIONS as string[]).includes(voicingRaw)) {
          voicing = voicingRaw as Voicing
        } else {
          return { title, arranger, voicing: undefined, error: `Unknown voicing "${voicingRaw}"` }
        }
      }

      return { title, arranger, voicing }
    })
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function SongImportPage() {
  const isAdmin = useAppSelector(s => s.auth.role === 'Admin')
  if (!isAdmin) return <Navigate to="/" replace />

  // Single song state
  const [singleTitle, setSingleTitle] = useState('')
  const [singleArranger, setSingleArranger] = useState('')
  const [singleVoicing, setSingleVoicing] = useState<Voicing | ''>('')
  const [singleResult, setSingleResult] = useState<string | null>(null)
  const [singleError, setSingleError] = useState<string | null>(null)

  // CSV state
  const [csvText, setCsvText] = useState('')
  const [preview, setPreview] = useState<ParsedRow[]>([])
  const [csvResult, setCsvResult] = useState<{ added: number; skipped: number } | null>(null)
  const [csvError, setCsvError] = useState<string | null>(null)

  const fileRef = useRef<HTMLInputElement>(null)

  const [createSong, { isLoading: creatingSong }] = useCreateSongMutation()
  const [importSongs, { isLoading: importingSongs }] = useImportSongsMutation()

  // ── Single song ──────────────────────────────────────────────────────────────

  async function handleSingleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSingleResult(null)
    setSingleError(null)

    const req: CreateSongRequest = {
      title: singleTitle.trim(),
      arranger: singleArranger.trim() || undefined,
      voicing: singleVoicing || undefined,
    }

    try {
      const song = await createSong(req).unwrap()
      setSingleResult(`"${song.title}" saved (ID ${song.id}).`)
      setSingleTitle('')
      setSingleArranger('')
      setSingleVoicing('')
    } catch {
      setSingleError('Failed to save song. Please try again.')
    }
  }

  // ── CSV ──────────────────────────────────────────────────────────────────────

  function handleCsvChange(text: string) {
    setCsvText(text)
    setCsvResult(null)
    setCsvError(null)
    setPreview(text.trim() ? parseCsv(text) : [])
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target?.result as string
      setCsvText(text)
      handleCsvChange(text)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  async function handleCsvImport() {
    setCsvResult(null)
    setCsvError(null)

    const validRows = preview.filter(r => r.title && !r.error)
    if (validRows.length === 0) {
      setCsvError('No valid rows to import.')
      return
    }

    try {
      const result = await importSongs({
        songs: validRows.map(r => ({ title: r.title, arranger: r.arranger, voicing: r.voicing })),
      }).unwrap()
      setCsvResult(result)
      setCsvText('')
      setPreview([])
    } catch {
      setCsvError('Import failed. Please try again.')
    }
  }

  const errorRows = preview.filter(r => r.error)
  const validRows = preview.filter(r => r.title && !r.error)

  return (
    <Page>
      <H1>Import Songs</H1>

      {/* ── Single song ── */}
      <Section>
        <SectionTitle>Add a single song</SectionTitle>
        <form onSubmit={handleSingleSubmit}>
          <FormRow>
            <FormGroup $grow>
              <Label htmlFor="s-title">Title *</Label>
              <Input
                id="s-title"
                value={singleTitle}
                onChange={e => setSingleTitle(e.target.value)}
                placeholder="e.g. Hello My Baby"
                required
              />
            </FormGroup>
            <FormGroup $grow>
              <Label htmlFor="s-arranger">Arranger</Label>
              <Input
                id="s-arranger"
                value={singleArranger}
                onChange={e => setSingleArranger(e.target.value)}
                placeholder="e.g. Howard Emerson Brooks"
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="s-voicing">Voicing</Label>
              <Select
                id="s-voicing"
                value={singleVoicing}
                onChange={e => setSingleVoicing(e.target.value as Voicing | '')}
              >
                <option value="">—</option>
                {VOICING_OPTIONS.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </Select>
            </FormGroup>
          </FormRow>
          <PrimaryButton type="submit" disabled={creatingSong || !singleTitle.trim()}>
            {creatingSong ? 'Saving…' : 'Add Song'}
          </PrimaryButton>
          {singleResult && <ResultBanner $success>{singleResult}</ResultBanner>}
          {singleError && <ErrorText>{singleError}</ErrorText>}
        </form>
      </Section>

      {/* ── CSV import ── */}
      <Section>
        <SectionTitle>Import from CSV</SectionTitle>
        <p style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Columns: <strong>song</strong>, <strong>arranger</strong>, <strong>voicing</strong>.
          A header row is optional and will be detected automatically.
          Voicing must be one of: {VOICING_OPTIONS.join(', ')}.
        </p>

        <FileLabel htmlFor="csv-file-input">
          Upload CSV file
        </FileLabel>
        <HiddenInput
          id="csv-file-input"
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileUpload}
        />

        <Divider>or paste below</Divider>

        <Textarea
          value={csvText}
          onChange={e => handleCsvChange(e.target.value)}
          placeholder={'song,arranger,voicing\n"Hello My Baby","Howard Emerson Brooks",TTBB'}
          spellCheck={false}
        />

        {preview.length > 0 && (
          <>
            <PreviewTable>
              <thead>
                <tr>
                  <Th>Title</Th>
                  <Th>Arranger</Th>
                  <Th>Voicing</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i}>
                    <Td>{row.title || <em style={{ color: 'var(--text-faint)' }}>(empty)</em>}</Td>
                    <Td>{row.arranger ?? ''}</Td>
                    <Td>{row.voicing ?? ''}</Td>
                    {row.error
                      ? <ErrorTd>{row.error}</ErrorTd>
                      : <Td style={{ color: 'var(--success)' }}>OK</Td>}
                  </tr>
                ))}
              </tbody>
            </PreviewTable>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {validRows.length} valid, {errorRows.length} with errors (will be skipped)
            </p>
          </>
        )}

        <ButtonRow>
          <PrimaryButton
            onClick={handleCsvImport}
            disabled={importingSongs || validRows.length === 0}
          >
            {importingSongs ? 'Importing…' : `Import ${validRows.length > 0 ? `${validRows.length} song${validRows.length !== 1 ? 's' : ''}` : 'songs'}`}
          </PrimaryButton>
          {csvText && (
            <SecondaryButton onClick={() => { setCsvText(''); setPreview([]); setCsvResult(null); setCsvError(null) }}>
              Clear
            </SecondaryButton>
          )}
        </ButtonRow>

        {csvResult && (
          <ResultBanner $success>
            Done — {csvResult.added} song{csvResult.added !== 1 ? 's' : ''} added,{' '}
            {csvResult.skipped} already existed (skipped).
          </ResultBanner>
        )}
        {csvError && <ErrorText>{csvError}</ErrorText>}
      </Section>
    </Page>
  )
}
