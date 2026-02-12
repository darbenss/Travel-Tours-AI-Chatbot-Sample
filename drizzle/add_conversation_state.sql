-- Migration: Add conversation_state column to conversations table
-- This enables tracking of tour search results and booking context across conversation turns

ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS conversation_state TEXT;

-- Add a comment for clarity
COMMENT ON COLUMN conversations.conversation_state IS 'JSON string storing active tour search results, selected tour ID, and search criteria';
