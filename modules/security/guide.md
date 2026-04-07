# Security Auditing

A systematic approach to identifying vulnerabilities in application code, dependencies, and configuration. Security auditing should be a regular practice, not a one-time event.

## Workflow

1. **Run a dependency audit.** Execute `npm audit` (or `yarn audit`, `pip audit`) to identify known vulnerabilities in third-party packages. Review each finding by severity. Update or replace packages with critical or high vulnerabilities. For advisories that cannot be patched, document the risk and any mitigations in place.

2. **Scan for hardcoded secrets.** Search the codebase for API keys, tokens, passwords, and private keys committed to source. Check common patterns: `API_KEY`, `SECRET`, `PASSWORD`, `TOKEN`, `PRIVATE_KEY`, and base64-encoded strings. Scan git history for secrets that were committed and later removed — they are still in the history.

3. **Review the OWASP Top 10.** Walk through each category systematically:
   - Injection (SQL, NoSQL, OS command, LDAP)
   - Broken Authentication and Session Management
   - Cross-Site Scripting (XSS)
   - Insecure Direct Object References
   - Security Misconfiguration
   - Sensitive Data Exposure
   - Cross-Site Request Forgery (CSRF)
   - Server-Side Request Forgery (SSRF)
   - Using Components with Known Vulnerabilities
   - Insufficient Logging and Monitoring

4. **Review input validation.** Check that all user input is validated and sanitized before use. Verify that parameterized queries are used for database operations. Confirm that output encoding is applied before rendering user-supplied data.

5. **Audit authentication and authorization.** Verify password hashing uses bcrypt/scrypt/argon2. Check that sessions expire and tokens are rotated. Confirm that authorization checks exist on every protected endpoint, not just the frontend.

6. **Check security headers.** Verify Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, and Referrer-Policy headers are set correctly.

7. **Rate findings by severity.** Use Critical / High / Medium / Low. Critical: actively exploitable, data breach risk. High: exploitable with effort. Medium: defense-in-depth issue. Low: best practice improvement.

8. **Document and report.** For each finding, record: description, location (file and line), severity, proof of concept or reproduction steps, and recommended fix.
