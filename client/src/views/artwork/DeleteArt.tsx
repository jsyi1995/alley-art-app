import {useState} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate} from '@tanstack/react-router'
import {selectUserToken} from '../../store/slices/AuthSlice'
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {Button} from '@/components/ui/button'
import {useToast} from '@/components/ui/use-toast'
import {FaSpinner} from 'react-icons/fa'

export function DeleteArt({artId, userId}) {
	const {toast} = useToast()
	const navigate = useNavigate()
	const [open, setOpen] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const userToken = useSelector(selectUserToken)

	const handleSubmit = async (e: React.FormEvent) => {
		try {
			e.preventDefault()
			setIsLoading(true)

			const res = await fetch(`http://localhost:8080/artwork/art/${artId}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${userToken}`,
				},
			})

			if (res.ok) {
				setIsLoading(false)
				toast({
					description: 'Deletion successful!',
				})
				setOpen(false)
				navigate({to: '/artist/$id', params: {id: userId}, replace: true})
			} else {
				throw res
			}
		} catch (error) {
			setIsLoading(false)
			toast({
				variant: 'destructive',
				title: 'Uh oh! Something went wrong.',
				description: 'There was a problem deleting your artwork.',
			})
		}
	}

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild>
				<Button variant='destructive'>Delete</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete Artwork</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently delete your
						artwork and comments.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<form onSubmit={handleSubmit}>
						<Button type='submit' disabled={isLoading} variant='destructive'>
							{isLoading && <FaSpinner className='mr-2 h-4 w-4 animate-spin' />}
							Delete
						</Button>
					</form>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
