-- Adicionar foreign key constraint na tabela online_quote_items
ALTER TABLE public.online_quote_items
ADD CONSTRAINT fk_online_quote_items_online_quote_id 
FOREIGN KEY (online_quote_id) 
REFERENCES public.online_quotes (id) 
ON DELETE CASCADE;

-- Adicionar foreign key para products (opcional, já que product_id pode ser null)
ALTER TABLE public.online_quote_items
ADD CONSTRAINT fk_online_quote_items_product_id 
FOREIGN KEY (product_id) 
REFERENCES public.products (id) 
ON DELETE SET NULL;