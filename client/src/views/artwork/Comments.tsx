import {useParams} from '@tanstack/react-router'
import {useSelector} from 'react-redux'
import {selectUserInfo} from '../../store/slices/AuthSlice'
import {useGetPostCommentsQuery} from '../../store/slices/AlleySlice'
import {Comment} from '@/components/Comment'
import {CommentInput} from '@/components/CommentInput'

export function Comments() {
	const userInfo = useSelector(selectUserInfo)
	const id = useParams({
		from: '/post/$id',
		select: (params) => params.id,
	})
	const {data, isLoading, refetch} = useGetPostCommentsQuery(id)

	function commentTitle() {
		if (!userInfo && data.totalCount === 0) {
			return 'Sign in to comment!'
		}

		switch (data.totalCount) {
			case 0:
				return '0 Comments'
			case 1:
				return '1 Comment'
			default:
				return `${data.totalCount} Comments`
		}
	}

	if (isLoading) return <div>Loading...</div>

	return (
		<>
			<p className='text-lg'>{commentTitle()}</p>
			{data.totalCount > 0 && <Comment comments={data.comments} />}
			{userInfo && <CommentInput id={id} refetch={refetch} />}
		</>
	)
}
