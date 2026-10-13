# V3.4 production email delivery

## Root cause and live baseline

Production claroprom.com is served by Vercel project prj_iSBOLSFeqr0GkVC92etlmGB01AeF, team team_BbWL3paCfVFpTyrwOrl9N6gC. V3.3 commit e5ca1f36c0fc563fa28de7843edb66ef9b39e220 is live, deployment dpl_YSDRyCUkxgmKYCWdWPUi18rLFuGg.

Owner-inspected historical headers showed To claropromweb@gmail.com and From onboarding@resend.dev. The previous task corrected CONTACT_FORM_TO to sole recipient claroprom@gmail.com and redeployed it; its metadata update timestamp remains unchanged. CONTACT_FORM_FROM and RESEND_API_KEY metadata still reflect the June22 configuration. Secret values are unavailable and were not revealed/copied. The test sender's own-account restriction prevents treating the old successful test deliveries as valid business delivery.

All five inquiry types share `/api/contact`. It reads only RESEND_API_KEY, CONTACT_FORM_TO and CONTACT_FORM_FROM. There is no hardcoded wrong-mailbox fallback, CC or BCC. Reply-To comes from validated customer input; the prior claroprom@gmail.com Reply-To matched the synthetic submitter. Frontend displayed business contact is independent of backend To.

The actual sending account remains unverified pending sign-in to the existing suspected claropromweb@gmail.com Resend account. The previously accessible claroprom@gmail.com team had no keys/domains/messages and was not attributed to the production key. Confirm account ownership from actual message/key metadata, not login address alone. No replacement key/account is authorized by this change.

## Targeted code correction

- Production-only fail-closed guard requires the sole official recipient and a syntactically valid non-resend.dev From. This is a configuration safety check; actual provider domain verification must still be independently confirmed.
- Customer email validation rejects header punctuation/injection and oversized values while retaining ordinary international and plus-tag business addresses.
- Provider rejection, network error or missing message ID returns failure. No success without accepted provider message identity. Opaque message ID is returned and logged with inquiry type for delivery correlation; neither credentials nor customer body/address is logged.
- Existing busy refs prevent repeat-click submissions; entered fields and RFQ selection remain on error. No queue/database/new email service added.
- All five payloads and four canonical RFQ rows are covered by isolated fixtures. No real email is sent by tests. Existing single-form/RFQ behavior retained.

## Required release gate

Do not merge/deploy the final repair until the active provider account and verified sender are confirmed, all required DNS/credential changes have specific owner approval, and Production To is correct. A prepared Preview is not a complete email repair and must never send real email using the shared production credentials.

If a suitable verified domain exists, reuse it with the existing key if authorized. If absent, prepare the provider-generated DKIM/SPF records for a suitable dedicated CLARO-PROM sending subdomain and request exact DNS approval. Do not invent record values or change root SPF/MX. Preserve Gmail, existing mailbox services and V3.3.

Exactly two controlled public tests follow a corrected READY production deployment: distributor and four-SKU RFQ. Record provider IDs/events, correct recipient/From/Reply-To and actual contents, then require owner confirmation in claroprom@gmail.com before full PASS.

Current access gate: the owner was asked to sign in through the visible Resend tab in Codex. Do not request passwords/API keys in chat. No domain, DNS, key or environment change is included in this code preparation.
