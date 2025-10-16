-- Migration to add public access policy for accounts
-- This migration adds a public policy to allow anyone to view accounts without authentication

-- Public policies for viewing accounts (no authentication required)
CREATE POLICY "Anyone can view public accounts" ON accounts
  FOR SELECT USING (true);
