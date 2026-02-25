Write-Host "🔧 Initialisation complète de Postered" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "1️⃣  Arrêt des services Docker..." -ForegroundColor Yellow
docker compose -f docker-compose.dev.yml down

Write-Host "2️⃣  Nettoyage du volume de base de données..." -ForegroundColor Yellow
docker volume rm postered_db_data 2>$null | Out-Null

Write-Host "3️⃣  Démarrage des services Docker..." -ForegroundColor Yellow
docker compose -f docker-compose.dev.yml up -d --build

Write-Host "⏳ Attente du démarrage de Postgres (5 secondes)..." -ForegroundColor Gray
Start-Sleep -Seconds 5

Write-Host "4️⃣  Remplissage de la base de données..." -ForegroundColor Yellow
Push-Location backend
npm install | Out-Null
npm run seed
Pop-Location

Write-Host ""
Write-Host "✅ Initialisation terminée!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "🔌 Backend: http://localhost:4000" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Identifiants de test disponibles dans la page de login" -ForegroundColor Green
