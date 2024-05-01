import 'reflect-metadata'
import {existsSync, mkdirSync} from 'fs'
import http from 'http'
import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'
import {EntityManager, MikroORM, RequestContext} from '@mikro-orm/postgresql'

import {UserController, ArtworkController} from './controllers'
import {User, Artwork} from './entities'
import {UserRepository} from './entities/user.repository'
import {ArtworkRepository} from './entities/artwork.repository'

interface DecodedToken {
	id: number
}

interface CustomRequest extends express.Request {
	user?: User
}

export const DI = {} as {
	server: http.Server
	orm: MikroORM
	em: EntityManager
	user: UserRepository
	artworks: ArtworkRepository
}

export const app = express()
dotenv.config()
const port = process.env.PORT || 8080

const uploadsDir = () => {
	if (!existsSync('uploads')) {
		mkdirSync('uploads')
		mkdirSync('uploads/avatars')
		mkdirSync('uploads/images')
		mkdirSync('uploads/thumbnails')
	}
}

export const init = (async () => {
	uploadsDir()

	DI.orm = await MikroORM.init()
	DI.em = DI.orm.em
	DI.user = DI.orm.em.getRepository(User)
	DI.artworks = DI.orm.em.getRepository(Artwork)

	app.use(express.static('uploads'))

	app.use(cors())

	app.use(express.json())
	app.use(express.urlencoded({extended: true}))

	app.use((req, res, next) => RequestContext.create(DI.orm.em, next))

	app.use(async (req: CustomRequest, res, next) => {
		try {
			const token = req.header('Authorization')?.replace('Bearer ', '')

			if (token) {
				const decoded = (await jwt.verify(
					token,
					process.env.JWT_SECRET as string,
					{
						maxAge: '7d',
					}
				)) as DecodedToken
				req.user = await DI.user.findOneOrFail(decoded.id)
			}
		} catch (e) {}
		next()
	})

	app.get('/', (req, res) =>
		res.json({
			message: 'Welcome to Alley Backend!',
		})
	)
	app.use('/user', UserController)
	app.use('/artwork', ArtworkController)

	app.use((req, res) => res.status(404).json({message: 'No route found'}))

	DI.server = app.listen(port, () => {
		console.log(`Alley backend started at http://localhost:${port}`)
	})
})()
