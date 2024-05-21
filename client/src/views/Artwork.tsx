import {useParams, Link, Navigate} from '@tanstack/react-router'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {useSelector} from 'react-redux'
import {selectUserInfo} from '../store/slices/AuthSlice'
import {Separator} from '@/components/ui/separator'
import {FaThumbsUp} from 'react-icons/fa'
import {useGetPostQuery} from '../store/slices/AlleySlice'
import format from '../util/format'
import {DeleteArt} from './artwork/DeleteArt'
import {EditArt} from './artwork/EditArt'
import {LikeButton} from './artwork/LikeButton'
import {FollowButton} from '@/components/FollowButton'
import {Comments} from './artwork/Comments'

import logo from '/profileplaceholder.png'

export function Artwork() {
	const userInfo = useSelector(selectUserInfo)
	const id = useParams({
		from: '/post/$id',
		select: (params) => params.id,
	})
	const {data, error, isLoading, refetch} = useGetPostQuery(id)

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
				<div className='flex flex-col items-center pr-4 pb-4'>
					<img src={data.imageUrl} className='max-h-screen' />
				</div>
			</div>
			<div className='lg:block p-3'>
				<div className='flex items-center justify-between space-x-4'>
					<div className='flex items-center space-x-4'>
						<Avatar>
							<AvatarImage src={data.user.avatarUrl || logo} />
							<AvatarFallback>{data.user.displayName.charAt(0)}</AvatarFallback>
						</Avatar>
						<div>
							<p className='text-2xl font-medium leading-none'>
								<Link to='/artist/$id/gallery' params={{id: data.user.id}}>
									{data.user.displayName}
								</Link>
							</p>
						</div>
					</div>
				</div>
				<Separator className='mt-6 mb-4' />
				<p className='text-3xl font-bold'>{data.title}</p>
				<p className='text-lg'>{data.description}</p>
				<div className='flex flex-row pt-4'>
					<div className='flex items-center'>
						<FaThumbsUp className='mr-2 h-4 w-4' />
						<p className='text-lg'>{data.totalLikes}</p>
					</div>
				</div>
				<p className='text-sm'>Created {format.toDate(data.createdAt)}</p>
				{data.user.id === userInfo?.id ? (
					<div className='flex flex-row pt-4'>
						<EditArt data={data} refetch={refetch} />
						<div className='pl-3'>
							<DeleteArt artId={data.id} userId={userInfo?.id} />
						</div>
					</div>
				) : (
					<div className='flex flex-row pt-4'>
						<LikeButton id={data.id} />
						<div className='pl-3'>
							<FollowButton id={data.user.id} />
						</div>
					</div>
				)}
				<Separator className='mt-6 mb-4' />
				{data.tags.length > 0 && (
					<>
						<p className='text-lg'>Tags</p>
						<div className='pt-1'>
							{data.tags.map((tag) => (
								<span
									className='text-sm font-semibold inline-block py-1 px-2 rounded text-secondary-foreground bg-secondary last:mr-0 mr-1 mt-1'
									key={tag.id}
								>
									<Link
										to='/search/artworks'
										search={() => ({query: tag.name})}
									>
										{tag.name}
									</Link>
								</span>
							))}
						</div>
						<Separator className='mt-6 mb-4' />
					</>
				)}
				<Comments />
			</div>
		</div>
	)
}
