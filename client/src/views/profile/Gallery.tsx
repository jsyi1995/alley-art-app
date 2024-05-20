import {useParams} from '@tanstack/react-router'
import {useGetArtistProfileGalleryQuery} from '../../store/slices/AlleySlice'
import {ArtCard} from '@/components/ArtCard'

export function Gallery() {
	const id = useParams({
		from: '/artist/$id',
		select: (params) => params.id,
	})
	const {data, isLoading} = useGetArtistProfileGalleryQuery(id, {
		refetchOnMountOrArgChange: true,
	})

	function artworksTitle() {
		switch (data.totalCount) {
			case 0:
				return 'No artworks'
			case 1:
				return '1 artwork'
			default:
				return `${data.totalCount} artworks`
		}
	}

	if (isLoading) return <div>Loading...</div>

	return (
		<>
			<p className='text-m'>{artworksTitle()}</p>
			<div className='pt-4 pr-4'>
				{data.totalCount === 0 ? (
					<div className='flex flex-col items-center text-3xl'>
						No artworks found
					</div>
				) : (
					<div className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-8 4xl:grid-cols-10 gap-1'>
						{data.artworks.map((pic) => (
							<ArtCard data={pic} key={pic.id} />
						))}
					</div>
				)}
			</div>
		</>
	)
}
