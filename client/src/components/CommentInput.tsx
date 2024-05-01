import {useState} from 'react'
import {useSelector} from 'react-redux'
import {selectUserToken} from '../store/slices/AuthSlice'
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
	FormMessage,
} from '@/components/ui/form'
import {Textarea} from '@/components/ui/textarea'
import {CornerDownLeft} from 'lucide-react'
import {useToast} from '@/components/ui/use-toast'

const formSchema = z.object({
	comment: z
		.string()
		.max(200, {
			message: 'Comment is too long.',
		})
		.min(1, {
			message: 'Please insert text.',
		}),
})

export function CommentInput({id, refetch}) {
	const {toast} = useToast()
	const [isLoading, setIsLoading] = useState(false)
	const [textCount, setTextCount] = useState(0)
	const userToken = useSelector(selectUserToken)

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			comment: '',
		},
	})

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			setIsLoading(true)

			const obj = {
				id,
				text: values.comment,
			}

			await fetch(`http://localhost:8080/artwork/art/${id}/comment`, {
				method: 'POST',
				body: JSON.stringify(obj),
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${userToken}`,
				},
			})

			form.reset({comment: ''})
			setTextCount(0)
			setIsLoading(false)
			refetch()
			toast({
				description: 'Comment sent!',
			})
		} catch (error) {
			console.log(error)
		}
	}

	return (
		<div className='pt-4'>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className='relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring'
				>
					<FormField
						control={form.control}
						name='comment'
						render={({field}) => (
							<FormItem>
								<FormControl>
									<Textarea
										{...field}
										placeholder='Type your comment here...'
										className='min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0'
										disabled={isLoading}
										onChangeCapture={(e) =>
											setTextCount(e.currentTarget.value.length)
										}
									/>
								</FormControl>
								<FormMessage className='min-h-12 p-3' />
							</FormItem>
						)}
					/>
					<div className='flex items-center p-3 pt-0'>
						<span className='text-sm'>{textCount}/200</span>
						<Button
							size='sm'
							className='ml-auto gap-1.5'
							disabled={isLoading}
							type='submit'
						>
							{isLoading && <FaSpinner className='mr-2 h-4 w-4 animate-spin' />}
							Send
							<CornerDownLeft className='size-3.5' />
						</Button>
					</div>
				</form>
			</Form>
		</div>
	)
}
