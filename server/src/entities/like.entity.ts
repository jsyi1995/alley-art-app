import {Entity, ManyToOne} from '@mikro-orm/core'
import {Artwork} from './artwork.entity'
import {User} from './user.entity'
import {BaseEntity} from './base.entity'

@Entity()
export class Like extends BaseEntity {
	@ManyToOne()
	artwork!: Artwork

	@ManyToOne()
	user!: User
}
