import {Request, Response} from 'express'
import Router from 'express-promise-router'
import {QueryOrder, wrap} from '@mikro-orm/postgresql'
import {v4 as uuidv4} from 'uuid'
import sharp from 'sharp'
import path from 'path'
import multer from 'multer'
import {DI} from '../server'
import {Artwork, Comment, Tag, User, Like} from '../entities'

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

router.get('/gallery', async (req: Request, res: Response) => {
	try {
		let {limit, offset, sort_by} = req.query as {
			limit?: number
			offset?: number
			sort_by?: string
		}

		if (!limit) {
			limit = 60
		}

		let orderBy

		switch (sort_by) {
			case 'latest':
				orderBy = {createdAt: QueryOrder.DESC}
				break
			case 'trending':
				orderBy = {title: QueryOrder.DESC}
				break
			case 'featured':
				orderBy = {title: QueryOrder.ASC}
				break
			default:
				return res.status(400).json({message: 'Invalid sort_by'})
		}

		const artworks = await DI.artworks.findAll({
			populate: ['user'],
			orderBy,
			limit,
			offset,
		})

		const hasMore = artworks.length === +limit

		res.json({artworks, hasMore})
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
			limit = 60
		}

		const [artworks, count] = await DI.em.findAndCount(
			Artwork,
			{
				$or: [
					{title: {$ilike: `%${term}%`}},
					{tags: {name: {$ilike: `%${term}%`}}},
				],
			},
			{
				populate: ['user', 'tags'],
				orderBy: {createdAt: QueryOrder.DESC},
				limit,
				offset,
			}
		)

		const hasMore = artworks.length === +limit

		res.json({artworks, hasMore, totalCount: count})
	} catch (e: any) {
		return res.status(400).json({message: e.message})
	}
})

router.get('/art/:id', async (req: Request, res: Response) => {
	try {
		const params = req.params as {id: string}

		const art = await DI.artworks.findOne(+params.id, {
			populate: ['tags', 'user'],
		})

		if (!art) {
			return res.status(404).json({message: 'Artwork not found'})
		}

		const totalLikes = await DI.em.count(Like, {
			artwork: {
				id: +params.id,
			},
		})

		res.json({...art, totalLikes})
	} catch (e: any) {
		return res.status(400).json({message: e.message})
	}
})

router.patch('/art/:id', async (req: CustomRequest, res: Response) => {
	if (!req.user) {
		return res.status(401).send({error: 'Authentication failed.'})
	}
	try {
		const params = req.params as {id: string}

		const {title, description, tags} = req.body as {
			title: string
			description: string
			tags: string[]
		}

		const art = await DI.artworks.findOne(+params.id, {
			populate: ['user'],
		})

		if (!art) {
			return res.status(404).json({message: 'Artwork not found'})
		}

		if (req.user.id !== art.user.id) {
			return res
				.status(404)
				.json({message: 'You are not the user of this artwork!'})
		}

		wrap(art).assign({title, description})

		if (tags) {
			const tagArr = []

			for (let i = 0; i < tags.length; i++) {
				const t = await DI.em.create(Tag, {name: tags[i]})

				tagArr.push(t)
			}

			if (tagArr.length > 0) {
				art.tags.set(tagArr)
			}
		}

		await DI.em.flush()

		res.json(art)
	} catch (e: any) {
		return res.status(400).json({message: e.message})
	}
})

router.delete('/art/:id', async (req: CustomRequest, res: Response) => {
	if (!req.user) {
		return res.status(401).send({error: 'Authentication failed.'})
	}
	try {
		const params = req.params as {id: string}

		const art = await DI.artworks.findOne(+params.id)

		if (!art) {
			return res.status(404).json({message: 'Artwork not found'})
		}

		if (req.user.id !== art.user.id) {
			return res
				.status(404)
				.json({message: 'You are not the user of this artwork!'})
		}

		await DI.em.remove(art).flush()

		res.json({success: true})
	} catch (e: any) {
		return res.status(400).json({message: e.message})
	}
})

router.get('/art/:id/comments', async (req: Request, res: Response) => {
	try {
		const params = req.params as {id: string}

		const artwork = await DI.artworks.findOne(+params.id)

		if (!artwork) {
			return res.status(404).json({message: 'Artwork not found'})
		}

		const [comments, count] = await DI.em.findAndCount(
			Comment,
			{artwork},
			{
				populate: ['user'],
			}
		)

		res.json({comments, totalCount: count})
	} catch (e: any) {
		return res.status(400).json({message: e.message})
	}
})

