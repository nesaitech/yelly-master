# Deployment Management

A comprehensive guide for safely deploying applications to staging and production environments, covering Vercel, Fly.io, Docker, and AWS.

## Steps

1. **Run pre-deploy checks.** Before any deployment, ensure all tests pass, linting is clean, and there are no known security vulnerabilities. Run `npm test`, `npm run lint`, and `npm audit` (or equivalents). Never deploy code that fails these checks.

2. **Build the application.** Create a production build with optimizations enabled. Verify the build output size is reasonable. Check that environment variables are set correctly for the target environment. For Docker deployments, build the image and tag it with the git SHA.

3. **Deploy to staging first.** Always deploy to a staging environment before production. Staging should mirror production as closely as possible — same infrastructure, same environment variables (with staging-specific values), same database schema.

4. **Verify staging health.** Hit the health check endpoint. Run smoke tests against staging. Check that critical user flows work. Verify database migrations applied correctly. Look for console errors and unexpected log entries.

5. **Promote to production.** Once staging is verified, promote the same artifact (not a new build) to production. For Vercel, use `vercel promote`. For Fly.io, use `fly deploy`. For Docker, push the same image tag to the production registry.

6. **Post-deploy monitoring.** Watch error rates, response times, and resource usage for 15-30 minutes after deploy. Compare against pre-deploy baselines. If any metric degrades significantly, initiate rollback.

## Rollback Procedures

- **Vercel**: Use `vercel rollback` to revert to the previous deployment instantly
- **Fly.io**: Use `fly releases` to find the previous release, then `fly deploy --image <previous-image>`
- **Docker/AWS**: Redeploy the previous image tag from your container registry
- **Database**: If a migration was applied, run the down migration before rolling back code

## Blue-Green Deployments

Deploy the new version alongside the old one. Route a small percentage of traffic to the new version. Monitor for errors. Gradually increase traffic. If issues arise, route all traffic back to the old version.

## Canary Releases

Deploy to a single instance first. Let it receive real traffic. Monitor its metrics against the fleet. If healthy after the observation period, roll out to all instances.
