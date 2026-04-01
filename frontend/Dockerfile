# ─────────────────────────────────────────
# Node 20 Alpine — Frontend React + Vite
# ─────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Copier les fichiers de dépendances d'abord (cache Docker optimal)
COPY package.json package-lock.json ./

# Installer les dépendances
RUN npm ci

# Copier le reste du projet
# (en dev, le volume ./frontend:/app override ce COPY — c'est normal)
COPY . .

# Port Vite dev server
EXPOSE 5173

# Démarrage du serveur de dev Vite avec HMR
# --host 0.0.0.0 permet à Docker d'exposer le port vers localhost
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
