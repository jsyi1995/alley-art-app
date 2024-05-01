import {useState} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {
	setCredentials,
	selectUserInfo,
	selectUserToken,
} from '../../store/slices/AuthSlice'
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

const formSchema = z.object({
	displayName: z.string().min(3, {
		message: 'Display name must be at least 3 characters.',
	}),
})

export function DisplayName() {
	const dispatch = useDispatch()
	const {toast} = useToast()
	const [isLoading, setIsLoading] = useState(false)
	const userToken = useSelector(selectUserToken)
	const userInfo = useSelector(selectUserInfo)

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			displayName: userInfo?.displayName,
		},
	})

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			setIsLoading(true)

			const formData = new FormData()

			formData.append('displayName', values.displayName)

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
				description: 'Your display name has been updated.',
			})
		} catch (error) {
			console.log(error)
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Display Name</CardTitle>
				<CardDescription>This is your public display name.</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
						<FormField
							control={form.control}
							name='displayName'
							render={({field}) => (
								<FormItem>
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
