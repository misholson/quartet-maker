export type Part = 'Tenor' | 'Lead' | 'Baritone' | 'Bass'
export type Voicing = 'TTBB' | 'SATB' | 'SSAA' | 'Other'

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
}

export interface SongSummary {
  id: number
  title: string
  arranger: string | null
  voicing: Voicing | null
}

export interface QuartetSong {
  title: string
  arranger: string | null
  voicing: Voicing | null
  coverage: PartCoverage
  isComplete: boolean
}
