# Technical Context: FEELS

## Technology Stack
- **Frontend**: React, TypeScript, TailwindCSS, Apollo Client
- **Backend**: Node.js, Express, GraphQL, Apollo Server
- **Database**: PostgreSQL primary storage, Redis for caching
- **Infrastructure**: Docker, AWS (ECS, RDS, S3), CI/CD with GitHub Actions

## Development Environment
- **Local Setup**: Docker Compose for service orchestration
- **Code Editor**: VSCode with recommended extensions
- **Package Management**: npm with workspaces for monorepo structure
- **Testing**: Jest for unit tests, Cypress for E2E testing
- **Linting/Formatting**: ESLint, Prettier with pre-commit hooks

## Dependencies
- **React**: v18.2.0 - UI component library
- **TypeScript**: v4.9.5 - Type safety and developer experience
- **TailwindCSS**: v3.3.0 - Utility-first CSS framework
- **GraphQL**: v16.6.0 - API query language
- **Monaco Editor**: v0.36.1 - Code editor component
- **Jest**: v29.5.0 - Testing framework
- **Express**: v4.18.2 - Web server framework

## Technical Constraints
- Must support evergreen browsers (last 2 versions)
- Initial page load must be under 3 seconds on 4G connections
- API responses must complete within 500ms for critical paths
- Code execution environment must be secure and isolated
- All user data must be encrypted at rest and in transit

## Build & Deployment
The project uses a CI/CD pipeline with GitHub Actions. Pull requests trigger test runs, while merges to main create staging deployments. Production releases require manual approval. The build process uses Docker multi-stage builds to create optimized containers that are deployed to AWS ECS.
