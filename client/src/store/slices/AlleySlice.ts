import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'
import {RootState} from '..'

export const AlleyApi = createApi({
	reducerPath: 'AlleyApi',
	baseQuery: fetchBaseQuery({
		baseUrl: 'http://localhost:8080/',
		prepareHeaders(headers, {getState}) {
			const token = (getState() as RootState).auth.userToken
			if (token) {
				headers.set('Authorization', `Bearer ${token}`)
				return headers
			}
		},
	}),
	endpoints: (builder) => ({
		getUserInfo: builder.query({
			query: () => 'user/profile',
		}),
		getGallery: builder.query({
			query: ({sort_by, page}) =>
				`artwork/gallery?sort_by=${sort_by}&offset=${page * 60}&limit=60`,
			serializeQueryArgs: ({endpointName}) => {
				return endpointName
			},
			merge: (currentCache, newItems, args) => {
				if (args.arg.page > 0) {
					currentCache.artworks.push(...newItems.artworks)
					currentCache.hasMore = newItems.hasMore
					return currentCache
				}
				return newItems
			},
			forceRefetch({currentArg, previousArg}) {
				return currentArg !== previousArg
			},
		}),
		getPost: builder.query({
			query: (id) => `artwork/art/${id}`,
		}),
		getPostComments: builder.query({
			query: (id) => `artwork/art/${id}/comments`,
		}),
		getPostLike: builder.query({
			query: (id) => `artwork/art/${id}/like`,
		}),
		getSearch: builder.query({
			query: ({params, page}) => {
				if (!params) {
					throw new Error('param is required')
				}
				return `artwork/search?term=${params}&offset=${page * 60}&limit=60`
			},
			serializeQueryArgs: ({endpointName}) => {
				return endpointName
			},
			merge: (currentCache, newItems, args) => {
				if (args.arg.page > 0) {
					currentCache.artworks.push(...newItems.artworks)
					currentCache.hasMore = newItems.hasMore
					return currentCache
				}
				return newItems
			},
			forceRefetch({currentArg, previousArg}) {
				return currentArg !== previousArg
			},
		}),
		getArtists: builder.query({
			query: ({params, page}) => {
				if (!params) {
					throw new Error('param is required')
				}
				return `user/search?term=${params}&offset=${page * 4}&limit=4`
			},
			serializeQueryArgs: ({endpointName}) => {
				return endpointName
			},
			merge: (currentCache, newItems, args) => {
				if (args.arg.page > 0) {
					currentCache.artists.push(...newItems.artists)
					currentCache.hasMore = newItems.hasMore
					return currentCache
				}
				return newItems
			},
			forceRefetch({currentArg, previousArg}) {
				return currentArg !== previousArg
			},
		}),
		getArtistProfile: builder.query({
			query: (id) => `user/artist/${id}`,
		}),
		getArtistProfileGallery: builder.query({
			query: (id) => `user/artist/${id}/gallery`,
		}),
		getArtistProfileLikes: builder.query({
			query: (id) => `user/artist/${id}/likes`,
		}),
	}),
})

export const {
	useGetUserInfoQuery,
	useGetGalleryQuery,
	useGetPostQuery,
	useGetPostCommentsQuery,
	useGetPostLikeQuery,
	useGetSearchQuery,
	useGetArtistsQuery,
	useGetArtistProfileQuery,
	useGetArtistProfileGalleryQuery,
	useGetArtistProfileLikesQuery,
} = AlleyApi
