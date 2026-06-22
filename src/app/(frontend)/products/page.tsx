import type { Metadata } from 'next'
import getLangServer from '@/lib/get-lang-server'
import ProductList from '@/ui/modules/product/product-list'

export async function generateMetadata(): Promise<Metadata> {
	const lang = await getLangServer()
	return {
		title: lang === 'en' ? 'Products' : 'Proizvodi',
	}
}

export default function ProductsIndexPage() {
	return (
		<ProductList
			_type="product-list"
			_key="products-index"
			productsPerPage={12}
		/>
	)
}
