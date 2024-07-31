# FiloDiscuss

FiloDiscuss is an Android mobile app that replicates the functionality of Reddit, built using Jetpack Compose. This project follows clean architecture and MVVM principles, integrating a Node.js backend written in TypeScript, PostgreSQL for data storage, and Redis for session management.

## Features

- **Authentication:** 
  - Manages user sessions with cookies, providing persistent login through SharedPreferences.
  - Uses OkHttp interceptor for handling cookies.

- **Post Management:**
  - Allows users to create, edit, delete, upvote, and downvote posts.
  - **Pagination:** Supports pagination for efficiently loading and displaying posts.

- **Navigation:**
  - Uses Jetpack Compose's Navigation component for seamless app navigation.

- **Dependency Injection:**
  - Employs Hilt for dependency injection.

- **GraphQL Integration:**
  - Uses Apollo GraphQL 3 for handling queries, mutations, and fragments.

## Related Blogs

For additional information and setup guides related to this project, check out these resources:

- [How to Install Redis on Windows Using WSL2](https://dev.to/azzamaddouri/how-to-install-redis-on-windows-using-wsl2-4mmc)
- [Cookies Setup in Apollo Studio for Node.js GraphQL Servers](https://dev.to/azzamaddouri/cookies-setup-in-apollo-studio-for-nodejs-graphql-servers-11l1)
- [Apollo GraphQL Integration in Jetpack Compose](https://dev.to/azzamaddouri/apollo-graphql-integration-in-jetpack-compose-3ij3)

## Project Demo

Watch a demo of the project on YouTube:

[![FiloDiscuss Demo](https://img.youtube.com/vi/fIe229npvTk/maxresdefault.jpg)](https://youtu.be/fIe229npvTk?si=1-iNnW-1KHJtT_Fx)
