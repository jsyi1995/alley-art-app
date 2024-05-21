import {Request, Response} from 'express'
import Router from 'express-promise-router'
import jwt from 'jsonwebtoken'
import {v4 as uuidv4} from 'uuid'
import sharp from 'sharp'
import path from 'path'
import multer from 'multer'
import {wrap, QueryOrder} from '@mikro-orm/postgresql'

import {DI} from '../server'

import {User, Artwork, Like, Follow} from '../entities'

interface CustomRequest extends Request {
	user?: User
}

const router = Router()

const fileFilter = (
	req: Request,
	file: Express.Multer.File,
	cb: multer.FileFilterCallback
) => {
	const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png']
	if (allowedFileTypes.includes(file.mimetype)) {
		cb(null, true)
	} else {
		cb(null, false)
	}
}

const storage = multer.memoryStorage()
const upload = multer({
	storage,
	fileFilter,
})

router.post('/sign-up', async (req: Request, res: Response) => {
	try {
		if (await DI.user.exists(req.body.email)) {
			throw new Error(
				'This email is already registered, maybe you want to sign in?'
			)
		}

		const user = DI.user.create(req.body)
		await DI.em.flush()

		const token = jwt.sign({id: user.id}, process.env.JWT_SECRET as string, {
			expiresIn: '7d',
		})

		res.json({user, token})
	} catch (e: any) {
		return res.status(400).json({message: e.message})
	}
})

router.post('/sign-in', async (req: Request, res: Response) => {
	try {
		const {email, password} = req.body as {
			email: string
			password: string
		}

		const user = await DI.user.login(email, password)
		const token = jwt.sign({id: user.id}, process.env.JWT_SECRET as string, {
			expiresIn: '7d',
		})

		res.json({user, token})
	} catch (e: any) {
		return res.status(400).json({message: e.message})
	}
})

router.delete('/delete-account', async (req: CustomRequest, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).send({error: 'Authentication failed.'})
		}

		const artworks = await DI.em.findAll(Artwork, {where: {user: req.user}})

		await DI.em.remove(artworks).flush()

		await DI.em.remove(req.user).flush()

		res.json({success: true})
	} catch (e: any) {
		return res.status(400).json({message: e.message})
	}
})

router.post('/change-password', async (req: CustomRequest, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).send({error: 'Authentication failed.'})
		}

		const {oldPassword, newPassword} = req.body as {
			oldPassword: string
			newPassword: string
		}

		const user = await DI.user.checkPassword(req.user.id, oldPassword)

		wrap(user).assign({password: newPassword})
		await DI.em.flush()

		res.json(user)
	} catch (e: any) {
		return res.status(400).json({message: e.message})
	}
})

router.get('/profile', async (req: CustomRequest, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).send({error: 'Authentication failed.'})
		}

		res.json(req.user)
	} catch (e: any) {
		return res.status(400).json({message: e.message})
	}
})

router.patch('/profile', async (req: CustomRequest, res: Response) => {
	if (!req.user) {
		return res.status(401).send({error: 'Authentication failed.'})
	}
	try {
		const user = req.user

		wrap(user).assign(req.body)
		await DI.em.flush()

		res.json(user)
	} catch (e: any) {
		return res.status(400).json({message: e.message})
	}
})

router.patch(
	'/profile/avatar',
	upload.single('avatar'),
	async (req: CustomRequest, res: Response) => {
		if (!req.user) {
			return res.status(401).send({error: 'Authentication failed.'})
		}
		try {
			const user = req.user

			if (req.file) {
				const avatar = uuidv4() + '-' + path.extname(req.file.originalname)

				await sharp(req.file.buffer)
					.resize(100, 100, {
						fit: 'cover',
						position: sharp.strategy.attention,
					})
					.toFile('uploads/avatars/' + 'avatar-' + avatar, (err) => {
						if (err) {
							return res.status(400).send({error: 'File upload failed.'})
						}
					})

				const em = DI.em.fork()

				await em
					.createQueryBuilder(User)
					.update({
						avatarUrl: `http://localhost:8080/avatars/avatar-${avatar}`,
						updatedAt: new Date(),
					})
					.where({
						id: user.id,
					})

				const result = await em.findOneOrFail(User, user.id)

				await em.flush()

				res.json(result)
			} else {
				return res.status(400).send({error: 'Missing file.'})
			}
		} catch (e: any) {
			return res.status(400).json({message: e.message})
		}
	}
)

router.get('/artist/:id', async (req: Request, res: Response) => {
	try {
		const params = req.params as {id: string}
		const user = await DI.user.findOne(+params.id)

		if (!user) {
			return res.status(404).json({message: 'User not found!'})
		}

		const totalFollowers = await DI.em.count(Follow, {
			usertwo: {
				id: +params.id,
			},
		})

		const totalFollowing = await DI.em.count(Follow, {
			userone: {
				id: +params.id,
			},
		})

		res.json({...user, totalFollowers, totalFollowing})
	} catch (e: any) {
		return res.status(400).json({message: e.message})
	}
})

