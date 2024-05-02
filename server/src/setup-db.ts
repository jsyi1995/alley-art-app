import 'reflect-metadata'
import {MikroORM} from '@mikro-orm/postgresql'
import * as dotenv from 'dotenv'

dotenv.config()

export const init = (async () => {
	const orm = await MikroORM.init()
	await orm.schema.refreshDatabase()

	await orm.close()
})()
