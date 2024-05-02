import {useState, useEffect} from 'react'
import {useSearch, Link} from '@tanstack/react-router'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {Card, CardContent, CardFooter} from '@/components/ui/card'
import {useGetArtistsQuery} from '../../store/slices/AlleySlice'
import format from '../../util/format'

import logo from '../../assets/profileplaceholder.png'

export function Artists() {
	const [page, setPage] = useState(0)
	const query = useSearch({
		from: '/search/artists',
		select: (search) => search.query,
	})

	const {data, error, isLoading, isFetching} = useGetArtistsQuery({
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

	if (isLoading) return <div className='text-center pt-4'>Loading...</div>

	if (isFetching && page === 0)
		return <div className='text-center pt-4'>Loading...</div>

	if (error) {
		if ('message' in error) {
			if (error.message === 'param is required') {
				return (
					<div className='text-center pt-4'>Please enter a search term</div>
				)
			}
		}
		return <div className='text-center pt-4'>Error!</div>
	}

	if (data.count === 0)
		return <div className='text-center pt-4'>No search results found!</div>

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
				{data.artists.map((data) => (
					<div className='pb-4' key={data.id}>
						<Card>
							<CardContent>
								<div className='grid w-full items-center gap-4'>
									<div className='flex items-center justify-between space-x-4 pt-4'>
										<div className='flex items-center space-x-4'>
											<Avatar>
												<AvatarImage
													src={data.avatarUrl ? data.avatarUrl : logo}
												/>
												<AvatarFallback>OM</AvatarFallback>
											</Avatar>
											<div>
												<p className='text-lg font-medium'>
													<Link to='/artist/$id' params={{id: data.id}}>
														{data.displayName}
													</Link>
												</p>
												<p className='text-sm'>{data.description}</p>
											</div>
										</div>
									</div>
									<div className='grid sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-1'>
										{data.artworks.slice(0, 8).map((pic) => (
											<div className='relative' key={pic.id}>
												<img src={pic.thumbnailUrl} className='h-full w-full' />
												<Link to='/post/$id' params={{id: pic.id}}>
													<div className='opacity-0 hover:opacity-100 duration-300 absolute inset-0 z-10 flex justify-start items-end'>
														<div className='bg-black/70 w-full p-2 overflow-hidden'>
															<div className='flex items-center justify-between space-x-4'>
																<div className='flex items-center space-x-2'>
																	<div>
																		<p className='text-sm truncate'>
																			{pic.title}
																		</p>
																	</div>
																</div>
															</div>
														</div>
													</div>
												</Link>
											</div>
										))}
									</div>
								</div>
							</CardContent>
							<CardFooter className='flex justify-between'>
								<p className='is-size-7'>
									Member since {format.toDate(data.createdAt)}
								</p>
							</CardFooter>
						</Card>
					</div>
				))}
			</div>
		</div>
	)
}
