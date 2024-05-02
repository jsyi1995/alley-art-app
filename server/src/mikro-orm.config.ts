import {defineConfig} from '@mikro-orm/postgresql'
import {SqlHighlighter} from '@mikro-orm/sql-highlighter'
import {TsMorphMetadataProvider} from '@mikro-orm/reflection'

export default defineConfig({
	dbName: process.env.POSTGRES_DB || 'alley',
	host: process.env.DATABASE_HOST || 'localhost',
	port: process.env.DATABASE_PORT ? +process.env.DATABASE_PORT : 5431,
	user: process.env.POSTGRES_USER || 'postgres',
	password: process.env.POSTGRES_PASSWORD || 'mysecretpass',
	entities: ['dist/**/*.entity.js'],
	entitiesTs: ['src/**/*.entity.ts'],
	debug: true,
	highlighter: new SqlHighlighter(),
	metadataProvider: TsMorphMetadataProvider,
})
