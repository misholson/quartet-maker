export type Part = 'Tenor' | 'Lead' | 'Baritone' | 'Bass'
export type Voicing = 'TTBB' | 'SATB' | 'SSAA' | 'Other'
export type Role = 'User' | 'Admin'

export interface SingerSummary {
  id: number
  name: string
  songCount: number
}

export interface RepertoireEntry {
  songId: number
  songTitle: string
  part: Part
  arranger: string | null
  voicing: Voicing | null
}

export interface Singer {
  id: number
  name: string
  nickname: string | null
  preferredPart: Part | null
  repertoire: RepertoireEntry[]
}

export interface AddSongRequest {
  songTitle: string
  part: Part
  arranger?: string
  voicing?: Voicing
}

export interface PartCoverage {
  tenor: string[]
  lead: string[]
  baritone: string[]
  bass: string[]
}

export interface LoginResponse {
  token: string
  singerId: number
  name: string
  role: Role
}

export interface QuartetMemberInfo {
  singerId: number
  name: string
  isOwner: boolean
}

export interface QuartetDetail {
  id: number
  name: string
  inviteCode: string
  members: QuartetMemberInfo[]
}

export interface QuartetSummary {
  id: number
  name: string
  memberCount: number
  joinedAt: string
}

export interface CollectionSong {
  songId: number
  title: string
  arranger: string | null
  voicing: Voicing | null
}

export interface CollectionSummary {
  id: number
  name: string
  description: string | null
  createdBy: string
  createdById: number
  songCount: number
}

export interface CollectionDetail {
  id: number
  name: string
  description: string | null
  createdBy: string
  createdById: number
  songs: CollectionSong[]
}

export interface ImportResult {
  added: number
  skipped: number
}

export interface CollectionCsvRow {
  title: string
  collection: string
}

export interface ImportCollectionCsvRequest {
  rows: CollectionCsvRow[]
}

export interface CsvSkippedRow {
  title: string
  collection: string
  reason: string
  candidates?: SongSummary[]
}

export interface ImportCollectionCsvResult {
  added: number
  skipped: CsvSkippedRow[]
}

export interface AddSongByNameRequest {
  collectionName: string
  songId: number
}

export interface SongSummary {
  id: number
  title: string
  arranger: string | null
  voicing: Voicing | null
}

export interface CreateSongRequest {
  title: string
  arranger?: string
  voicing?: Voicing
}

export interface ImportSongsRequest {
  songs: CreateSongRequest[]
}

export interface QuartetSong {
  title: string
  arranger: string | null
  voicing: Voicing | null
  coverage: PartCoverage
  isComplete: boolean
}
