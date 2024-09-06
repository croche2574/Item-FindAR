# Item-FindAR Front-end Web App

## Install and Run
 1. Clone the repo with `git clone https://github.com/croche2574/Item-FindAR`
 2. Install and configure the Neo4j database version of your choosing: [Download](https://neo4j.com/deployment-center/#community). Neo4j defaults to IPv6, this needs to be set in the config along with the SSL certificates.
 3. Edit the .env file to match your information
 4. Install the dependencies with `bun install` or `npm install`
 4. For web-only functions (No PWA), you can run the client locally and access through your network IP. For the PWA functions to work, you'll need to deploy the webapp on hosting (or use `vite preview`) and configure Nginx.
 5. Run with `bun run dev` or `npm run dev`
