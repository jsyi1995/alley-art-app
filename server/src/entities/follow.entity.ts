import {Entity, ManyToOne} from '@mikro-orm/core'
import {User} from './user.entity'
import {BaseEntity} from './base.entity'

@Entity()
export class Follow extends BaseEntity {
	@ManyToOne()
	userone!: User

	@ManyToOne()
	usertwo!: User
}
