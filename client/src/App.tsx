import {useEffect} from 'react'
import {RouterProvider, createRouter} from '@tanstack/react-router'
import {useDispatch, useSelector} from 'react-redux'
import {setCredentials, logout, selectUserInfo} from './store/slices/AuthSlice'
import {useGetUserInfoQuery} from './store/slices/AlleySlice'
import {ThemeProvider} from './components/ThemeProvider'
import {routeTree} from './routes/routes'
import {NoMatch} from './views/NoMatch'

const router = createRouter({
	routeTree,
	defaultNotFoundComponent: () => {
		return <NoMatch />
	},
	context: {
		userInfo: undefined!,
	},
})

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router
	}
}

function App() {
	const dispatch = useDispatch()
	const userInfo = useSelector(selectUserInfo)
	const {data, error} = useGetUserInfoQuery({pollingInterval: 900000})

	useEffect(() => {
		if (data) dispatch(setCredentials(data))
	}, [data, dispatch])

	useEffect(() => {
		if (error) {
			if ('status' in error) {
				if (error.status === 401) {
					dispatch(logout())
				}
			}
		}
	}, [error, dispatch])

	return (
		<ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
			<RouterProvider router={router} context={{userInfo: userInfo}} />
		</ThemeProvider>
	)
}

export default App
