import {useNavigate} from '@tanstack/react-router'
import {useSelector} from 'react-redux'
import {selectUserToken} from '../store/slices/AuthSlice'
import {useGetArtistFollowQuery} from '../store/slices/AlleySlice'
import {FaUserPlus} from 'react-icons/fa'
import {Button} from '@/components/ui/button'
import {useToast} from '@/components/ui/use-toast'

export function FollowButton({id}) {
	const {toast} = useToast()
	const userToken = useSelector(selectUserToken)
	const navigate = useNavigate()

	const {data, refetch} = useGetArtistFollowQuery(id)

	async function onFollow() {
		if (!userToken) {
			navigate({to: '/login'})
			return
		}

		try {
			const res = await fetch(
				`http://localhost:8080/user/artist/${id}/follow`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${userToken}`,
						'Content-Type': 'application/json',
					},
				}
			)

			if (res.ok) {
				refetch()
				toast({
					description: 'Followed!',
				})
			} else {
				throw res
			}
		} catch (error) {
			toast({
				variant: 'destructive',
				title: 'Uh oh! Something went wrong.',
				description: 'There was a problem following that artist.',
			})
		}
	}

	async function onUnfollow() {
		try {
			const res = await fetch(
				`http://localhost:8080/user/artist/${id}/follow`,
				{
					method: 'DELETE',
					headers: {
						Authorization: `Bearer ${userToken}`,
						'Content-Type': 'application/json',
					},
				}
			)

			if (res.ok) {
				refetch()
				toast({
					description: 'Unfollowed!',
				})
			} else {
				throw res
			}
		} catch (error) {
			toast({
				variant: 'destructive',
				title: 'Uh oh! Something went wrong.',
				description: 'There was a problem unfollowing that artist.',
			})
		}
	}

	return (
		<>
			{data && data.following ? (
				<Button onClick={() => onUnfollow()}>
					<FaUserPlus className='mr-2 h-4 w-4' />
					Following
				</Button>
			) : (
				<Button onClick={() => onFollow()}>
					<FaUserPlus className='mr-2 h-4 w-4' />
					Follow
				</Button>
			)}
		</>
	)
}
