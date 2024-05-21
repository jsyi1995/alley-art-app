import {useParams} from '@tanstack/react-router'
import {useGetArtistFollowingQuery} from '../../store/slices/AlleySlice'
import {MiniArtistCard} from '@/components/MiniArtistCard'

export function Following() {
	const id = useParams({
		from: '/artist/$id',
		select: (params) => params.id,
	})
	const {data, isLoading} = useGetArtistFollowingQuery(id, {
		refetchOnMountOrArgChange: true,
	})

	function followingTitle() {
		switch (data.totalCount) {
			case 0:
				return 'No following'
			default:
				return `${data.totalCount} following`
		}
	}

	if (isLoading) return <div>Loading...</div>

	return (
		<>
			<p className='text-m'>{followingTitle()}</p>
			<div className='pt-4 pr-4'>
				{data.totalCount === 0 ? (
					<div className='flex flex-col items-center text-3xl'>
						No following found
					</div>
				) : (
					<div className='grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 gap-3'>
						{data.following.map((user) => (
							<MiniArtistCard data={user} key={user.id} />
						))}
					</div>
				)}
			</div>
		</>
	)
}
