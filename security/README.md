# Dependency gate

`npm run build` runs `npm run security:check` before Next.js. The check audits the locked production dependency tree against npm's registry without modifying packages. New findings at any severity, changed affected paths/versions/advisories, critical findings, unavailable registry, malformed reports and inconsistent totals stop the build. A failed build leaves the currently deployed site running; retry after a registry outage. The check does not execute in visitors' requests.

The two findings already disclosed in PR #40 remain visible in build output. The policy pins their exact advisory, severity, dependency paths and installed versions. This is an explicit baseline of unresolved risk, not a clean audit or a general exemption for these packages. Remove resolved entries after a tested fix; never regenerate or broaden the baseline automatically. As of 2026-10-30, the latest sanity-plugin-media 6.6.0 still depends on Zod ^3.25.76. Forcing Zod 4 requires authenticated media-editor compatibility tests.

Run `npm run security:test` for the offline gate regression tests. No credentials, CMS writes, database operations or emails are required. Builds run directly through `next build`, prebuilt uploads, or changes to the gate can bypass it; this does not replace repository access controls. The business application's separate deployment workflow is not modified by this website change.

Rollback: revert the dependency-gate PR. Existing deployed pages and the previous UUID patch are independent of the gate.
