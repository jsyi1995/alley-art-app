import {useParams, Link, Navigate} from '@tanstack/react-router'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {useSelector} from 'react-redux'
import {selectUserInfo} from '../store/slices/AuthSlice'
import {Separator} from '@/components/ui/separator'
import {FaEye, FaThumbsUp} from 'react-icons/fa'
import {useGetPostQuery} from '../store/slices/AlleySlice'
import format from '../util/format'
import {Comment} from '@/components/Comment'
import {CommentInput} from '@/components/CommentInput'

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

	function commentTitle() {
		switch (data.comments.length) {
			case 0:
				return 'Sign in to comment!'
			case 1:
				return '1 Comment'
			default:
				return `${data.comments.length} Comments`
		}
	}

	function getRandomInt(min, max) {
		const minCeiled = Math.ceil(min)
		const maxFloored = Math.floor(max)
		return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled)
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
							<AvatarImage src={data.user.avatarUrl} />
							<AvatarFallback>OM</AvatarFallback>
						</Avatar>
						<div>
							<p className='text-2xl font-medium leading-none'>
								<Link to='/artist/$id' params={{id: data.user.id}}>
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
						<FaEye className='mr-2 h-4 w-4' />
						<p className='text-lg'>{getRandomInt(1000, 10000)}</p>
					</div>
					<div className='flex items-center pl-5'>
						<FaThumbsUp className='mr-2 h-4 w-4' />
						<p className='text-lg'>{getRandomInt(1, 1000)}</p>
					</div>
				</div>
				<p className='text-sm'>Created {format.toDate(data.createdAt)}</p>
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
				<p className='text-lg'>{commentTitle()}</p>

				{data.comments.length > 0 && <Comment comments={data.comments} />}
				{userInfo && <CommentInput id={id} refetch={refetch} />}
			</div>
		</div>
	)
}
