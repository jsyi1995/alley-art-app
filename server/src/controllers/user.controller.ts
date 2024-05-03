import {Request, Response} from 'express'
import Router from 'express-promise-router'
import jwt from 'jsonwebtoken'
import {v4 as uuidv4} from 'uuid'
import sharp from 'sharp'
import path from 'path'
import multer from 'multer'
import {wrap, QueryOrder} from '@mikro-orm/postgresql'

import {DI} from '../server'

import {User} from '../entities'

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

router.put('/profile', async (req: CustomRequest, res: Response) => {
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

router.put(
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
		const user = await DI.user.findOne(+params.id, {
			populate: ['artworks', 'artworks.user'],
		})

		if (!user) {
			return res.status(404).json({message: 'User not found!'})
		}

		res.json(user)
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
