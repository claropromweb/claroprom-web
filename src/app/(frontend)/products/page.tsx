import Page, { generateMetadata as pageMetadata } from '../[[...slug]]/page'

export const dynamic = 'force-dynamic'
const existingPage = () => ({
	params: Promise.resolve({ slug: ['proizvodi'] }),
})
export const generateMetadata = () => pageMetadata(existingPage())
export default function ProductsPage() {
	return Page(existingPage())
}
