@echo off
echo Inicializando repositório Git...
git init

echo Adicionando arquivos ao Git...
git add .

echo Fazendo commit inicial...
git commit -m "Initial commit: Linstax - Gerenciamento de Contas Sociais"

echo Configurando repositório remoto...
git remote add origin git@github.com:designativa07/linstax.git

echo Enviando para GitHub...
git branch -M main
git push -u origin main

echo Projeto enviado com sucesso para GitHub!
pause
