import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { LoginResponse } from '../types/api'

interface AuthState {
  token: string | null
  singerId: number | null
  name: string | null
}

const STORAGE_KEY = 'quartet_auth'

function loadFromStorage(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AuthState) : { token: null, singerId: null, name: null }
  } catch {
    return { token: null, singerId: null, name: null }
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: loadFromStorage,
  reducers: {
    setCredentials(state, action: PayloadAction<LoginResponse>) {
      state.token = action.payload.token
      state.singerId = action.payload.singerId
      state.name = action.payload.name
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        token: state.token,
        singerId: state.singerId,
        name: state.name,
      }))
    },
    setName(state, action: PayloadAction<string>) {
      state.name = action.payload
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        token: state.token,
        singerId: state.singerId,
        name: state.name,
      }))
    },
    logout(state) {
      state.token = null
      state.singerId = null
      state.name = null
      localStorage.removeItem(STORAGE_KEY)
    },
  },
})

export const { setCredentials, setName, logout } = authSlice.actions
export default authSlice.reducer
