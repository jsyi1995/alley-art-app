import {useState, useEffect} from 'react'
import {
	Outlet,
	Link,
	useSearch,
	useRouterState,
	useNavigate,
} from '@tanstack/react-router'
import {ToggleGroup, ToggleGroupItem} from '@/components/ui/toggle-group'
import {Input} from '@/components/ui/input'

export function Search() {
	const [search, setSearch] = useState('')
	const query = useSearch({
		from: '/search',
		select: (search) => search.query,
	})

	const location = useRouterState({
		select: (state) => state.location,
	})

	const navigate = useNavigate({from: '/search'})

	const path = location.pathname
	const lastItem = path.substring(path.lastIndexOf('/') + 1)

	useEffect(() => {
		if (query) setSearch(query)
	}, [query])

	const handleChange = (term: string) => {
		setSearch(term)

		if (term.length > 0) {
			navigate({
				search: () => ({query: term}),
			})
		} else {
			navigate({
				search: () => ({query: ''}),
			})
		}
	}

	return (
		<div className='p-8 pt-6'>
			<ToggleGroup type='single' value={lastItem}>
				<ToggleGroupItem value='artworks'>
					<Link to='/search/artworks' search={() => ({query: query})}>
						<p className='text-lg'>Artworks</p>
					</Link>
				</ToggleGroupItem>
				<ToggleGroupItem value='artists'>
					<Link to='/search/artists' search={() => ({query: query})}>
						<p className='text-lg'>Artists</p>
					</Link>
				</ToggleGroupItem>
			</ToggleGroup>

			<div className='flex justify-center pt-8'>
				<Input
					className='md:w-[400px] lg:w-[800px] h-[50px]'
					type='text'
					onChange={(e) => handleChange(e.target.value)}
					value={search}
					placeholder='Search...'
				/>
			</div>
			<Outlet />
		</div>
	)
}
