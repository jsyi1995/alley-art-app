import {useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {useNavigate, useLocation} from 'react-router-dom'
import type {AppDispatch} from '../store'
import {selectUserInfo, selectIsAuthLoading} from '../store/slices/AuthSlice'
import {userLogin} from '@/store/slices/AuthSlice'
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
} from '@/components/ui/form'
import {Input} from '@/components/ui/input'

const formSchema = z.object({
	email: z.string(),
	password: z.string(),
})

export function Login() {
	const dispatch = useDispatch<AppDispatch>()
	const isLoading = useSelector(selectIsAuthLoading)
	const userInfo = useSelector(selectUserInfo)
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	})

	const navigate = useNavigate()
	const location = useLocation()

	const from = location.state?.from?.pathname || '/'

	//Redirect if logged in
	useEffect(() => {
		if (userInfo) {
			navigate(from, {replace: true})
		}
	}, [navigate, userInfo, from])

	function onSubmit(values: z.infer<typeof formSchema>) {
		dispatch(
			userLogin({
				email: values.email,
				password: values.password,
			})
		)
	}

	return (
		<div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] pt-6'>
			<div className='flex flex-col space-y-2 text-center'>
				<h1 className='text-2xl font-semibold tracking-tight'>Sign In</h1>
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
									<Input {...field} disabled={isLoading} />
								</FormControl>
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
							</FormItem>
						)}
					/>
					<Button type='submit' className='w-full' disabled={isLoading}>
						{isLoading && <FaSpinner className='mr-2 h-4 w-4 animate-spin' />}
						Login
					</Button>
				</form>
			</Form>
		</div>
	)
}
