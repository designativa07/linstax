# 🚀 ENVIAR PROJETO LINSTAX PARA GITHUB

## ✅ Repositório Confirmado
O repositório https://github.com/designativa07/linstax já existe e está vazio, pronto para receber o projeto.

## 📋 INSTRUÇÕES PASSO A PASSO

### 1. Abra o Terminal/Prompt de Comando
- Pressione `Win + R`
- Digite `cmd` e pressione Enter
- OU abra PowerShell

### 2. Navegue até a pasta do projeto
```bash
cd C:\Users\arm10892\Documents\listanet\linstax
```

### 3. Execute os comandos Git (copie e cole um por vez):

```bash
# Inicializar repositório Git
git init
```

```bash
# Adicionar todos os arquivos
git add .
```

```bash
# Fazer commit inicial
git commit -m "Initial commit: Linstax - Gerenciamento de Contas Sociais"
```

```bash
# Configurar repositório remoto
git remote add origin https://github.com/designativa07/linstax.git
```

```bash
# Definir branch principal
git branch -M main
```

```bash
# Enviar para GitHub
git push -u origin main
```

## 🔐 AUTENTICAÇÃO

Se solicitado:
- **Username**: designativa07
- **Password**: Use um Personal Access Token (não sua senha normal)

### Como criar Personal Access Token:
1. Vá para GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Selecione: repo, workflow, write:packages
4. Copie o token e use como senha

## 📁 O QUE SERÁ ENVIADO

✅ **Código fonte completo** (`src/`)
✅ **Configurações** (`package.json`, `next.config.ts`, etc.)
✅ **Documentação** (`README.md`, `GUIA_COMPLETO.md`)
✅ **Migração do banco** (`MIGRACAO_SQL_PURO.sql`)
✅ **Arquivo `.gitignore`** configurado
✅ **Scripts de deploy** (`push-to-github.bat`, `push-to-github.ps1`)

## 🎉 APÓS O PUSH

O projeto estará disponível em:
**https://github.com/designativa07/linstax**

## 🔄 COMANDOS PARA FUTURAS ATUALIZAÇÕES

```bash
git add .
git commit -m "Descrição da mudança"
git push
```

## ⚠️ SE DER ERRO

### Erro de autenticação:
- Use Personal Access Token em vez de senha
- Verifique se tem permissão no repositório

### Erro de repositório já existe:
```bash
git remote remove origin
git remote add origin https://github.com/designativa07/linstax.git
```

### Erro de branch:
```bash
git branch -M main
git push -u origin main
```

---

**Execute os comandos na ordem e o projeto será enviado com sucesso!** 🚀
