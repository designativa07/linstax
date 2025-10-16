-- Script para adicionar Foreign Keys e resolver problemas de relacionamento
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar se as foreign keys existem
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('accounts', 'categories');

-- 2. Adicionar foreign key para accounts -> users_profiles (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'accounts_user_id_fkey'
    ) THEN
        ALTER TABLE accounts 
        ADD CONSTRAINT accounts_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users_profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Adicionar foreign key para accounts -> categories (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'accounts_category_id_fkey'
    ) THEN
        ALTER TABLE accounts 
        ADD CONSTRAINT accounts_category_id_fkey 
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 4. Adicionar foreign key para categories -> users_profiles (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'categories_user_id_fkey'
    ) THEN
        ALTER TABLE categories 
        ADD CONSTRAINT categories_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users_profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 5. Verificar se as foreign keys foram criadas
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('accounts', 'categories');

-- 6. Testar consulta com join (deve funcionar após adicionar foreign keys)
SELECT 
    a.id,
    a.name,
    a.type,
    u.display_name,
    c.name as category_name
FROM accounts a
LEFT JOIN users_profiles u ON a.user_id = u.id
LEFT JOIN categories c ON a.category_id = c.id
LIMIT 5;
