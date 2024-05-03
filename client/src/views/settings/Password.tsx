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
		oldPassword: z.string().min(12, {
			message: 'Password must be at least 12 characters.',
		}),
		newPassword: z.string().min(12, {
			message: 'Password must be at least 12 characters.',
		}),
		confirm: z.string(),
	})
	.refine((data) => data.newPassword === data.confirm, {
		message: 'Passwords do not match',
		path: ['confirm'],
	})
	.refine((data) => data.oldPassword !== data.newPassword, {
		message: 'Passwords are the same',
		path: ['newPassword'],
	})

export function Password() {
	const dispatch = useDispatch()
	const {toast} = useToast()
	const [isLoading, setIsLoading] = useState(false)
	const userToken = useSelector(selectUserToken)

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			oldPassword: '',
			newPassword: '',
			confirm: '',
		},
	})

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			setIsLoading(true)

			const body = {
				oldPassword: values.oldPassword,
				newPassword: values.newPassword,
			}

			const res = await fetch('http://localhost:8080/user/change-password', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${userToken}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
			})

			const data = await res.json()

			if (res.ok) {
				dispatch(setCredentials(data))
				setIsLoading(false)
				form.reset({oldPassword: '', newPassword: '', confirm: ''})
				toast({
					description: 'Your password has been updated.',
				})
			} else {
				throw data
			}
		} catch (error) {
			let message = 'There was a problem updating your password.'

			if (error.message) {
				message = error.message
			}

			setIsLoading(false)
			toast({
				variant: 'destructive',
				title: 'Uh oh! Something went wrong.',
				description: message,
			})
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Password</CardTitle>
				<CardDescription>Update the password for your account.</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
						<FormField
							control={form.control}
							name='oldPassword'
							render={({field}) => (
								<FormItem>
									<FormLabel>Old Password</FormLabel>
									<FormControl>
										<Input {...field} disabled={isLoading} type='password' />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='newPassword'
							render={({field}) => (
								<FormItem>
									<FormLabel>New Password</FormLabel>
									<FormControl>
										<Input {...field} disabled={isLoading} type='password' />
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
									<FormLabel>Confirm New Password</FormLabel>
									<FormControl>
										<Input {...field} disabled={isLoading} type='password' />
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
