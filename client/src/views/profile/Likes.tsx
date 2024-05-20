import {useParams} from '@tanstack/react-router'
import {useGetArtistProfileLikesQuery} from '../../store/slices/AlleySlice'
import {ArtCard} from '@/components/ArtCard'

export function Likes() {
	const id = useParams({
		from: '/artist/$id',
		select: (params) => params.id,
	})
	const {data, isLoading} = useGetArtistProfileLikesQuery(id, {
		refetchOnMountOrArgChange: true,
	})

	function likesTitle() {
		switch (data.totalCount) {
			case 0:
				return 'No likes'
			case 1:
				return '1 like'
			default:
				return `${data.totalCount} likes`
		}
	}

	if (isLoading) return <div>Loading...</div>

	return (
		<>
			<p className='text-m'>{likesTitle()}</p>
			<div className='pt-4 pr-4'>
				{data.totalCount === 0 ? (
					<div className='flex flex-col items-center text-3xl'>
						No likes found
					</div>
				) : (
					<div className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-8 4xl:grid-cols-10 gap-1'>
						{data.likes.map((pic) => (
							<ArtCard data={pic.artwork} key={pic.artwork.id} />
						))}
					</div>
				)}
			</div>
		</>
	)
}
