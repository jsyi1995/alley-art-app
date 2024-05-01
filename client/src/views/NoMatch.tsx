import {Link} from 'react-router-dom'

export function NoMatch() {
	return (
		<div className='w-full lg:grid lg:min-h-[600px] xl:min-h-[800px]'>
			<div className='flex items-center justify-center py-12'>
				<div className='mx-auto grid w-[350px] gap-6'>
					<div className='grid gap-2 text-center'>
						<h1 className='text-6xl font-bold'>404</h1>
						<p className='text-balance text-muted-foreground'>
							<Link to={`/`}>Return Home</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
