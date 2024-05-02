import {Outlet, Link, useRouterState} from '@tanstack/react-router'

export function Settings() {
	const location = useRouterState({
		select: (state) => state.location,
	})

	return (
		<main className='flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10'>
			<div className='mx-auto grid w-full max-w-6xl gap-2'>
				<h1 className='text-3xl font-semibold'>Settings</h1>
			</div>
			<div className='mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]'>
				<nav className='grid gap-4 text-sm text-muted-foreground'>
					<Link to='/settings/account'>
						<span
							className={
								location.pathname === '/settings/account'
									? 'font-semibold text-primary'
									: undefined
							}
						>
							Account
						</span>
					</Link>
					<Link to='/settings/profile'>
						<span
							className={
								location.pathname === '/settings/profile'
									? 'font-semibold text-primary'
									: undefined
							}
						>
							Profile
						</span>
					</Link>
					{!!(<span>Security</span>)}
				</nav>
				<div className='grid gap-6'>
					<Outlet />
				</div>
			</div>
		</main>
	)
}
