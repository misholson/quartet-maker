import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  Singer,
  SingerSummary,
  SongSummary,
  RepertoireEntry,
  AddSongRequest,
  CreateSongRequest,
  ImportSongsRequest,
  QuartetSong,
  QuartetDetail,
  QuartetSummary,
  CollectionSummary,
  CollectionDetail,
  CollectionSong,
  ImportResult,
  Part,
  Role,
  LoginResponse,
} from '../types/api'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

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
  tagTypes: ['Singer', 'Quartet', 'Collection'],
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

    setPreferredPart: builder.mutation<void, { singerId: number; part: Part | null }>({
      query: ({ part }) => ({
        url: '/api/singers/preferred-part',
        method: 'PUT',
        body: { part },
      }),
      invalidatesTags: (_result, _error, { singerId }) => [{ type: 'Singer', id: singerId }],
    }),

    setNickname: builder.mutation<string | null, { singerId: number; nickname: string | null }>({
      query: ({ nickname }) => ({
        url: '/api/singers/nickname',
        method: 'PUT',
        body: { nickname },
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

    createQuartet: builder.mutation<QuartetDetail, { name: string }>({
      query: body => ({ url: '/api/quartets', method: 'POST', body }),
      invalidatesTags: [{ type: 'Quartet', id: 'LIST' }],
    }),

    getMyQuartets: builder.query<QuartetSummary[], void>({
      query: () => '/api/quartets/my',
      providesTags: [{ type: 'Quartet', id: 'LIST' }],
    }),

    getQuartet: builder.query<QuartetDetail, number>({
      query: id => `/api/quartets/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Quartet', id }],
    }),

    joinQuartet: builder.mutation<QuartetDetail, string>({
      query: inviteCode => ({ url: `/api/quartets/join/${inviteCode}`, method: 'POST' }),
      invalidatesTags: [{ type: 'Quartet', id: 'LIST' }],
    }),

    getQuartetSongs: builder.query<QuartetSong[], number>({
      query: quartetId => `/api/quartets/${quartetId}/songs`,
    }),

    getSongs: builder.query<SongSummary[], string>({
      query: search => `/api/songs?search=${encodeURIComponent(search)}`,
    }),

    createSong: builder.mutation<SongSummary, CreateSongRequest>({
      query: body => ({ url: '/api/songs', method: 'POST', body }),
    }),

    importSongs: builder.mutation<ImportResult, ImportSongsRequest>({
      query: body => ({ url: '/api/songs/import', method: 'POST', body }),
    }),

    setRole: builder.mutation<void, { singerId: number; role: Role }>({
      query: ({ singerId, role }) => ({ url: `/api/singers/${singerId}/role`, method: 'PUT', body: { role } }),
      invalidatesTags: (_result, _error, { singerId }) => [{ type: 'Singer', id: singerId }],
    }),

    getCollections: builder.query<CollectionSummary[], string>({
      query: search => `/api/collections${search ? `?search=${encodeURIComponent(search)}` : ''}`,
      providesTags: result =>
        result
          ? [...result.map(({ id }) => ({ type: 'Collection' as const, id })), { type: 'Collection' as const, id: 'LIST' }]
          : [{ type: 'Collection' as const, id: 'LIST' }],
    }),

    getCollection: builder.query<CollectionDetail, number>({
      query: id => `/api/collections/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Collection', id }],
    }),

    createCollection: builder.mutation<CollectionDetail, { name: string; description?: string }>({
      query: body => ({ url: '/api/collections', method: 'POST', body }),
      invalidatesTags: [{ type: 'Collection', id: 'LIST' }],
    }),

    updateCollection: builder.mutation<void, { id: number; name: string; description?: string }>({
      query: ({ id, ...body }) => ({ url: `/api/collections/${id}`, method: 'PUT', body }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Collection', id }, { type: 'Collection', id: 'LIST' }],
    }),

    deleteCollection: builder.mutation<void, number>({
      query: id => ({ url: `/api/collections/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Collection', id }, { type: 'Collection', id: 'LIST' }],
    }),

    addSongToCollection: builder.mutation<CollectionSong, { collectionId: number; songId: number }>({
      query: ({ collectionId, songId }) => ({ url: `/api/collections/${collectionId}/songs`, method: 'POST', body: { songId } }),
      invalidatesTags: (_result, _error, { collectionId }) => [{ type: 'Collection', id: collectionId }],
    }),

    removeSongFromCollection: builder.mutation<void, { collectionId: number; songId: number }>({
      query: ({ collectionId, songId }) => ({ url: `/api/collections/${collectionId}/songs/${songId}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, { collectionId }) => [{ type: 'Collection', id: collectionId }],
    }),

    importCollection: builder.mutation<ImportResult, { collectionId: number; part: Part; singerId: number }>({
      query: ({ collectionId, part }) => ({ url: `/api/collections/${collectionId}/import`, method: 'POST', body: { part } }),
      invalidatesTags: (_result, _error, { singerId }) => [{ type: 'Singer', id: singerId }],
    }),
  }),
})

export const {
  useGoogleLoginMutation,
  useGetSingersQuery,
  useGetSingerQuery,
  useAddSongMutation,
  useSetPreferredPartMutation,
  useSetNicknameMutation,
  useRemoveSongMutation,
  useCreateQuartetMutation,
  useGetMyQuartetsQuery,
  useGetQuartetQuery,
  useJoinQuartetMutation,
  useGetQuartetSongsQuery,
  useGetSongsQuery,
  useCreateSongMutation,
  useImportSongsMutation,
  useSetRoleMutation,
  useGetCollectionsQuery,
  useGetCollectionQuery,
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
  useDeleteCollectionMutation,
  useAddSongToCollectionMutation,
  useRemoveSongFromCollectionMutation,
  useImportCollectionMutation,
} = api
