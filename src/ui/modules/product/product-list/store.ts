import { useQueryState } from 'nuqs'

export function useProductListStore() {
	const [categoryParam, setCategoryParam] = useQueryState('category', {
		defaultValue: '',
	})

	return {
		categoryParam,
		setCategoryParam,
	}
}
