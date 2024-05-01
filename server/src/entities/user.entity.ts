import {
	BeforeCreate,
	BeforeUpdate,
	Collection,
	Entity,
	EntityRepositoryType,
	EventArgs,
	OneToMany,
	Property,
} from '@mikro-orm/postgresql'
import {hash, compare} from 'bcrypt'
import {BaseEntity} from './base.entity'
import {Artwork} from './artwork.entity'
import {UserRepository} from './user.repository.js'

@Entity({repository: () => UserRepository})
export class User extends BaseEntity {
	[EntityRepositoryType]?: UserRepository

	@Property()
	displayName: string

	@Property()
	email: string

	@Property({hidden: true, lazy: true})
	password: string

	@Property({nullable: true})
	avatarUrl?: string

	@Property({type: 'text'})
	description = ''

	@OneToMany({mappedBy: 'user'})
	artworks = new Collection<Artwork>(this)

	@Property({persist: false})
	token?: string

	constructor(displayName: string, email: string, password: string) {
		super()
		this.displayName = displayName
		this.email = email
		this.password = password
	}

	@BeforeCreate()
	@BeforeUpdate()
	async hashPassword(args: EventArgs<User>) {
		// hash only if the value changed
		const password = args.changeSet?.payload.password

		if (password) {
			this.password = await hash(password, 10)
		}
	}

	async verifyPassword(password: string) {
		const comp = await compare(password, this.password)
		return comp
	}
}
