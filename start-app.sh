#!/bin/bash

# Colores para la terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Arrancando el ecosistema Maniquí...${NC}"

# 1. Base de Datos (Docker)
echo -e "${GREEN}📦 Asegurando que la base de datos esté lista...${NC}"
docker compose up -d

echo -e "${BLUE}⏳ Esperando a que MySQL responda...${NC}"
until docker exec maniqui-db mysqladmin ping -h"localhost" -u"root" -p"root" --silent; do
    echo "Esperando 2 segundos..."
    sleep 2
done

# 2. Backend
echo -e "${GREEN}⚙️  Iniciando el Backend...${NC}"
cd backend
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias del backend..."
    pnpm install
fi

# Correr la migración para asegurar que las columnas y datos del MMORPG existen
echo -e "${BLUE}🔄 Ejecutando migración de base de datos...${NC}"
node migrate-rpg.js

# Iniciamos en segundo plano
node index.js &
BACKEND_PID=$!
cd ..

# 3. Frontend
echo -e "${GREEN}🎨 Iniciando el Frontend (Vite)...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias del frontend..."
    pnpm install
fi

# El frontend se queda en primer plano para ver los logs
pnpm run dev

# Al cerrar el script, matamos el proceso del backend
trap "kill $BACKEND_PID" EXIT
