import {Link} from '@tanstack/react-router'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'

import logo from '/profileplaceholder.png'

export function ArtCard({data}) {
	return (
		<div className='relative'>
			<img src={data.thumbnailUrl} className='h-full w-full' />
			<Link to='/post/$id' params={{id: data.id}}>
				<div className='opacity-0 hover:opacity-100 duration-300 absolute inset-0 z-10 flex justify-start items-end'>
					<div className='bg-black/70 w-full p-2 overflow-hidden'>
						<div className='flex items-center justify-between space-x-4'>
							<div className='flex items-center space-x-2'>
								<Avatar>
									<AvatarImage src={data.user.avatarUrl || logo} />
									<AvatarFallback>
										{data.user.displayName.charAt(0)}
									</AvatarFallback>
								</Avatar>
								<div>
									<p className='text-lg font-medium truncate'>{data.title}</p>
									<p className='text-sm leading-none'>
										{data.user.displayName}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Link>
		</div>
	)
}
