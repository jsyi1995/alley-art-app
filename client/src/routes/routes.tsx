import {
	Outlet,
	Link,
	createRoute,
	redirect,
	createRootRouteWithContext,
} from '@tanstack/react-router'
import {useSelector} from 'react-redux'
import {selectUserInfo} from '../store/slices/AuthSlice'
import {UserNav} from '../components/UserNav'
import {MainNav} from '../components/MainNav'
import {SearchInput} from '../components/SearchInput'
import {Home} from '../views/Home'
import {Search} from '../views/Search'
import {Profile} from '../views/Profile'
import {Artwork} from '../views/Artwork'
import {Register} from '../views/Register'
import {Login} from '../views/Login'
import {Settings} from '../views/Settings'
import {Upload} from '../views/Upload'
import {NoMatch} from '../views/NoMatch'
import {Avatar} from '../views/settings/Avatar'
import {Email} from '../views/settings/Email'
import {DisplayName} from '../views/settings/DisplayName'
import {Description} from '../views/settings/Description'
import {Artists} from '../views/search/Artists'
import {Artworks} from '../views/search/Artworks'
import * as z from 'zod'
import {Button} from '@/components/ui/button'
import {Toaster} from '@/components/ui/toaster'

const fallback = '/dashboard' as const

interface MyRouterContext {
	userInfo
}

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

const rootRoute = createRootRouteWithContext<MyRouterContext>()({
	component: () => <Layout />,
})

const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/',
	component: () => <Home />,
})

const profileRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/artist/$id',
	component: () => <Profile />,
})

const artworkRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/post/$id',
	component: () => <Artwork />,
})

const loginRoute = createRoute({
	validateSearch: z.object({
		redirect: z.string().optional().catch(''),
	}),
	getParentRoute: () => rootRoute,
	path: '/login',
	component: () => <Login />,
	beforeLoad: ({context, search}) => {
		if (context.userInfo) {
			throw redirect({to: search.redirect || fallback})
		}
	},
})

const registerRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/register',
	component: () => <Register />,
})

const uploadRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/upload',
	component: () => <Upload />,
	beforeLoad: ({context, location}) => {
		if (!context.userInfo) {
			throw redirect({
				to: '/login',
				search: {
					redirect: location.href,
				},
			})
		}
	},
})

const searchRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/search',
	component: () => <Search />,
	validateSearch: z.object({
		query: z.string().catch(''),
	}),
})

const searchArtworksRoute = createRoute({
	getParentRoute: () => searchRoute,
	path: '/artworks',
	component: () => <Artworks />,
})

const searchArtistsRoute = createRoute({
	getParentRoute: () => searchRoute,
	path: '/artists',
	component: () => <Artists />,
})

const settingsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/settings',
	component: () => <Settings />,
	beforeLoad: ({context, location}) => {
		if (!context.userInfo) {
			throw redirect({
				to: '/login',
				search: {
					redirect: location.href,
				},
			})
		}
	},
})

const settingsAccountRoute = createRoute({
	getParentRoute: () => settingsRoute,
	path: '/account',
	component: function SettingsAccountRoute() {
		return (
			<>
				<Avatar />
				<Email />
			</>
		)
	},
})

const settingsProfileRoute = createRoute({
	getParentRoute: () => settingsRoute,
	path: '/profile',
	component: function SettingsProfileRoute() {
		return (
			<>
				<DisplayName />
				<Description />
			</>
		)
	},
})

const missingRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/404',
	component: () => <NoMatch />,
})

export const routeTree = rootRoute.addChildren([
	indexRoute,
	profileRoute,
	artworkRoute,
	loginRoute,
	registerRoute,
	uploadRoute,
	searchRoute.addChildren([searchArtworksRoute, searchArtistsRoute]),
	settingsRoute.addChildren([settingsAccountRoute, settingsProfileRoute]),
	missingRoute,
])
