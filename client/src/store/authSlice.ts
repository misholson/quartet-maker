import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { LoginResponse, Role } from '../types/api'

interface AuthState {
  token: string | null
  singerId: number | null
  name: string | null
  role: Role | null
}

const STORAGE_KEY = 'quartet_auth'

function loadFromStorage(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { token: null, singerId: null, name: null, role: null }
    const parsed = JSON.parse(raw) as Partial<AuthState>
    return {
      token: parsed.token ?? null,
      singerId: parsed.singerId ?? null,
      name: parsed.name ?? null,
      role: parsed.role ?? null,
    }
  } catch {
    return { token: null, singerId: null, name: null, role: null }
  }
}

function persist(state: AuthState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    token: state.token,
    singerId: state.singerId,
    name: state.name,
    role: state.role,
  }))
}

const authSlice = createSlice({
  name: 'auth',
  initialState: loadFromStorage,
  reducers: {
    setCredentials(state, action: PayloadAction<LoginResponse>) {
      state.token = action.payload.token
      state.singerId = action.payload.singerId
      state.name = action.payload.name
      state.role = action.payload.role
      persist(state)
    },
    setName(state, action: PayloadAction<string>) {
      state.name = action.payload
      persist(state)
    },
    logout(state) {
      state.token = null
      state.singerId = null
      state.name = null
      state.role = null
      localStorage.removeItem(STORAGE_KEY)
    },
  },
})

export const { setCredentials, setName, logout } = authSlice.actions
export default authSlice.reducer
