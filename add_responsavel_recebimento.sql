-- Adiciona a coluna que armazena o responsável pelo recebimento na devolução
ALTER TABLE registros
ADD COLUMN IF NOT EXISTS responsavel_recebimento text;
