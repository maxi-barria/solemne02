# ---- Stage: build frontend ----
FROM node:18-bullseye AS build
WORKDIR /app

# Copiar package.json y package-lock.json (si existe) para cachear dependencias
COPY package*.json ./

# Instalar dependencias incluyendo devDependencies (no dependemos de package-lock.json)
# Usamos npm install --include=dev para cubrir más casos
RUN npm install --include=dev

# Copiar resto del proyecto
COPY . .

# Debug leve para logs (puedes quitarlo luego)
RUN echo "node: $(node -v) npm: $(npm -v)" \
 && echo "--- package.json (head) ---" && sed -n '1,120p' package.json || true \
 && echo "--- node_modules/.bin (ls) ---" && ls -la node_modules/.bin || true

# Ejecutar build; si el bin local falla, usamos npx como fallback
RUN if [ -x "./node_modules/.bin/vite" ]; then \
      echo "Using local vite" && ./node_modules/.bin/vite build; \
    else \
      echo "Local vite not found or not executable, using npx vite@latest build" && npx vite@latest build; \
    fi

# Normalizar output: asegurar /app/out para la etapa final (Vite por defecto genera dist)
RUN if [ -d ./dist ]; then mv ./dist /app/out; \
    elif [ -d ./build ]; then mv ./build /app/out; \
    elif [ -d ./out ]; then mv ./out /app/out; \
    elif [ -d ./public ]; then mv ./public /app/out; \
    else echo "ERROR: no build output found (checked: dist, build, out, public)" && ls -la . && exit 1; \
    fi

# ---- Stage: serve with nginx ----
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/out /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
