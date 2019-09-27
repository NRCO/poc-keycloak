# Installation

```sh
cd website1 && npm install && cd ..
cd website2 && npm install && cd ..
cd api && npm install && cd ..
```

# Paramètrage keycloak

Importer les deux clients publics dans utils/keycloak/config

# Démarrage

- docker-compose up
- cd website1 && node index.js
- cd website2 && node index.js
- cd api && node index.js

# Accès

http://localhost:28000
http://localhost:28001
