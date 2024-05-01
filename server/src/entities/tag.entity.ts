import {Collection, Entity, ManyToMany, Property} from '@mikro-orm/core'
import {Artwork} from './artwork.entity'
import {BaseEntity} from './base.entity'

@Entity()
export class Tag extends BaseEntity {
	@Property({length: 20})
	name!: string

	@ManyToMany({mappedBy: 'tags'})
	artworks = new Collection<Artwork>(this)
}
