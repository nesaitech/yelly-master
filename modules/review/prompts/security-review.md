# Security-Focused Review Checklist

Use this prompt when performing a security-focused review of a pull request or code change.

## Injection

- [ ] SQL queries use parameterized statements, never string concatenation.
- [ ] Shell commands do not include user input. If they must, input is escaped with a library.
- [ ] HTML output escapes user-generated content to prevent XSS.
- [ ] Regular expressions do not accept user input (ReDoS risk).

## Authentication and Authorization

- [ ] All endpoints that modify data require authentication.
- [ ] Authorization checks verify the user has access to the specific resource, not just that they are logged in.
- [ ] Tokens are validated on every request, not cached beyond their expiry.
- [ ] Password handling uses bcrypt/scrypt/argon2, never MD5/SHA.

## Sensitive Data

- [ ] API keys, tokens, and secrets are not hardcoded. They come from environment variables.
- [ ] Sensitive data is not logged (passwords, tokens, PII).
- [ ] Error messages do not leak internal details (stack traces, DB schema, file paths).
- [ ] HTTPS is enforced. No HTTP fallback.

## Dependencies

- [ ] New dependencies are from well-maintained, reputable packages.
- [ ] Run `npm audit` to check for known vulnerabilities.
- [ ] Lock files are committed (`package-lock.json`).

## Data Validation

- [ ] All external inputs are validated at the system boundary (API handlers, message consumers).
- [ ] File uploads are validated for type and size.
- [ ] Redirect URLs are validated against an allowlist to prevent open redirects.

## Headers and CORS

- [ ] CORS is configured to allow only expected origins, not `*` in production.
- [ ] Security headers are set: `Content-Security-Policy`, `X-Frame-Options`, `Strict-Transport-Security`.
