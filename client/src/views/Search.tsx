import {useState, useEffect} from 'react'
import {useSearchParams, Outlet, useLocation, Link} from 'react-router-dom'
import {ToggleGroup, ToggleGroupItem} from '@/components/ui/toggle-group'
import {Input} from '@/components/ui/input'

export function Search() {
	const [search, setSearch] = useState('')
	const [searchParams, setSearchParams] = useSearchParams()
	const query = searchParams.get('query')
	const location = useLocation()
	const path = location.pathname
	const lastItem = path.substring(path.lastIndexOf('/') + 1)

	useEffect(() => {
		if (query) setSearch(query)
	}, [query])

	const handleChange = (term: string) => {
		setSearch(term)

		if (term.length > 0) {
			setSearchParams({query: term})
		} else {
			setSearchParams()
		}
	}

	return (
		<div className='p-8 pt-6'>
			<ToggleGroup type='single' value={lastItem}>
				<ToggleGroupItem value='artworks'>
					<Link
						to={query ? `/search/artworks?query=${query}` : `/search/artworks`}
					>
						<p className='text-lg'>Artworks</p>
					</Link>
				</ToggleGroupItem>
				<ToggleGroupItem value='artists'>
					<Link
						to={query ? `/search/artists?query=${query}` : `/search/artists`}
					>
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