router.get('/artist/:id/follow', async (req: CustomRequest, res: Response) => {
	if (!req.user) {
		return res.status(401).send({error: 'Authentication failed.'})
	}
	try {
		const params = req.params as {id: string}

		const user = await DI.user.findOne(+params.id)

		if (!user) {
			return res.status(404).json({message: 'User not found'})
		}

		const follow = await DI.em.findOne(Follow, {
			userone: req.user,
			usertwo: user,
		})

		if (!follow) {
			return res.json({following: false})
		}

		res.json({following: true})
	} catch (e: any) {
		return res.status(400).json({message: e.message})
	}
})

router.post('/artist/:id/follow', async (req: CustomRequest, res: Response) => {
	if (!req.user) {
		return res.status(401).send({error: 'Authentication failed.'})
	}
	try {
		const params = req.params as {id: string}

		const user = await DI.user.findOne(+params.id)

		if (!user) {
			return res.status(404).json({message: 'User not found'})
		}

		if (req.user.id === user.id) {
			return res.status(400).json({message: 'You cannot like yourself! :^)'})
		}

		const follow = await DI.em.findOne(Follow, {
			userone: req.user,
			usertwo: user,
		})

		if (follow) {
			return res.status(400).json({message: 'Follow already exists'})
		}

		DI.em.create(Follow, {userone: req.user, usertwo: user})

		await DI.em.flush()

		res.json({success: true})
	} catch (e: any) {
		return res.status(400).json({message: e.message})
	}
})

router.delete(
	'/artist/:id/follow',
	async (req: CustomRequest, res: Response) => {
		if (!req.user) {
			return res.status(401).send({error: 'Authentication failed.'})
		}
		try {
			const params = req.params as {id: string}

			const follow = await DI.em.findOne(Follow, {
				userone: req.user,
				usertwo: {
					id: +params.id,
				},
			})

			if (!follow) {
				return res.status(404).json({message: 'Follow not found'})
			}

			await DI.em.remove(follow).flush()

			res.json({success: true})
		} catch (e: any) {
			return res.status(400).json({message: e.message})
		}
	}
)

router.get('/artist/:id/gallery', async (req: Request, res: Response) => {
	try {
		const params = req.params as {id: string}

		const user = await DI.user.findOne(+params.id)

		if (!user) {
			return res.status(404).json({message: 'User not found!'})
		}

		const [artworks, count] = await DI.em.findAndCount(
			Artwork,
			{user},
			{
				populate: ['user'],
			}
		)

		res.json({artworks, totalCount: count})
	} catch (e: any) {
		return res.status(400).json({message: e.message})
	}
})

router.get('/artist/:id/likes', async (req: Request, res: Response) => {
	try {
		const params = req.params as {id: string}

		const user = await DI.user.findOne(+params.id)

		if (!user) {
			return res.status(404).json({message: 'User not found!'})
		}

		const [likes, count] = await DI.em.findAndCount(
			Like,
			{user},
			{
				populate: ['artwork', 'artwork.user'],
			}
		)

		res.json({likes, totalCount: count})
	} catch (e: any) {
		return res.status(400).json({message: e.message})
	}
})

router.get('/artist/:id/followers', async (req: Request, res: Response) => {
	try {
		const params = req.params as {id: string}

		const user = await DI.user.findOne(+params.id)

		if (!user) {
			return res.status(404).json({message: 'User not found!'})
		}

		const [followersArr, count] = await DI.em.findAndCount(
			Follow,
			{usertwo: user},
			{
				populate: ['userone', 'userone.artworks'],
			}
		)

		const followers = []

		for (let i = 0; i < followersArr.length; i++) {
			followers.push(followersArr[i].userone)
		}

		res.json({followers, totalCount: count})
	} catch (e: any) {
		return res.status(400).json({message: e.message})
	}
})

router.get('/artist/:id/following', async (req: Request, res: Response) => {
	try {
		const params = req.params as {id: string}

		const user = await DI.user.findOne(+params.id)

		if (!user) {
			return res.status(404).json({message: 'User not found!'})
		}

		const [followingArr, count] = await DI.em.findAndCount(
			Follow,
			{userone: user},
			{
				populate: ['usertwo', 'usertwo.artworks'],
			}
		)

		const following = []

		for (let i = 0; i < followingArr.length; i++) {
			following.push(followingArr[i].usertwo)
		}

		res.json({following, totalCount: count})
	} catch (e: any) {
		return res.status(400).json({message: e.message})
	}
})

router.get('/search', async (req: Request, res: Response) => {
	try {
		let {term, limit, offset} = req.query as {
			limit?: number
			offset?: number
			term?: string
		}

		if (!limit) {
			limit = 4
		}

		const [artists, count] = await DI.em.findAndCount(
			User,
			{
				displayName: {$ilike: `%${term}%`},
			},
			{
				populate: ['artworks'],
				orderBy: {createdAt: QueryOrder.DESC},
				limit,
				offset,
			}
		)

		const hasMore = artists.length === +limit

		res.json({artists, hasMore, totalCount: count})
	} catch (e: any) {
		return res.status(400).json({message: e.message})
	}
})

export const UserController = router
