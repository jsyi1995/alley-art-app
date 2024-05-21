import {useNavigate} from '@tanstack/react-router'
import {useSelector} from 'react-redux'
import {selectUserToken} from '../../store/slices/AuthSlice'
import {useGetPostLikeQuery} from '../../store/slices/AlleySlice'
import {FaThumbsUp} from 'react-icons/fa'
import {Button} from '@/components/ui/button'
import {useToast} from '@/components/ui/use-toast'

export function LikeButton({id}) {
	const {toast} = useToast()
	const userToken = useSelector(selectUserToken)
	const navigate = useNavigate()

	const {data, refetch} = useGetPostLikeQuery(id)

	async function onLike() {
		if (!userToken) {
			navigate({to: '/login'})
			return
		}

		try {
			const res = await fetch(`http://localhost:8080/artwork/art/${id}/like`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${userToken}`,
					'Content-Type': 'application/json',
				},
			})

			if (res.ok) {
				refetch()
				toast({
					description: 'Liked!',
				})
			} else {
				throw res
			}
		} catch (error) {
			toast({
				variant: 'destructive',
				title: 'Uh oh! Something went wrong.',
				description: 'There was a problem liking that artwork.',
			})
		}
	}

	async function onUnlike() {
		try {
			const res = await fetch(`http://localhost:8080/artwork/art/${id}/like`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${userToken}`,
					'Content-Type': 'application/json',
				},
			})

			if (res.ok) {
				refetch()
				toast({
					description: 'Removed like!',
				})
			} else {
				throw res
			}
		} catch (error) {
			toast({
				variant: 'destructive',
				title: 'Uh oh! Something went wrong.',
				description: 'There was a problem unliking that artwork.',
			})
		}
	}

	return (
		<>
			{data && data.liked ? (
				<Button onClick={() => onUnlike()}>
					<FaThumbsUp className='mr-2 h-4 w-4' />
					Liked
				</Button>
			) : (
				<Button onClick={() => onLike()}>
					<FaThumbsUp className='mr-2 h-4 w-4' />
					Like
				</Button>
			)}
		</>
	)
}
