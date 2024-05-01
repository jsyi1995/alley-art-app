import {FindOptions, sql, EntityRepository} from '@mikro-orm/postgresql'
import {Artwork} from './artwork.entity'
import {ArtworkListing} from './artwork-listing.entity'
import {Comment} from './comment.entity.js'

export class ArtworkRepository extends EntityRepository<Artwork> {
	listArtworksQuery() {
		const totalComments = this.em
			.createQueryBuilder(Comment)
			.count()
			.where({artwork: sql.ref('a.id')})
			.as('totalComments')

		const usedTags = this.em
			.createQueryBuilder(Artwork, 'aa')
			.select(sql`group_concat(distinct t.name)`)
			.join('aa.tags', 't')
			.where({'aa.id': sql.ref('a.id')})
			.groupBy('aa.user')
			.as('tags')

		return this.createQueryBuilder('a')
			.select(['title', 'description', 'user', 'imageUrl', 'thumbnailUrl'])
			.addSelect(sql.ref('u.username').as('username'))
			.join('user', 'u')
			.addSelect([totalComments, usedTags])
	}

	async listArtworks(options: FindOptions<ArtworkListing>) {
		const [items, total] = await this.em.findAndCount(
			ArtworkListing,
			{},
			options
		)
		return {items, total}
	}
}
