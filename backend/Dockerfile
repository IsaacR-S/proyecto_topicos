# Base image de Node.js
FROM node:18-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar package.json y package-lock.json (si existe)
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto
EXPOSE 5000

# Comando para iniciar el servidor
CMD ["npm", "start"]