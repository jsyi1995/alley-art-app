import {useState, useEffect} from 'react'
import {useSearchParams} from 'react-router-dom'
import {useGetSearchQuery} from '../../store/slices/AlleySlice'
import {ArtCard} from '@/components/ArtCard'

export function Artworks() {
	const [page, setPage] = useState(0)
	const [searchParams] = useSearchParams()
	const query = searchParams.get('query')
	const {data, error, isLoading, isFetching} = useGetSearchQuery({
		params: query,
		page,
	})

	useEffect(() => {
		const onScroll = () => {
			const scrolledToBottom =
				window.innerHeight + window.scrollY >= document.body.offsetHeight
			if (data !== undefined) {
				if (scrolledToBottom && !isFetching && data.hasMore) {
					setPage(page + 1)
				}
			}
		}
		document.addEventListener('scroll', onScroll)

		return function () {
			document.removeEventListener('scroll', onScroll)
		}
	}, [page, isFetching, data])

	useEffect(() => {
		setPage(0)
	}, [query])

	if (isLoading) return <div className='text-center'>Loading...</div>

	if (isFetching && page === 0)
		return <div className='text-center'>Loading...</div>

	if (error) {
		if ('message' in error) {
			if (error.message === 'param is required') {
				return <div className='text-center'>Please enter a search term</div>
			}
		}
		return <div className='text-center'>Error!</div>
	}

	if (data.count === 0)
		return <div className='text-center'>No search results found!</div>

	function searchResultsTitle() {
		switch (data.totalCount) {
			case 1:
				return '1 results'
			default:
				return `${data.totalCount} results`
		}
	}

	return (
		<div className='pt-4'>
			<p className='text-m'>{searchResultsTitle()}</p>
			<div className='pt-4'>
				<div className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-8 4xl:grid-cols-10 5xl:grid-cols-12 gap-2'>
					{data.artworks.map((pic) => (
						<ArtCard data={pic} key={pic.id} />
					))}
				</div>
			</div>
		</div>
	)
}
