import {logout, selectUserInfo} from '@/store/slices/AuthSlice'
import {useDispatch, useSelector} from 'react-redux'
import {Link, useNavigate} from '@tanstack/react-router'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {Button} from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {useTheme} from './ThemeProvider'

import logo from '../../public/profileplaceholder.png'

export function UserNav() {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const {theme, setTheme} = useTheme()
	const userInfo = useSelector(selectUserInfo)

	const themeText = theme === 'dark' ? 'Light Mode' : 'Dark Mode'

	function handleLogout() {
		dispatch(logout())

		navigate({to: '/'})
	}

	if (!userInfo) {
		return null
	}

	let avatarUrl = logo

	if (userInfo.avatarUrl) {
		avatarUrl = userInfo.avatarUrl
	}

	const id = userInfo.id.toString()

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='ghost' className='relative h-8 w-8 rounded-full'>
					<Avatar className='h-8 w-8'>
						<AvatarImage src={avatarUrl} />
						<AvatarFallback>{userInfo.displayName.charAt(0)}</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className='w-56' align='end' forceMount>
				<DropdownMenuLabel className='font-normal'>
					<div className='flex flex-col space-y-1'>
						<p className='text-sm font-medium leading-none'>
							{userInfo.displayName}
						</p>
						<p className='text-xs leading-none text-muted-foreground'>
							{userInfo.email}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<Link to='/artist/$id' params={{id: id}}>
						<DropdownMenuItem>Profile</DropdownMenuItem>
					</Link>
					<Link to={'/upload'}>
						<DropdownMenuItem>Upload</DropdownMenuItem>
					</Link>
					<Link to={'/settings/account'}>
						<DropdownMenuItem>Settings</DropdownMenuItem>
					</Link>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={() => setTheme()}>
					{themeText}
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={() => handleLogout()}>
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
