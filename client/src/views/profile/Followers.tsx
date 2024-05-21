import {useParams} from '@tanstack/react-router'
import {useGetArtistFollowersQuery} from '../../store/slices/AlleySlice'
import {MiniArtistCard} from '@/components/MiniArtistCard'

export function Followers() {
	const id = useParams({
		from: '/artist/$id',
		select: (params) => params.id,
	})
	const {data, isLoading} = useGetArtistFollowersQuery(id, {
		refetchOnMountOrArgChange: true,
	})

	function followersTitle() {
		switch (data.totalCount) {
			case 0:
				return 'No followers'
			case 1:
				return '1 follower'
			default:
				return `${data.totalCount} followers`
		}
	}

	if (isLoading) return <div>Loading...</div>

	return (
		<>
			<p className='text-m'>{followersTitle()}</p>
			<div className='pt-4 pr-4'>
				{data.totalCount === 0 ? (
					<div className='flex flex-col items-center text-3xl'>
						No followers found
					</div>
				) : (
					<div className='grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 gap-3'>
						{data.followers.map((user) => (
							<MiniArtistCard data={user} key={user.id} />
						))}
					</div>
				)}
			</div>
		</>
	)
}
