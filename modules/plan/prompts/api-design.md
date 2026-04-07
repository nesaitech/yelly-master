# API Design Decision Framework

Use this prompt when designing a new API or evaluating an API design proposal.

## Step 1: Identify Consumers

- Who will call this API? Frontend, mobile, third-party, internal services?
- How many consumers? One (use tRPC or simple functions) or many (use REST or GraphQL)?
- Do consumers need different shapes of the same data? (GraphQL signal)

## Step 2: Define Resources

List the core resources (nouns) the API exposes:
- What are the entities? (users, orders, products)
- What are the relationships? (user has many orders, order has many items)
- What are the operations? Map to HTTP methods or GraphQL mutations.

## Step 3: Design Endpoints

For each resource, define:
- **Path:** `/api/v1/users/:id`
- **Method:** GET, POST, PUT, PATCH, DELETE
- **Request body:** JSON schema with required and optional fields
- **Response body:** JSON schema with example
- **Status codes:** Success and error cases
- **Authentication:** Required? What level?

## Step 4: Pagination and Filtering

- Use cursor-based pagination for large or frequently-updated collections.
- Use offset-based pagination only for small, stable datasets.
- Define standard query parameters: `?limit=20&cursor=abc123&sort=createdAt&order=desc`

## Step 5: Error Format

Standardize error responses across all endpoints:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [
      { "field": "email", "message": "This field is required" }
    ]
  }
}
```

## Step 6: Versioning Strategy

- URL versioning (`/api/v1/`) for public APIs.
- Header versioning for internal APIs if needed.
- Plan for how you will deprecate old versions.

## Checklist

- [ ] All endpoints require authentication unless explicitly public.
- [ ] Input validation at every endpoint.
- [ ] Rate limiting configured.
- [ ] Pagination on all list endpoints.
- [ ] Consistent error format.
- [ ] OpenAPI/Swagger spec generated or written.
