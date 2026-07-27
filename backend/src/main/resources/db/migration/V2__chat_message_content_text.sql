-- chat_message.content was mapped as a Postgres large object (oid) because the entity used
-- @Lob on a String field. Large objects require an active transaction to read, but the chatbot
-- background thread has none, so every message failed with "Large Objects may not be used in
-- auto-commit mode." Switch to plain text (unlimited length in Postgres, no @Lob needed).

ALTER TABLE public.chat_message ADD COLUMN content_text text;

UPDATE public.chat_message
SET content_text = convert_from(lo_get(content), 'UTF8')
WHERE content IS NOT NULL;

SELECT lo_unlink(content) FROM public.chat_message WHERE content IS NOT NULL;

ALTER TABLE public.chat_message DROP COLUMN content;
ALTER TABLE public.chat_message RENAME COLUMN content_text TO content;
ALTER TABLE public.chat_message ALTER COLUMN content SET NOT NULL;
