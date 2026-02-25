#!/bin/bash

echo "🔧 Initialisation complète de Postered"
echo "======================================"

# Arrêter et nettoyer
echo ""
echo "1️⃣  Arrêt des services Docker..."
docker compose -f docker-compose.dev.yml down

# Supprimer le volume de la DB pour un reset complet
echo "2️⃣  Nettoyage du volume de base de données..."
docker volume rm postered_db_data 2>/dev/null || true

# Redémarrer les services
echo "3️⃣  Démarrage des services Docker..."
docker compose -f docker-compose.dev.yml up -d --build

# Attendre que Postgres soit prêt
echo "⏳ Attente du démarrage de Postgres (5 secondes)..."
sleep 5

# Aller au dossier backend et exécuter le seed
echo "4️⃣  Remplissage de la base de données..."
cd backend
npm install > /dev/null 2>&1
npm run seed

echo ""
echo "✅ Initialisation terminée!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔌 Backend: http://localhost:4000"
