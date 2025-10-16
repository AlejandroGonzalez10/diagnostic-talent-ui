# Etapa 1: Construcción del proyecto
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Copiamos el build generado a la carpeta pública de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Reemplazamos el archivo de configuración de Nginx si quieres rutas personalizadas
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
