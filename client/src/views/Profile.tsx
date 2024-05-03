import {useParams, Navigate} from '@tanstack/react-router'
import {Separator} from '@/components/ui/separator'
import {useGetArtistProfileQuery} from '../store/slices/AlleySlice'
import {ArtCard} from '@/components/ArtCard'
import format from '../util/format'

import logo from '/profileplaceholder.png'

function Gallery({artworks}) {
	if (artworks.length === 0)
		return (
			<div className='flex flex-col items-center text-3xl'>
				No artworks found
			</div>
		)

	return (
		<div className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-8 4xl:grid-cols-10 gap-1'>
			{artworks.map((pic) => (
				<ArtCard data={pic} key={pic.id} />
			))}
		</div>
	)
}

export function Profile() {
	const id = useParams({
		from: '/artist/$id',
		select: (params) => params.id,
	})
	const {data, error, isLoading} = useGetArtistProfileQuery(id, {
		refetchOnMountOrArgChange: true,
	})

	if (isLoading) return <div>Loading...</div>

	if (error) {
		if ('status' in error) {
			if (error.status === 404) {
				return <Navigate to='/404' replace={true} />
			}
		}
	}

	function artworksTitle() {
		switch (data.artworks.length) {
			case 0:
				return 'No artworks'
			case 1:
				return '1 artwork'
			default:
				return `${data.artworks.length} artworks`
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
				<p className='text-m'>{artworksTitle()}</p>
				<div className='pt-4 pr-4'>
					<Gallery artworks={data.artworks} />
				</div>
			</div>
			<div className='lg:block p-3'>
				<div className='flex flex-col items-center'>
					<img className='rounded-full w-1/2' src={data.avatarUrl || logo} />
					<p className='text-3xl font-bold pt-4'>{data.displayName}</p>
				</div>
				<Separator className='mt-6 mb-4' />
				{data.firstName && (
					<p className='text-lg font-bold'>
						{data.first_name} {data.last_name}
					</p>
				)}
				{data.description ? (
					<p className='text-m'>{data.description}</p>
				) : (
					<p className='text-m italic'>No description</p>
				)}
				<div className='flex pt-4'>
					<div>
						<p className='font-bold'>Followers</p>
						<p>{getRandomInt(1, 10000)}</p>
					</div>
					<div className='ml-5'>
						<p className='font-bold'>Following</p>
						<p>{getRandomInt(1, 1000)}</p>
					</div>
				</div>
				<Separator className='mt-6 mb-4' />
				<p className='text-sm'>Member since {format.toDate(data.createdAt)}</p>
			</div>
		</div>
	)
}
