import {useSelector} from 'react-redux'
import {
	useParams,
	Navigate,
	Outlet,
	Link,
	useRouterState,
} from '@tanstack/react-router'
import {Separator} from '@/components/ui/separator'
import {selectUserInfo} from '../store/slices/AuthSlice'
import {useGetArtistProfileQuery} from '../store/slices/AlleySlice'
import {FollowButton} from '@/components/FollowButton'
import format from '../util/format'
import {ToggleGroup, ToggleGroupItem} from '@/components/ui/toggle-group'

import logo from '/profileplaceholder.png'

export function Profile() {
	const userInfo = useSelector(selectUserInfo)
	const id = useParams({
		from: '/artist/$id',
		select: (params) => params.id,
	})
	const {data, error, isLoading} = useGetArtistProfileQuery(id)

	const location = useRouterState({
		select: (state) => state.location,
	})

	const path = location.pathname
	const lastItem = path.substring(path.lastIndexOf('/') + 1)

	if (isLoading) return <div>Loading...</div>

	if (error) {
		if ('status' in error) {
			if (error.status === 404) {
				return <Navigate to='/404' replace={true} />
			}
		}
	}

	return (
		<div className='grid lg:grid-cols-5 p-8 pt-6'>
			<div className='col-span-3 lg:col-span-4'>
				<ToggleGroup type='single' value={lastItem}>
					<ToggleGroupItem value='gallery'>
						<Link to='/artist/$id/gallery' params={{id: data.id}}>
							<p className='text-lg'>Portfolio</p>
						</Link>
					</ToggleGroupItem>
					<ToggleGroupItem value='likes'>
						<Link to='/artist/$id/likes' params={{id: data.id}}>
							<p className='text-lg'>Likes</p>
						</Link>
					</ToggleGroupItem>
					<ToggleGroupItem value='followers'>
						<Link to='/artist/$id/followers' params={{id: data.id}}>
							<p className='text-lg'>Followers</p>
						</Link>
					</ToggleGroupItem>
					<ToggleGroupItem value='following'>
						<Link to='/artist/$id/following' params={{id: data.id}}>
							<p className='text-lg'>Following</p>
						</Link>
					</ToggleGroupItem>
				</ToggleGroup>
				<Outlet />
			</div>
			<div className='lg:block p-3'>
				<div className='flex flex-col items-center'>
					<img className='rounded-full w-1/2' src={data.avatarUrl || logo} />
					<p className='text-3xl font-bold pt-4'>{data.displayName}</p>
				</div>
				<Separator className='mt-6 mb-4' />
				{userInfo?.id !== data.id && (
					<div className='flex flex-row pb-4'>
						<FollowButton id={data.id} />
					</div>
				)}
				{data.description ? (
					<p className='text-m'>{data.description}</p>
				) : (
					<p className='text-m italic'>No description</p>
				)}
				<div className='flex pt-4'>
					<div>
						<p className='font-bold'>Followers</p>
						<p>{data.totalFollowers}</p>
					</div>
					<div className='ml-5'>
						<p className='font-bold'>Following</p>
						<p>{data.totalFollowing}</p>
					</div>
				</div>
				<Separator className='mt-6 mb-4' />
				<p className='text-sm'>Member since {format.toDate(data.createdAt)}</p>
			</div>
		</div>
	)
}
