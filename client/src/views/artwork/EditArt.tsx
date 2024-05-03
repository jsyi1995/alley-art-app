import {useState} from 'react'
import {useSelector} from 'react-redux'
import {selectUserToken} from '../../store/slices/AuthSlice'
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
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

const formSchema = z
	.object({
		title: z.string().min(1, {
			message: 'Display name is required.',
		}),
		description: z.string().min(1, {
			message: 'Description is required. Just type anything. :^)',
		}),
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

export function EditArt({data, refetch}) {
	const {toast} = useToast()
	const [isLoading, setIsLoading] = useState(false)
	const [open, setOpen] = useState(false)
	const userToken = useSelector(selectUserToken)

	const tagArr = data.tags.map((tag) => {
		return {
			id: tag.id.toString(),
			text: tag.name,
		}
	})

	const [tags, setTags] = useState<Tag[]>(tagArr)

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: data.title,
			description: data.description,
			tags: tags,
		},
	})

	const {setValue} = form

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			setIsLoading(true)

			const body = {
				title: values.title,
				description: values.description,
			}

			if (values.tags.length > 0) {
				const tagArr: string[] = []

				for (let i = 0; i < values.tags.length; i++) {
					tagArr.push(values.tags[i].text)
				}

				body['tags'] = tagArr
			}

			const res = await fetch(`http://localhost:8080/artwork/art/${data.id}`, {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${userToken}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
			})

			if (res.ok) {
				setIsLoading(false)
				setOpen(false)
				refetch()
				toast({
					description: 'Update successful!',
				})
			} else {
				throw res
			}
		} catch (error) {
			setIsLoading(false)
			toast({
				variant: 'destructive',
				title: 'Uh oh! Something went wrong.',
				description: 'There was a problem updating your artwork.',
			})
		}
	}

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild>
				<Button>Edit</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Edit Artwork</AlertDialogTitle>
				</AlertDialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
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
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<Button type='submit' disabled={isLoading}>
								{isLoading && (
									<FaSpinner className='mr-2 h-4 w-4 animate-spin' />
								)}
								Update
							</Button>
						</AlertDialogFooter>
					</form>
				</Form>
			</AlertDialogContent>
		</AlertDialog>
	)
}
