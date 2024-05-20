import {EntityRepository} from '@mikro-orm/postgresql'
import {Artwork} from './artwork.entity'

export class ArtworkRepository extends EntityRepository<Artwork> {}
