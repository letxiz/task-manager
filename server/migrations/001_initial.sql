BEGIN;

CREATE TABLE topicos (
  id text PRIMARY KEY,
  nome text NOT NULL CHECK (btrim(nome) <> ''),
  cor text,
  posicao integer NOT NULL CHECK (posicao >= 0)
);

CREATE TABLE tarefas (
  id text PRIMARY KEY,
  titulo text NOT NULL CHECK (btrim(titulo) <> ''),
  descricao text NOT NULL DEFAULT '',
  prazo date,
  cor text,
  concluida boolean NOT NULL DEFAULT false,
  topico_id text REFERENCES topicos (id) ON DELETE SET NULL,
  posicao integer NOT NULL CHECK (posicao >= 0)
);

CREATE INDEX tarefas_topico_id_idx ON tarefas (topico_id);

CREATE TABLE consumo_agua (
  dia date PRIMARY KEY,
  meta integer NOT NULL DEFAULT 2500 CHECK (meta BETWEEN 100 AND 10000),
  quantidades integer[] NOT NULL DEFAULT '{}',
  CHECK (
    array_position(quantidades, NULL) IS NULL
    AND 0 < ALL (quantidades)
    AND 1000 >= ALL (quantidades)
  )
);

COMMIT;
