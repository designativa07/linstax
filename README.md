# Linstax - Gerenciamento de Contas Sociais

Uma aplicação web moderna para gerenciar contas de Instagram, WhatsApp e grupos de WhatsApp de forma organizada.

## 🚀 Funcionalidades

- **Autenticação Segura**: Login com email/senha e Google OAuth
- **Gerenciamento de Contas**: CRUD completo para contas de Instagram, WhatsApp e grupos
- **Categorização**: Organize suas contas em categorias personalizadas com cores
- **Dashboard Interativo**: Estatísticas e gráficos das suas contas
- **Sistema de Permissões**: Administradores podem gerenciar todos os usuários e contas
- **Design Responsivo**: Interface moderna e adaptável para todos os dispositivos

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Autenticação**: Supabase Auth com Google OAuth
- **Gráficos**: Recharts
- **Ícones**: Heroicons

## 📦 Instalação Rápida

1. Clone o repositório e instale as dependências:
```bash
git clone <repository-url>
cd linstax
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

3. Execute as migrações do banco de dados:
- Acesse o Supabase SQL Editor
- Execute o arquivo `MIGRACAO_SQL_PURO.sql`

4. Inicie o servidor:
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🔐 Login Padrão

- **Email**: `teste@teste.com`
- **Senha**: `123456`

## 📚 Documentação Completa

Para instruções detalhadas, configuração avançada e solução de problemas, consulte o [Guia Completo](GUIA_COMPLETO.md).

## 🚀 Deploy

```bash
npm run build
npm start
```

## 📄 Licença

Este projeto está sob a licença MIT.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, abra uma issue ou pull request.