# Security Patterns

## Injection Vulnerabilities

### SQL Injection via String Concatenation
- **Pattern**: `query("SELECT * FROM users WHERE id = " + userId)`
- **Risk**: Attacker can manipulate queries to read, modify, or delete data
- **Fix**: Use parameterized queries: `query("SELECT * FROM users WHERE id = ?", [userId])`
- **Check for**: String interpolation or concatenation in any database query

### XSS via Unescaped User Input
- **Pattern**: `innerHTML = userInput` or `dangerouslySetInnerHTML={{ __html: userInput }}`
- **Risk**: Attacker injects malicious scripts executed in other users' browsers
- **Fix**: Use text content instead of HTML, or sanitize with DOMPurify
- **Check for**: Any path from user input to DOM rendering without encoding

### Insecure Deserialization
- **Pattern**: `JSON.parse(untrustedInput)` used to reconstruct objects with methods
- **Risk**: Arbitrary code execution via crafted payloads
- **Fix**: Validate schema after parsing, never use `eval` or `Function()` on input

## Secrets and Configuration

### Hardcoded Secrets in Source
- **Pattern**: `const API_KEY = "sk-abc123..."` in source files
- **Risk**: Anyone with repo access (or leaked repo) gets the credentials
- **Fix**: Use environment variables, secret managers (Vault, AWS Secrets Manager)
- **Check for**: Strings matching key/token/password patterns in .ts, .js, .env committed files

### Insecure Direct Object References (IDOR)
- **Pattern**: `GET /api/users/123/invoices` without verifying user 123 is the requester
- **Risk**: Users can access other users' data by changing the ID
- **Fix**: Always verify the authenticated user owns or has access to the requested resource

## Authentication and Access

### Missing Rate Limiting
- **Pattern**: Login endpoint accepts unlimited attempts
- **Risk**: Brute force attacks on passwords and OTP codes
- **Fix**: Implement rate limiting (e.g., 5 attempts per minute per IP/account)

### Weak Password Requirements
- **Pattern**: Minimum length of 4 characters, no complexity requirements
- **Risk**: Easy to guess or brute-force passwords
- **Fix**: Minimum 8 characters, check against breached password lists (Have I Been Pwned)

## Network and Server

### SSRF (Server-Side Request Forgery)
- **Pattern**: Server fetches a URL provided by the user without validation
- **Risk**: Attacker can scan internal networks, access metadata endpoints
- **Fix**: Whitelist allowed domains, block internal IP ranges, validate URL scheme

### Missing Security Headers
- **Pattern**: No CSP, HSTS, or X-Frame-Options headers
- **Risk**: Clickjacking, XSS amplification, downgrade attacks
- **Fix**: Set all recommended security headers in the response