router.post('/art/:id/comments', async (req: CustomRequest, res: Response) => {
	if (!req.user) {
		return res.status(401).send({error: 'Authentication failed.'})
	}
	try {
		const params = req.params as {id: string}

		const {text} = req.body as {
			text: string
		}

		const artwork = await DI.artworks.findOne(+params.id)

		if (!artwork) {
			return res.status(404).json({message: 'Artwork not found'})
		}

		const comment = DI.em.create(Comment, {user: req.user, artwork, text})

		artwork.comments.add(comment)

		await DI.em.flush()

		res.json(comment)
	} catch (e: any) {
		return res.status(400).json({message: e.message})
	}
})

router.get('/art/:id/like', async (req: CustomRequest, res: Response) => {
	if (!req.user) {
		return res.status(401).send({error: 'Authentication failed.'})
	}
	try {
		const params = req.params as {id: string}

		const artwork = await DI.artworks.findOne(+params.id)

		if (!artwork) {
			return res.status(404).json({message: 'Artwork not found'})
		}

		const like = await DI.em.findOne(Like, {
			user: req.user,
			artwork,
		})

		if (!like) {
			return res.json({liked: false})
		}

		res.json({liked: true})
	} catch (e: any) {
		return res.status(400).json({message: e.message})
	}
})

router.post('/art/:id/like', async (req: CustomRequest, res: Response) => {
	if (!req.user) {
		return res.status(401).send({error: 'Authentication failed.'})
	}
	try {
		const params = req.params as {id: string}

		const artwork = await DI.artworks.findOne(+params.id)

		if (!artwork) {
			return res.status(404).json({message: 'Artwork not found'})
		}

		if (req.user.id === artwork.user.id) {
			return res
				.status(400)
				.json({message: 'You are the user of this artwork!'})
		}

		const like = await DI.em.findOne(Like, {user: req.user, artwork})

		if (like) {
			return res.status(400).json({message: 'Like already exists'})
		}

		DI.em.create(Like, {user: req.user, artwork})

		await DI.em.flush()

		res.json({success: true})
	} catch (e: any) {
		return res.status(400).json({message: e.message})
	}
})

router.delete('/art/:id/like', async (req: CustomRequest, res: Response) => {
	if (!req.user) {
		return res.status(401).send({error: 'Authentication failed.'})
	}
	try {
		const params = req.params as {id: string}

		const like = await DI.em.findOne(Like, {
			user: req.user,
			artwork: {
				id: +params.id,
			},
		})

		if (!like) {
			return res.status(404).json({message: 'Like not found'})
		}

		await DI.em.remove(like).flush()

		res.json({success: true})
	} catch (e: any) {
		return res.status(400).json({message: e.message})
	}
})

router.post(
	'/upload',
	upload.single('file'),
	async (req: CustomRequest, res: Response) => {
		if (!req.user) {
			return res.status(401).send({error: 'Authentication failed.'})
		}

		try {
			const {title, description, tags} = req.body as {
				title: string
				description: string
				tags: string[]
			}

			let thumbnailUrl: string
			let imageUrl: string

			if (req.file) {
				const thumbnail = uuidv4() + '-' + path.extname(req.file.originalname)

				await sharp(req.file.buffer)
					.resize(400, 400, {
						fit: 'cover',
						position: sharp.strategy.attention,
					})
					.toFile('uploads/thumbnails/' + 'thumbnail-' + thumbnail, (err) => {
						if (err) {
							return res.status(400).send({error: 'File upload failed.'})
						}
					})

				await sharp(req.file.buffer).toFile(
					'uploads/images/' + 'image-' + thumbnail,
					(err) => {
						if (err) {
							return res.status(400).send({error: 'File upload failed.'})
						}
					}
				)

				thumbnailUrl = `http://localhost:8080/thumbnails/thumbnail-${thumbnail}`
				imageUrl = `http://localhost:8080/images/image-${thumbnail}`
			} else {
				return res.status(400).send({error: 'Missing file.'})
			}

			const em = DI.em.fork()

			const artwork = em.create(Artwork, {
				title,
				description,
				thumbnailUrl,
				imageUrl,
				user: req.user,
				nsfw: false,
			})

			if (tags) {
				const tagArr = []

				for (let i = 0; i < tags.length; i++) {
					const t = await em.create(Tag, {name: tags[i]})

					tagArr.push(t)
				}

				if (tagArr.length > 0) {
					artwork.tags.add(tagArr)
				}
			}

			await em.flush()

			res.json(artwork)
		} catch (e: any) {
			return res.status(400).json({message: e.message})
		}
	}
)

export const ArtworkController = router
