# 🚀 Como Enviar o Projeto para GitHub

## Opção 1: Executar Script Automático

### Windows (CMD):
```bash
push-to-github.bat
```

### Windows (PowerShell):
```powershell
.\push-to-github.ps1
```

## Opção 2: Comandos Manuais

Execute os seguintes comandos no terminal dentro da pasta `linstax`:

```bash
# 1. Inicializar repositório Git
git init

# 2. Adicionar todos os arquivos
git add .

# 3. Fazer commit inicial
git commit -m "Initial commit: Linstax - Gerenciamento de Contas Sociais"

# 4. Configurar repositório remoto
git remote add origin git@github.com:designativa07/linstax.git

# 5. Enviar para GitHub
git branch -M main
git push -u origin main
```

## ⚠️ Pré-requisitos

1. **Git instalado** no seu sistema
2. **SSH configurado** para GitHub (ou use HTTPS)
3. **Acesso ao repositório** `designativa07/linstax`

## 🔧 Se usar HTTPS em vez de SSH:

Substitua a URL do repositório por:
```bash
git remote add origin https://github.com/designativa07/linstax.git
```

## 📁 Arquivos Incluídos

- ✅ Código fonte completo (`src/`)
- ✅ Configurações do projeto (`package.json`, `next.config.ts`, etc.)
- ✅ Documentação (`README.md`, `GUIA_COMPLETO.md`)
- ✅ Migração do banco (`MIGRACAO_SQL_PURO.sql`)
- ✅ Arquivo `.gitignore` configurado

## 🎉 Após o Push

O projeto estará disponível em:
https://github.com/designativa07/linstax

## 🔄 Para Futuras Atualizações

```bash
git add .
git commit -m "Descrição da mudança"
git push
```
