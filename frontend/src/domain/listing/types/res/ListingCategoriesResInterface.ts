import type ListingCategoryInterface from '@/domain/listing/types/ListingCategoryInterface'

export interface ListingCategoryNodeInterface extends ListingCategoryInterface {
  children?: Pick<ListingCategoryInterface, 'id' | 'name' | 'slug'>[]
}

export default interface ListingCategoriesResInterface {
  categories: ListingCategoryNodeInterface[]
}
