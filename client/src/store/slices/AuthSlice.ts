import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import type {RootState} from '../index'

interface RegisterObject {
	email: string
	displayName: string
	password: string
}

interface LoginObject {
	email: string
	password: string
}

export const userRegister = createAsyncThunk(
	'auth/register',
	async (user: RegisterObject) => {
		const response = await fetch('http://localhost:8080/user/sign-up', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(user),
		})

		const data = await response.json()

		localStorage.setItem('userToken', data.token)
		localStorage.setItem('userInfo', JSON.stringify(data.user))
		return data
	}
)

export const userLogin = createAsyncThunk(
	'auth/login',
	async (user: LoginObject) => {
		const response = await fetch('http://localhost:8080/user/sign-in', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(user),
		})

		const data = await response.json()

		localStorage.setItem('userToken', data.token)
		localStorage.setItem('userInfo', JSON.stringify(data.user))
		return data
	}
)

const userToken = localStorage.getItem('userToken')
	? localStorage.getItem('userToken')
	: null

const infoString = localStorage.getItem('userInfo')

const userInfo = infoString ? JSON.parse(infoString) : null

interface UserInfo {
	id: number
	email: string
	username: string
	displayName: string
	avatarUrl: string | null
	description: string
}

interface AuthState {
	userInfo: null | UserInfo
	userToken: null | string
	loading: boolean
	error: string | null | undefined
}

const initialState = {
	userInfo,
	userToken,
	loading: false,
	error: null,
} as AuthState

export const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		logout: (state) => {
			localStorage.removeItem('userToken')
			localStorage.removeItem('userInfo')
			state.loading = false
			state.userInfo = null
			state.userToken = null
			state.error = null
		},
		setCredentials: (state, {payload}) => {
			localStorage.setItem('userInfo', JSON.stringify(payload))
			state.userInfo = payload
		},
	},
	extraReducers: (builder) => {
		builder.addCase(userRegister.pending, (state) => {
			state.loading = true
			state.error = null
		})
		builder.addCase(userRegister.fulfilled, (state, action) => {
			state.loading = false
			state.userInfo = action.payload.user
			state.userToken = action.payload.token
		})
		builder.addCase(userRegister.rejected, (state, action) => {
			state.loading = false
			state.error = action.error.message
		})
		builder.addCase(userLogin.pending, (state) => {
			state.loading = true
			state.error = null
		})
		builder.addCase(userLogin.fulfilled, (state, action) => {
			state.loading = false
			state.userInfo = action.payload.user
			state.userToken = action.payload.token
		})
		builder.addCase(userLogin.rejected, (state, action) => {
			state.loading = false
			state.error = action.error.message
		})
	},
})

export const {logout, setCredentials} = authSlice.actions

export const selectUserInfo = (state: RootState) => state.auth.userInfo
export const selectUserToken = (state: RootState) => state.auth.userToken
export const selectIsAuthLoading = (state: RootState) => state.auth.loading

export default authSlice.reducer
