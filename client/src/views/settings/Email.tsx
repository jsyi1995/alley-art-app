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
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import {Input} from '@/components/ui/input'
import {useToast} from '@/components/ui/use-toast'

const formSchema = z
	.object({
		email: z.string().email({
			message: 'Invalid email address',
		}),
		confirm: z.string(),
	})
	.refine((data) => data.email === data.confirm, {
		message: 'Emails do not match',
		path: ['confirm'],
	})

export function Email() {
	const dispatch = useDispatch()
	const {toast} = useToast()
	const [isLoading, setIsLoading] = useState(false)
	const userToken = useSelector(selectUserToken)

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: '',
			confirm: '',
		},
	})

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			setIsLoading(true)

			const formData = new FormData()

			formData.append('email', values.email)

			const res = await fetch('http://localhost:8080/user/profile', {
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
				description: 'Your email has been updated.',
			})
		} catch (error) {
			console.log(error)
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Email</CardTitle>
				<CardDescription>
					Update the email you use for your account.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
						<FormField
							control={form.control}
							name='email'
							render={({field}) => (
								<FormItem>
									<FormLabel>New Email</FormLabel>
									<FormControl>
										<Input {...field} disabled={isLoading} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='confirm'
							render={({field}) => (
								<FormItem>
									<FormLabel>Confirm New Email</FormLabel>
									<FormControl>
										<Input {...field} disabled={isLoading} />
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
