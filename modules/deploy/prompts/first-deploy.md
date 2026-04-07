# First-Time Deployment Checklist

## Context
Setting up deployment for a project for the first time. This checklist ensures nothing is missed.

## Pre-Deployment

- [ ] All tests passing locally
- [ ] Production environment variables configured
- [ ] Database provisioned and migrated
- [ ] Domain name configured with DNS
- [ ] SSL/TLS certificate provisioned (or auto-provisioned by platform)
- [ ] Health check endpoint implemented (`GET /api/health` returning 200)
- [ ] Error tracking service configured (Sentry, etc.)
- [ ] Logging configured for production

## Platform Setup

### Vercel
```bash
vercel link
vercel env add PRODUCTION_VAR
vercel --prod
```

### Fly.io
```bash
fly launch
fly secrets set DATABASE_URL=...
fly deploy
```

### Docker
```bash
docker build -t myapp:v1 .
docker run -p 3000:3000 --env-file .env.production myapp:v1
```

## Post-First-Deploy

- [ ] Verify the app loads in a browser
- [ ] Test critical user flows (login, main feature, payment if applicable)
- [ ] Check that logs are flowing to your logging service
- [ ] Verify error tracking captures a test error
- [ ] Set up uptime monitoring
- [ ] Configure alerts for error rate and latency thresholds
- [ ] Document the deploy process for the team
- [ ] Set up CI/CD to automate future deployments

## Common First-Deploy Issues

- **Missing environment variables**: App crashes on startup. Check platform env var settings.
- **Port binding**: App listening on wrong port. Most platforms expect `PORT` env var.
- **Build command wrong**: Platform cannot find the build script. Verify `package.json` scripts.
- **Static file serving**: Assets not loading. Check build output directory configuration.
