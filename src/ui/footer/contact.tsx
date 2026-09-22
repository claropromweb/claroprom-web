import { FaWhatsapp } from 'react-icons/fa6'

const linkClassName =
	'rounded-sm text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-600'

export default function FooterContact() {
	return (
		<section aria-labelledby="footer-contact-heading" className="flex w-full max-w-sm flex-col gap-4 md:col-span-5 md:col-start-8">
			<h3 id="footer-contact-heading" className="text-foreground font-semibold">Get in Touch</h3>
			<div className="text-sm leading-6 text-foreground/80">
				<p className="font-medium text-foreground">Claro-prom d.o.o.</p>
				<address className="mt-1 not-italic">
					Horvatovac 37 · 10000 Zagreb · Croatia · European Union
					<div className="mt-3 flex flex-wrap items-center gap-x-2">
						<span>T: <a href="tel:+38598818891" className={linkClassName}>+385 98 81 88 91</a></span>
						<a
							href="https://wa.me/38598818891"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Contact Claro-prom on WhatsApp (opens in a new tab)"
							title="WhatsApp"
							className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-[#25D366] hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
						>
							<FaWhatsapp className="size-5" aria-hidden="true" focusable="false" />
						</a>
					</div>
					<p>Mail: <a href="mailto:claroprom@gmail.com" className={linkClassName}>claroprom@gmail.com</a></p>
				</address>
				<p className="mt-2">VAT ID: <span className="text-foreground">HR50624653521</span></p>
				<p>EUDAMED SRN: <span className="text-foreground">HR-MF-000055271</span></p>
				<div className="mt-4 space-y-1 border-t border-stroke pt-4">
					<p>European manufacturer of IVD and laboratory products</p>
					<p>ISO 13485 certified</p>
				</div>
			</div>
		</section>
	)
}
