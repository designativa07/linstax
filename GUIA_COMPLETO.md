# 📚 Guia Completo - Linstax

## 🚀 Instalação e Configuração

### 1. Configuração do Banco de Dados

Execute o arquivo `MIGRACAO_SQL_PURO.sql` no Supabase SQL Editor para criar:
- Tabelas principais (users_profiles, accounts, categories)
- Tipos customizados (account_type, user_role)
- Políticas RLS (Row Level Security)
- Triggers automáticos

### 2. Configuração do Projeto

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
```

Edite `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 3. Executar o Projeto

```bash
npm run dev
```

Acesse: http://localhost:3000

## 🔐 Sistema de Autenticação

### Login Padrão
- **Email**: `teste@teste.com`
- **Senha**: `123456`

### Criar Novo Usuário
1. Acesse http://localhost:3000/login
2. Clique em "criar uma nova conta"
3. Use um email real e senha
4. O primeiro usuário vira admin automaticamente

### Problemas de Login
Se o login não funcionar:
1. Verifique se executou `MIGRACAO_SQL_PURO.sql`
2. Registre-se com um email diferente
3. Se der erro 500, crie o perfil manualmente no Supabase

## 🗄️ Estrutura do Banco

### Tabelas Principais
- **users_profiles**: Perfis com roles (admin/user)
- **accounts**: Contas de Instagram, WhatsApp e grupos
- **categories**: Categorias para organizar contas

### Políticas RLS
- Usuários comuns: acesso apenas aos próprios registros
- Administradores: acesso total
- Primeiro usuário vira admin automaticamente

## 📱 Funcionalidades

### Dashboard
- Estatísticas das contas
- Gráficos de distribuição por tipo
- Visão geral do sistema

### Minhas Contas
- Adicionar/editar/remover contas
- Tipos: Instagram, WhatsApp, Grupos WhatsApp
- Organização por categorias

### Categorias
- Criar categorias personalizadas
- Definir cores para organização
- Gerenciar contas por categoria

### Administração (apenas admins)
- Ver todas as contas do sistema
- Gerenciar usuários
- Controle total do sistema

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Autenticação**: Supabase Auth
- **Gráficos**: Recharts
- **Ícones**: Heroicons

## 🚀 Deploy

```bash
# Build para produção
npm run build

# Iniciar servidor de produção
npm start
```

## 🔧 Solução de Problemas

### Login não funciona
1. Execute `MIGRACAO_SQL_PURO.sql`
2. Registre-se com email novo
3. Use credenciais: teste@teste.com / 123456

### Erro 500 no registro
1. Crie usuário manualmente no Supabase Dashboard
2. Execute SQL para criar perfil:
```sql
INSERT INTO users_profiles (id, role, display_name)
SELECT id, 'admin'::user_role, 'Admin'
FROM auth.users 
WHERE email = 'seu_email@exemplo.com';
```

### Problemas de navegação
- Verifique se o middleware está funcionando
- Aguarde carregamento completo das páginas
- Limpe cache do navegador se necessário

## 📞 Suporte

Para problemas:
1. Verifique os logs do console do navegador
2. Verifique os logs do servidor Next.js
3. Consulte a documentação do Supabase
4. Abra uma issue no GitHub

---

**Versão**: 1.0  
**Última atualização**: Janeiro 2025
