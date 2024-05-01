import {Entity, ManyToOne, Property} from '@mikro-orm/core'
import {Artwork} from './artwork.entity'
import {User} from './user.entity'
import {BaseEntity} from './base.entity'

@Entity()
export class Comment extends BaseEntity {
	@Property({length: 1000})
	text!: string

	@ManyToOne()
	artwork!: Artwork

	@ManyToOne()
	user!: User
}
