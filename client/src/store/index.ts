import {configureStore} from '@reduxjs/toolkit'
import {AlleyApi} from './slices/AlleySlice'
import authReducer from './slices/AuthSlice'

export const store = configureStore({
	reducer: {
		[AlleyApi.reducerPath]: AlleyApi.reducer,
		auth: authReducer,
	},
	middleware: (getDefaultMiddleware) => {
		return getDefaultMiddleware().concat(AlleyApi.middleware)
	},
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
