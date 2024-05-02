import {Link} from '@tanstack/react-router'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {Separator} from '@/components/ui/separator'
import {ScrollArea} from '@/components/ui/scroll-area'

import logo from '../assets/profileplaceholder.png'

function CommentItem({data, isNotLast}) {
	return (
		<div className='pr-3 pl-1'>
			<div className='grid w-full items-center gap-2'>
				<div className='flex items-center justify-between space-x-4 pt-4'>
					<div className='flex items-center space-x-4'>
						<Avatar>
							<AvatarImage
								src={data.user.avatarUrl ? data.user.avatarUrl : logo}
							/>
							<AvatarFallback>OM</AvatarFallback>
						</Avatar>
						<div>
							<p className='text-sm font-medium'>
								<Link to='/artist/$id' params={{id: data.user.id}}>
									{data.user.displayName}
								</Link>
							</p>
							<p className='text-xs'>{data.user.description}</p>
						</div>
					</div>
				</div>
				<p className='text-sm'>{data.text}</p>
				{isNotLast && <Separator className='mt-2' />}
			</div>
		</div>
	)
}

export function Comment({comments}) {
	return (
		<div className='pt-1'>
			{comments.length > 3 ? (
				<ScrollArea className='h-96'>
					{comments.map((comment, index) => (
						<CommentItem
							data={comment}
							isNotLast={index !== comments.length - 1}
							key={comment.id}
						/>
					))}
				</ScrollArea>
			) : (
				<>
					{comments.map((comment, index) => (
						<CommentItem
							data={comment}
							isNotLast={index !== comments.length - 1}
							key={comment.id}
						/>
					))}
				</>
			)}
		</div>
	)
}
