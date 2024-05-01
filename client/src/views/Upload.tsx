import {useState} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import {selectUserInfo, selectUserToken} from '../store/slices/AuthSlice'
import {Tag, TagInput} from '@/components/tags/tag-input'
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
} from '@/components/ui/form'
import {Input} from '@/components/ui/input'
import {Textarea} from '@/components/ui/textarea'
import {useToast} from '@/components/ui/use-toast'

const MAX_FILE_SIZE = 5000000
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png']

const formSchema = z
	.object({
		title: z.string().min(1, {
			message: 'Display name is required.',
		}),
		description: z.string().min(1, {
			message: 'Description is required. Just type anything. :^)',
		}),
		artwork: z
			.any()
			.refine((files) => files?.length == 1, 'Image is required.')
			.refine(
				(files) => files[0]?.size <= MAX_FILE_SIZE,
				`Max file size is 20MB.`
			)
			.refine(
				(files) => ACCEPTED_IMAGE_TYPES.includes(files[0]?.type),
				'.jpg, .jpeg, and .png files are accepted.'
			),
		tags: z.array(
			z.object({
				id: z.string(),
				text: z.string(),
			})
		),
	})
	.refine(
		(data) => {
			if (data.tags.length > 0) {
				for (let i = 0; i < data.tags.length; i++) {
					if (data.tags[i].text.length > 20) return false
				}
			}
			return true
		},
		{
			message: 'One or more tags is too long.',
			path: ['tags'],
		}
	)

export function Upload() {
	const {toast} = useToast()
	const [isLoading, setIsLoading] = useState(false)
	const userInfo = useSelector(selectUserInfo)
	const userToken = useSelector(selectUserToken)

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: '',
			description: '',
			artwork: undefined,
			tags: [],
		},
	})

	const [tags, setTags] = useState<Tag[]>([])

	const {setValue} = form

	const fileRef = form.register('artwork', {required: true})

	const navigate = useNavigate()

	function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			setIsLoading(true)
			const formData = new FormData()

			formData.append('title', values.title)
			formData.append('description', values.description)
			formData.append('file', values.artwork[0])

			for (let i = 0; i < values.tags.length; i++) {
				formData.append('tags[]', values.tags[i].text)
			}

			fetch('http://localhost:8080/artwork/upload', {
				method: 'POST',
				body: formData,
				headers: {
					Authorization: `Bearer ${userToken}`,
				},
			})
				.then((res) => res.json())
				.then(() => {
					setIsLoading(false)
					navigate(`/artist/${userInfo?.id}`)
					toast({
						description: 'Upload successful!',
					})
				})
		} catch (error) {
			console.log(error)
		}
	}

	return (
		<div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] pt-6'>
			<div className='flex flex-col space-y-2 text-center'>
				<h1 className='text-2xl font-semibold tracking-tight'>Upload</h1>
			</div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
					<FormField
						control={form.control}
						name='artwork'
						render={() => (
							<FormItem>
								<FormLabel>Artwork</FormLabel>
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
					<FormField
						control={form.control}
						name='title'
						render={({field}) => (
							<FormItem>
								<FormLabel>Title</FormLabel>
								<FormControl>
									<Input {...field} disabled={isLoading} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name='description'
						render={({field}) => (
							<FormItem>
								<FormLabel>Description</FormLabel>
								<FormControl>
									<Textarea
										{...field}
										placeholder='Enter artwork description'
										className='resize-none'
										disabled={isLoading}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name='tags'
						render={({field}) => (
							<FormItem>
								<FormLabel>Tags</FormLabel>
								<FormControl>
									<TagInput
										{...field}
										placeholder='Enter tags'
										tags={tags}
										setTags={(newTags) => {
											setTags(newTags)
											setValue('tags', newTags as [Tag, ...Tag[]])
										}}
									/>
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
		</div>
	)
}
