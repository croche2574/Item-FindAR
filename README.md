# Item-FindAR Front-end Web App

## Install and Run
 1. Clone the repo with `git clone https://github.com/croche2574/Item-FindAR`
 2. Install and configure the Neo4j database version of your choosing: [Download](https://neo4j.com/deployment-center/#community). Neo4j defaults to IPv6, this needs to be set in the config along with the SSL certificates.
 3. Edit the line `const driver = createDriver('bolt', 'address', 7687, 'neo4j', 'password')` to use the valid ip/domain and the correct db username and password  
 4. Edit the line `<Neo4jProvider driver={driver} database="labset">` to match the name of your database 
 5. Edit the line `var client = new WebSocketClient("wss://(domain/ip)/detect")` to match the Ngrok domain or ip for the backend server (Located in `src/features/augment_system/workers/sendImg.js`)
 6. For web-only functions (No PWA), you can run the client locally and access through your network IP. For the PWA functions to work, you'll need to deploy the webapp on hosting and configure Nginx.
 7. Configure webpack.config.js to either development or production, and run `webpack build`.
 8. Run with the webpack dev server for development or deploy the static files for production.
