# Security Review

## Scope

Static review of the Watchverse frontend, Supabase integration, Edge Function and deployment configuration. This is not a full penetration test or a certification. A black-box VAPT must be performed only against the deployed application with explicit authorization.

## Checks performed

- `npm audit --omit=dev`: no known vulnerabilities reported.
- No `service_role` key or TMDB secret is present in the frontend configuration.
- Public registration is disabled in application configuration and must also remain disabled in Supabase Auth.
- Supabase tables use RLS and policies based on `auth.uid()` / owned profiles.
- TMDB access is routed through an Edge Function when configured; the TMDB token is read from a Supabase secret.
- User-controlled text is generally passed through `esc()` before HTML interpolation.
- Inline navigation handlers were removed from quick-add and fatal-error recovery paths.
- Modal dialogs now lock page scrolling, contain overscroll and trap keyboard focus.

## Findings and residual risk

### Medium: static hosting security headers

GitHub Pages serves the static application. Headers such as Content-Security-Policy, Permissions-Policy and an explicit Referrer-Policy are not controlled by the repository. The application should avoid putting secrets in client code and should keep third-party origins limited. A reverse proxy or a host with configurable headers is required for a complete header hardening pass.

### Medium: client-side storage

IndexedDB and local/session storage are used for offline state and remembered sessions. They are readable by JavaScript running on the same origin. This is acceptable for the current family application model, but it means an XSS or compromised browser extension could expose local data. Do not store service-role keys or long-lived provider secrets in the browser.

### Medium: Edge Function deployment

The TMDB proxy must be deployed with `TMDB_READ_TOKEN` as a Supabase secret. The client must contain only the publishable/anon key and the function URL. The function should retain its allow-list of TMDB paths, require a valid Supabase session and return only the required data.

### Low: third-party media URLs

Posters, cast images and trailers can originate from external providers. They are rendered as resources, not executable HTML, but provider availability and privacy behavior can change. Keep `rel="noopener noreferrer"` on external links and preserve source attribution.

## Recommended VAPT scope

Use the OWASP Web Security Testing Guide as the checklist, tailored to this app:

1. Authentication and session tests: login, logout, password recovery, remember-device behavior, session expiry and account enumeration.
2. Authorization tests: attempt to read or mutate the other profile and another Supabase account using valid but different sessions.
3. Input validation/XSS tests: profile names, notes, imported titles, episode names, query parameters and avatar metadata.
4. Supabase/RLS tests: direct REST access to every table with the publishable key, both authenticated and unauthenticated.
5. Edge Function tests: method restrictions, path allow-list, missing/invalid JWT, CORS behavior, rate limiting and TMDB error propagation.
6. Deployment tests: HTTPS, cache behavior, source maps, forgotten files, service worker scope and security headers.

The OWASP Top 10:2025 groups the most relevant risks here under broken access control, security misconfiguration, supply-chain failures, injection, authentication failures, data integrity and exceptional-condition handling. The OWASP WSTG explicitly recommends combining source review, configuration review and controlled penetration testing rather than treating an automated scan as a complete assessment.

## Operational rules

- Never commit `service_role`, TMDB, SMTP or other private tokens.
- Rotate any secret that has ever been exposed in a screenshot, chat or repository.
- Keep Supabase Auth public sign-up disabled.
- Review RLS policies after every schema change.
- Run dependency audit and the focused security checks before releases.
- Perform active testing only against systems owned or explicitly authorized by the owner.

