import {useState} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {setCredentials, selectUserToken} from '../../store/slices/AuthSlice'
import {zodResolver} from '@hookform/resolvers/zod'
import {useForm} from 'react-hook-form'
import * as z from 'zod'
import {FaSpinner} from 'react-icons/fa'
import {Button} from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from '@/components/ui/form'
import {Input} from '@/components/ui/input'
import {useToast} from '@/components/ui/use-toast'

const MAX_FILE_SIZE = 4000000
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png']

const avatarSchema = z.object({
	avatar: z
		.any()
		.refine((files) => files?.length == 1, 'Image is required.')
		.refine((files) => files[0]?.size <= MAX_FILE_SIZE, `Max file size is 4MB.`)
		.refine(
			(files) => ACCEPTED_IMAGE_TYPES.includes(files[0]?.type),
			'.jpg, .jpeg, and .png files are accepted.'
		),
})

export function Avatar() {
	const dispatch = useDispatch()
	const {toast} = useToast()
	const [isLoading, setIsLoading] = useState(false)
	const userToken = useSelector(selectUserToken)

	const form = useForm<z.infer<typeof avatarSchema>>({
		resolver: zodResolver(avatarSchema),
		defaultValues: {
			avatar: undefined,
		},
	})

	const fileRef = form.register('avatar')

	async function onSubmit(values: z.infer<typeof avatarSchema>) {
		try {
			setIsLoading(true)
			const formData = new FormData()

			formData.append('avatar', values.avatar[0])

			const res = await fetch('http://localhost:8080/user/profile/avatar', {
				method: 'PUT',
				body: formData,
				headers: {
					Authorization: `Bearer ${userToken}`,
				},
			})

			const data = await res.json()

			dispatch(setCredentials(data))
			setIsLoading(false)
			toast({
				description: 'Your avatar has been updated.',
			})
		} catch (error) {
			console.log(error)
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Avatar</CardTitle>
				<CardDescription>
					Pick a photo up to 4MB. Your avatar photo will be public.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
						<FormField
							control={form.control}
							name='avatar'
							render={() => (
								<FormItem>
									<FormControl>
										<Input
											{...fileRef}
											disabled={isLoading}
											type='file'
											className='dark:file:text-foreground'
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type='submit' disabled={isLoading}>
							{isLoading && <FaSpinner className='mr-2 h-4 w-4 animate-spin' />}
							Save
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	)
}
