import {useState} from 'react'
import {useNavigate} from '@tanstack/react-router'
import {Input} from '@/components/ui/input'

export function SearchInput() {
	const [search, setSearch] = useState('')
	const navigate = useNavigate()

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		setSearch('')
		navigate({to: '/search/artworks', search: () => ({query: search})})
	}

	return (
		<form onSubmit={handleSubmit}>
			<Input
				type='search'
				placeholder='Search...'
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				className='md:w-[100px] lg:w-[300px]'
			/>
		</form>
	)
}
