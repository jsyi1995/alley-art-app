import {
	Collection,
	Entity,
	ManyToMany,
	ManyToOne,
	OneToMany,
	Property,
	ref,
	Ref,
	EntityRepositoryType,
} from '@mikro-orm/postgresql'
import {User, Comment, Tag} from './index'
import {BaseEntity} from './base.entity'
import {ArtworkRepository} from './artwork.repository'

@Entity({repository: () => ArtworkRepository})
export class Artwork extends BaseEntity {
	[EntityRepositoryType]?: ArtworkRepository

	@Property()
	title: string

	@ManyToOne()
	user: Ref<User>

	@Property()
	thumbnailUrl: string

	@Property()
	imageUrl: string

	@Property({length: 1000})
	description: string

	@Property()
	nsfw: boolean

	@ManyToMany()
	tags = new Collection<Tag>(this)

	@OneToMany({
		mappedBy: 'artwork',
		eager: true,
		orphanRemoval: true,
	})
	comments = new Collection<Comment>(this)

	constructor(
		user: User,
		title: string,
		thumbnailUrl: string,
		imageUrl: string,
		description = '',
		nsfw: boolean
	) {
		super()
		this.user = ref(user)
		this.title = title
		this.thumbnailUrl = thumbnailUrl
		this.imageUrl = imageUrl
		this.description = description
		this.nsfw = nsfw
	}
}
