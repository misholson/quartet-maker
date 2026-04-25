import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  Singer,
  SingerSummary,
  RepertoireEntry,
  AddSongRequest,
  QuartetSong,
  Part,
  LoginResponse,
} from '../types/api'

const API_BASE = 'http://localhost:5143'

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as { auth: { token: string | null } }).auth.token
      if (token) headers.set('Authorization', `Bearer ${token}`)
      return headers
    },
  }),
  tagTypes: ['Singer'],
  endpoints: builder => ({
    googleLogin: builder.mutation<LoginResponse, { idToken: string }>({
      query: body => ({
        url: '/api/auth/google',
        method: 'POST',
        body,
      }),
    }),

    getSingers: builder.query<SingerSummary[], void>({
      query: () => '/api/singers',
      providesTags: result =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Singer' as const, id })),
              { type: 'Singer' as const, id: 'LIST' },
            ]
          : [{ type: 'Singer' as const, id: 'LIST' }],
    }),

    getSinger: builder.query<Singer, number>({
      query: id => `/api/singers/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Singer', id }],
    }),

    addSong: builder.mutation<RepertoireEntry, { singerId: number; body: AddSongRequest }>({
      query: ({ singerId, body }) => ({
        url: `/api/singers/${singerId}/songs`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { singerId }) => [{ type: 'Singer', id: singerId }],
    }),

    removeSong: builder.mutation<void, { singerId: number; songId: number; part: Part }>({
      query: ({ singerId, songId, part }) => ({
        url: `/api/singers/${singerId}/songs/${songId}/${part}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { singerId }) => [{ type: 'Singer', id: singerId }],
    }),

    getQuartetSongs: builder.query<QuartetSong[], number[]>({
      query: singerIds =>
        `/api/quartet?${singerIds.map(id => `singerIds=${id}`).join('&')}`,
    }),
  }),
})

export const {
  useGoogleLoginMutation,
  useGetSingersQuery,
  useGetSingerQuery,
  useAddSongMutation,
  useRemoveSongMutation,
  useGetQuartetSongsQuery,
} = api
