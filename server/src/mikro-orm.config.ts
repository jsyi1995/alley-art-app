import {defineConfig} from '@mikro-orm/postgresql'
import {SqlHighlighter} from '@mikro-orm/sql-highlighter'
import {TsMorphMetadataProvider} from '@mikro-orm/reflection'

const host = process.env.DATABASE_HOST || 'localhost'

export default defineConfig({
	dbName: 'postgres',
	host: host,
	port: 5432,
	password: 'mysecretpassword',
	entities: ['dist/**/*.entity.js'],
	entitiesTs: ['src/**/*.entity.ts'],
	debug: true,
	highlighter: new SqlHighlighter(),
	metadataProvider: TsMorphMetadataProvider,
})
