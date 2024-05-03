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
import {Textarea} from '@/components/ui/textarea'
import {useToast} from '@/components/ui/use-toast'

const formSchema = z.object({
	description: z.string(),
})

export function Description() {
	const dispatch = useDispatch()
	const {toast} = useToast()
	const [isLoading, setIsLoading] = useState(false)
	const userToken = useSelector(selectUserToken)
	const userInfo = useSelector(selectUserInfo)

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			description: userInfo?.description,
		},
	})

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			setIsLoading(true)

			const body = {
				description: values.description,
			}

			const res = await fetch('http://localhost:8080/user/profile', {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${userToken}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
			})

			if (res.ok) {
				const data = await res.json()

				dispatch(setCredentials(data))
				setIsLoading(false)
				toast({
					description: 'Your description has been updated.',
				})
			} else {
				throw res
			}
		} catch (error) {
			setIsLoading(false)
			toast({
				variant: 'destructive',
				title: 'Uh oh! Something went wrong.',
				description: 'There was a problem updating your description.',
			})
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Description</CardTitle>
				<CardDescription>This is your public description.</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
						<FormField
							control={form.control}
							name='description'
							render={({field}) => (
								<FormItem>
									<FormControl>
										<Textarea
											{...field}
											placeholder='Tell us a little bit about yourself'
											className='resize-none'
											disabled={isLoading}
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
