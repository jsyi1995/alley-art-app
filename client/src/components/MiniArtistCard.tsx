import {Link} from '@tanstack/react-router'
import {Card, CardContent} from '@/components/ui/card'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'

import logo from '/profileplaceholder.png'

export function MiniArtistCard({data}) {
	return (
		<Card>
			<CardContent>
				<div className='grid w-full items-center gap-4'>
					<div className='flex items-center justify-between space-x-4 pt-4'>
						<div className='flex items-center space-x-4'>
							<Avatar>
								<AvatarImage src={data.avatarUrl || logo} />
								<AvatarFallback>{data.displayName.charAt(0)}</AvatarFallback>
							</Avatar>
							<div>
								<p className='text-lg font-medium'>
									<Link to='/artist/$id/gallery' params={{id: data.id}}>
										{data.displayName}
									</Link>
								</p>
								<p className='text-sm'>{data.description}</p>
							</div>
						</div>
					</div>
					<div className='grid grid-cols-2 gap-1'>
						{data.artworks.slice(0, 2).map((pic) => (
							<div className='relative' key={pic.id}>
								<img src={pic.thumbnailUrl} className='h-full w-full' />
								<Link to='/post/$id' params={{id: pic.id}}>
									<div className='opacity-0 hover:opacity-100 duration-300 absolute inset-0 z-10 flex justify-start items-end'>
										<div className='bg-black/70 w-full p-2 overflow-hidden'>
											<div className='flex items-center justify-between space-x-4'>
												<div className='flex items-center space-x-2'>
													<div>
														<p className='text-sm truncate'>{pic.title}</p>
													</div>
												</div>
											</div>
										</div>
									</div>
								</Link>
							</div>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
