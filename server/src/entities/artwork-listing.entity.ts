import {Entity, EntityManager, Property} from '@mikro-orm/postgresql'
import {Artwork} from './artwork.entity'

@Entity({
	expression: (em: EntityManager) => {
		return em.getRepository(Artwork).listArtworksQuery()
	},
})
export class ArtworkListing {
	@Property()
	title!: string

	@Property()
	description!: string

	@Property()
	tags!: string[]

	@Property()
	thumbnailUrl!: string

	@Property()
	imageUrl!: string

	@Property()
	user!: number

	@Property()
	username!: string

	@Property()
	totalComments!: number
}
