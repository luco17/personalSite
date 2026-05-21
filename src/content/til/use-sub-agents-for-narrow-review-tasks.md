---
title: Using sub agents for narrow review tasks
date: 2026-05-21
---

Discovered the utility of sub agents when doing focused reviews on things like security/performance

Ran this experiment after building an API and wanting a review across different risks: security, performance, reliability, API design. The idea came after reading Cloudflare's write-up on using Mythos [Project Glasswing and Mythos](https://blog.cloudflare.com/cyber-frontier-models/). Two points stood out:

- Narrow scope improves findings. A model does better when asked to inspect one attack class, trust boundary, or subsystem than when asked to "find vulnerabilities" across a whole repository.
- Parallel narrow tasks beat one exhaustive agent. Coverage improves when many agents work on specific questions and the results are merged afterwards.

This was the prompt:

````text
Initialise sub agents to handle each of these individual bullet points. Each sub agent should write its findings into docs/api_check_codex:

"""
## Security & Exposure
- Evaluate all new/updated endpoint files (and related middleware/auth) for exposure of internals: stack traces, debug info, file paths, environment variables, or implementation details in errors/responses.
- Check against OWASP Top 10 (especially API Security Top 10): injection, broken auth, excessive data exposure, rate limiting absence, security misconfiguration, improper assets management.
- Identify any sensitive data (PII, secrets, keys) that might be logged, returned in responses, or stored insecurely.

## Performance & Scalability
- Evaluate risk of DoS/cost explosion: missing or ineffective rate limiting, expensive queries without pagination/limits, N+1 problems, or unbounded resource usage.
- Analyze database/query performance: inefficient queries, missing indexes, lack of caching (Redis/memcache), heavy computations in hot paths.
- Check response size and payload efficiency: unnecessary data returned, missing compression (gzip), large JSON payloads, or lack of field selection/filtering.
- Review async handling, connection pooling, timeouts, and potential blocking operations.
- Identify scalability bottlenecks (e.g., single points of contention, poor horizontal scaling support).

## Reliability & Error Handling
- Evaluate error handling and logging: are errors properly caught, sanitized for clients, and logged with context (without leaking secrets)?
- Check for proper HTTP status codes, consistent error response format, and graceful degradation.
- Review idempotency for mutating endpoints (POST/PUT/PATCH/DELETE) and handling of retries/duplicates.
- Assess monitoring/observability hooks: metrics, tracing, health checks, and logging for key operations.

## API Design & Maintainability
- Verify RESTful/HATEOAS/GraphQL compliance as appropriate: proper resource naming, HTTP methods, versioning strategy, and pagination/filtering/sorting standards.
- Check documentation: OpenAPI/Swagger accuracy, examples, and parameter descriptions.
- Review code structure: duplication, separation of concerns (controllers vs services vs models), and use of proper patterns/middleware.
- Evaluate dependency risks: outdated libraries, unnecessary dependencies, or insecure transitive dependencies.

## Operational & Compliance
- Check CORS, CSP, security headers, and API gateway/proxy configurations.
- Review data retention, privacy compliance (GDPR/CCPA), and audit logging for sensitive operations.
- Identify potential abuse vectors specific to the domain (e.g., spam via user-generated content endpoints).
- Test for common edge cases: large inputs, concurrent requests, invalid states, and high load scenarios.
"""
````

The important bit is not "use more agents". It is "give each agent a job small enough to do well". Keep the context clean!
