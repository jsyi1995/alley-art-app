import {useState, useEffect} from 'react'
import {ToggleGroup, ToggleGroupItem} from '@/components/ui/toggle-group'
import {useGetGalleryQuery} from '../store/slices/AlleySlice'
import {ArtCard} from '@/components/ArtCard'

export function Home() {
	const [page, setPage] = useState(0)
	const [gallery, setGallery] = useState('featured')
	const {data, error, isLoading, isFetching} = useGetGalleryQuery({
		sort_by: gallery,
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

	function changeGallery(value) {
		setPage(0)
		setGallery(value)
	}

	return (
		<div className='p-8 pt-6'>
			<ToggleGroup
				type='single'
				value={gallery}
				onValueChange={(value) => {
					changeGallery(value)
				}}
			>
				<ToggleGroupItem value='featured'>
					<p className='text-lg'>Featured</p>
				</ToggleGroupItem>
				<ToggleGroupItem value='trending'>
					<p className='text-lg'>Trending</p>
				</ToggleGroupItem>
				<ToggleGroupItem value='latest'>
					<p className='text-lg'>Latest</p>
				</ToggleGroupItem>
			</ToggleGroup>
			<div className='pt-6'>
				{isLoading ? (
					<div>Loading...</div>
				) : error ? (
					<p className='italic'>There was a problem getting gallery results.</p>
				) : (
					<div className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-8 4xl:grid-cols-10 5xl:grid-cols-12 gap-1'>
						{data.artworks.map((pic) => (
							<ArtCard data={pic} key={pic.id} />
						))}
					</div>
				)}
			</div>
		</div>
	)
}
