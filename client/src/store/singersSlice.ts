import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface SingersState {
  currentSingerId: number
}

const singersSlice = createSlice({
  name: 'singers',
  initialState: { currentSingerId: 1 } as SingersState,
  reducers: {
    setCurrentSinger(state, action: PayloadAction<number>) {
      state.currentSingerId = action.payload
    },
  },
})

export const { setCurrentSinger } = singersSlice.actions
export default singersSlice.reducer
