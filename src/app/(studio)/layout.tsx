import { preloadModule } from 'react-dom'

const bridgeScript = 'https://core.sanity-cdn.com/bridge.js'

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	preloadModule(bridgeScript, { as: 'script' })

	return (
		<html lang="en">
			<body style={{ margin: 0 }}>
				<script src={bridgeScript} async type="module" />
				{children}
			</body>
		</html>
	)
}
