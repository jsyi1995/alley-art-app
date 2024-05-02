import {useSelector, useDispatch} from 'react-redux'
import {useNavigate} from '@tanstack/react-router'
import type {AppDispatch} from '../store'
import {selectIsAuthLoading} from '../store/slices/AuthSlice'
import {userRegister} from '@/store/slices/AuthSlice'
import {zodResolver} from '@hookform/resolvers/zod'
import {useForm} from 'react-hook-form'
import * as z from 'zod'
import {FaSpinner} from 'react-icons/fa'
import {Button} from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	FormDescription,
} from '@/components/ui/form'
import {Input} from '@/components/ui/input'

const formSchema = z
	.object({
		email: z.string().email({
			message: 'Invalid email address',
		}),
		displayName: z.string().min(3, {
			message: 'Display name must be at least 3 characters.',
		}),
		password: z.string().min(12, {
			message: 'Password must be at least 12 characters.',
		}),
		confirm: z.string(),
	})
	.refine((data) => data.password === data.confirm, {
		message: 'Passwords do not match',
		path: ['confirm'],
	})

export function Register() {
	const dispatch = useDispatch<AppDispatch>()
	const navigate = useNavigate()
	const isLoading = useSelector(selectIsAuthLoading)

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: '',
			displayName: '',
			password: '',
			confirm: '',
		},
	})

	async function onSubmit(values: z.infer<typeof formSchema>) {
		await dispatch(
			userRegister({
				email: values.email,
				displayName: values.displayName,
				password: values.password,
			})
		).unwrap()

		navigate({to: '/'})
	}

	return (
		<div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] pt-6'>
			<div className='flex flex-col space-y-2 text-center'>
				<h1 className='text-2xl font-semibold tracking-tight'>
					Create an account
				</h1>
			</div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
					<FormField
						control={form.control}
						name='email'
						render={({field}) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input
										{...field}
										placeholder='name@example.com'
										disabled={isLoading}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name='displayName'
						render={({field}) => (
							<FormItem>
								<FormLabel>Display Name</FormLabel>
								<FormControl>
									<Input {...field} disabled={isLoading} />
								</FormControl>
								<FormDescription>
									This is your public display name.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name='password'
						render={({field}) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
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
								<FormLabel>Confirm Password</FormLabel>
								<FormControl>
									<Input {...field} disabled={isLoading} type='password' />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type='submit' className='w-full' disabled={isLoading}>
						{isLoading && <FaSpinner className='mr-2 h-4 w-4 animate-spin' />}
						Submit
					</Button>
				</form>
			</Form>
			<p className='px-8 text-center text-sm text-muted-foreground'>
				By clicking continue, you agree to our{' '}
				<span className='underline underline-offset-4 hover:text-primary'>
					Terms of Service
				</span>{' '}
				and{' '}
				<span className='underline underline-offset-4 hover:text-primary'>
					Privacy Policy
				</span>
				.
			</p>
		</div>
	)
}
