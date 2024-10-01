# Item-FindAR Front-end Web App
## Abstract
Consumers face multiple challenges while shopping for products in a grocery or pharmacy
setting, including illegible or inconsistent labels, mislabeled ingredients and allergens, and
densely stocked shelves of similarly packaged items. This thesis describes the development
of Item-FindAR, a Mobile Augmented Reality (MAR) system designed to streamline the
shopping process. Our system allows users to easily find items and obtain consistent product
information without direct physical contact, via virtual information overlays on a mobile
device display.

The research aimed to create a platform-independent solution that users could access
via their smartphone browsers, removing the need for costly or specialized equipment. We
integrated a YOLOv8 object detection model for markerless tracking with WebXR, utilizing
the recently released raw-camera-access feature to access the user’s smartphone camera in
real time. We then processed the image remotely to reduce resource usage. The development
involved multiple iterations of design, build, and testing, resulting in a working prototype
that leverages computer vision to recognize and locate items in the user’s environment, with
relevant information displayed over the product’s image.

Two user studies were conducted to evaluate the system’s usability and user satisfaction.
Results indicate that Item-FindAR enhances the shopping experience by simplifying product
identification and delivering essential information in a user-friendly manner. The research
also underscores the significance of user comfort and data security, suggesting that these
aspects are crucial for the widespread adoption of MAR technologies in retail.
This thesis contributes to the field of Mobile Augmented Reality by offering valuable
insights into the creation of web-based AR applications reliant on custom computer vision
models, presenting a complete client, server, database, and set of object detection models.

## Install and Run
 1. Clone the repo with `git clone https://github.com/croche2574/Item-FindAR`
 2. Install and configure the Neo4j database version of your choosing: [Download](https://neo4j.com/deployment-center/#community). Neo4j defaults to IPv6, this needs to be set in the config along with the SSL certificates.
 3. Edit the .env file to match your information
 4. Install the dependencies with `bun install` or `npm install`
 4. For web-only functions (No PWA), you can run the client locally and access through your network IP. For the PWA functions to work, you'll need to deploy the webapp on hosting (or use `vite preview`) and configure Nginx.
 5. Run with `bun run dev` or `npm run dev`
