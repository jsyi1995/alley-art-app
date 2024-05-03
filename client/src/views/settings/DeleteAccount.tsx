import {useState} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {useNavigate} from '@tanstack/react-router'
import {selectUserToken, logout} from '../../store/slices/AuthSlice'
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
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
	CardFooter,
} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {useToast} from '@/components/ui/use-toast'
import {FaSpinner} from 'react-icons/fa'

export function DeleteAccount() {
	const {toast} = useToast()
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const [open, setOpen] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const userToken = useSelector(selectUserToken)

	const handleSubmit = async (e: React.FormEvent) => {
		try {
			e.preventDefault()
			setIsLoading(true)

			const res = await fetch('http://localhost:8080/user/delete-account', {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${userToken}`,
				},
			})

			if (res.ok) {
				setIsLoading(false)
				setOpen(false)
				dispatch(logout())
				navigate({to: '/', replace: true})
			} else {
				throw res
			}
		} catch (error) {
			setIsLoading(false)
			toast({
				variant: 'destructive',
				title: 'Uh oh! Something went wrong.',
				description: 'There was a problem deleting your account.',
			})
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Delete Account</CardTitle>
				<CardDescription>Permanently delete your account.</CardDescription>
			</CardHeader>
			<CardFooter className='border-t px-6 py-4'>
				<AlertDialog open={open} onOpenChange={setOpen}>
					<AlertDialogTrigger asChild>
						<Button variant='destructive'>Delete</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Delete Artwork</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone. This will permanently delete your
								account and artworks.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<form onSubmit={handleSubmit}>
								<Button
									type='submit'
									disabled={isLoading}
									variant='destructive'
								>
									{isLoading && (
										<FaSpinner className='mr-2 h-4 w-4 animate-spin' />
									)}
									Delete
								</Button>
							</form>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</CardFooter>
		</Card>
	)
}
