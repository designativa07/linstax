Write-Host "Inicializando repositório Git..." -ForegroundColor Green
git init

Write-Host "Adicionando arquivos ao Git..." -ForegroundColor Yellow
git add .

Write-Host "Fazendo commit inicial..." -ForegroundColor Yellow
git commit -m "Initial commit: Linstax - Gerenciamento de Contas Sociais"

Write-Host "Configurando repositório remoto..." -ForegroundColor Yellow
git remote add origin git@github.com:designativa07/linstax.git

Write-Host "Enviando para GitHub..." -ForegroundColor Yellow
git branch -M main
git push -u origin main

Write-Host "Projeto enviado com sucesso para GitHub!" -ForegroundColor Green
Read-Host "Pressione Enter para continuar"
