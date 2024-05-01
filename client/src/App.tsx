import {useEffect} from 'react'
import {
	Outlet,
	Route,
	Routes,
	Link,
	useLocation,
	Navigate,
} from 'react-router-dom'
import {useSelector, useDispatch} from 'react-redux'
import {setCredentials, logout, selectUserInfo} from './store/slices/AuthSlice'
import {useGetUserInfoQuery} from './store/slices/AlleySlice'
import {ThemeProvider} from './components/ThemeProvider'
import {Home} from './views/Home'
import {Search} from './views/Search'
import {Profile} from './views/Profile'
import {Artwork} from './views/Artwork'
import {Register} from './views/Register'
import {Login} from './views/Login'
import {Settings} from './views/Settings'
import {Upload} from './views/Upload'
import {NoMatch} from './views/NoMatch'
import {SearchInput} from './components/SearchInput'
import {UserNav} from './components/UserNav'
import {MainNav} from './components/MainNav'
import {Button} from '@/components/ui/button'
import {Avatar} from './views/settings/Avatar'
import {Email} from './views/settings/Email'
import {DisplayName} from './views/settings/DisplayName'
import {Description} from './views/settings/Description'
import {Artists} from './views/search/Artists'
import {Artworks} from './views/search/Artworks'
import {Toaster} from '@/components/ui/toaster'

function Layout() {
	const userInfo = useSelector(selectUserInfo)
	return (
		<>
			<div className='flex-col md:flex'>
				<div className='border-b'>
					<div className='flex h-16 items-center px-4'>
						<MainNav className='mx-6' />
						<div className='ml-auto flex items-center space-x-4'>
							<SearchInput />
							{userInfo ? (
								<UserNav />
							) : (
								<>
									<Link to='/login'>
										<Button>Login</Button>
									</Link>
									<Link to='/register'>
										<Button>Register</Button>
									</Link>
								</>
							)}
						</div>
					</div>
				</div>
			</div>
			<Outlet />
			<Toaster />
		</>
	)
}

function RequireAuth({children}: {children: JSX.Element}) {
	const userInfo = useSelector(selectUserInfo)
	const location = useLocation()

	if (!userInfo) {
		return <Navigate to='/login' state={{from: location}} replace />
	}

	return children
}

function App() {
	const dispatch = useDispatch()
	const {data, error} = useGetUserInfoQuery({pollingInterval: 900000})

	useEffect(() => {
		if (data) dispatch(setCredentials(data))
	}, [data, dispatch])

	if (error) {
		if ('status' in error) {
			if (error.status === 401) {
				dispatch(logout())
			}
		}
	}

	return (
		<ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
			<Routes>
				<Route path='/' element={<Layout />}>
					<Route index element={<Home />} />
					<Route path='search' element={<Search />}>
						<Route path='artworks' element={<Artworks />} />
						<Route path='artists' element={<Artists />} />
					</Route>
					<Route path='artist/:id' element={<Profile />} />
					<Route path='post/:id' element={<Artwork />} />
					<Route path='register' element={<Register />} />
					<Route path='login' element={<Login />} />
					<Route
						path='upload'
						element={
							<RequireAuth>
								<Upload />
							</RequireAuth>
						}
					/>
					<Route
						path='settings'
						element={
							<RequireAuth>
								<Settings />
							</RequireAuth>
						}
					>
						<Route
							index
							element={
								<>
									<Avatar />
									<Email />
								</>
							}
						/>
						<Route
							path='account'
							element={
								<>
									<Avatar />
									<Email />
								</>
							}
						/>
						<Route
							path='profile'
							element={
								<>
									<DisplayName />
									<Description />
								</>
							}
						/>
					</Route>
					<Route path='404' element={<NoMatch />} />
					<Route path='*' element={<NoMatch />} />
				</Route>
			</Routes>
		</ThemeProvider>
	)
}

export default App
