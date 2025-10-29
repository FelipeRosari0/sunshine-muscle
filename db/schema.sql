-- Sunshine Muscle — Schema SQLite
PRAGMA foreign_keys = ON;

-- Fornecedor
CREATE TABLE IF NOT EXISTS fornecedores (
  id_fornecedor INTEGER PRIMARY KEY AUTOINCREMENT,
  nome_empresa TEXT NOT NULL,
  cnpj TEXT NOT NULL UNIQUE,
  email TEXT,
  telefone TEXT,
  endereco TEXT,
  estado TEXT,
  cidade TEXT,
  cep TEXT,
  responsavel TEXT,
  data_cadastro TEXT DEFAULT (datetime('now'))
);

-- Suplemento (contato/representante associado ao fornecedor)
CREATE TABLE IF NOT EXISTS suplementos (
  id_suplemento INTEGER PRIMARY KEY AUTOINCREMENT,
  id_fornecedor INTEGER NOT NULL,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  cpf TEXT UNIQUE,
  endereco TEXT,
  FOREIGN KEY (id_fornecedor) REFERENCES fornecedores(id_fornecedor) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Produtos
CREATE TABLE IF NOT EXISTS produtos (
  id_produtos INTEGER PRIMARY KEY AUTOINCREMENT,
  produto TEXT NOT NULL,
  peso REAL,
  data_validade TEXT,
  preco NUMERIC NOT NULL,
  quantidade_estoque INTEGER NOT NULL DEFAULT 0,
  id_fornecedor INTEGER,
  id_suplemento INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (id_fornecedor) REFERENCES fornecedores(id_fornecedor) ON UPDATE CASCADE ON DELETE SET NULL,
  FOREIGN KEY (id_suplemento) REFERENCES suplementos(id_suplemento) ON UPDATE CASCADE ON DELETE SET NULL
);

-- Estoque (quantidade atual por produto)
CREATE TABLE IF NOT EXISTS estoque (
  id_estoque INTEGER PRIMARY KEY AUTOINCREMENT,
  id_produtos INTEGER NOT NULL,
  quantidade INTEGER NOT NULL,
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (id_produtos) REFERENCES produtos(id_produtos) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Cliente
CREATE TABLE IF NOT EXISTS clientes (
  id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT UNIQUE,
  telefone TEXT,
  cpf TEXT UNIQUE,
  endereco TEXT
);

-- Pedido
CREATE TABLE IF NOT EXISTS pedidos (
  id_pedido INTEGER PRIMARY KEY AUTOINCREMENT,
  id_cliente INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('em_andamento','concluido','cancelado')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT,
  FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Itens do Pedido
CREATE TABLE IF NOT EXISTS pedido_itens (
  id_item INTEGER PRIMARY KEY AUTOINCREMENT,
  id_pedido INTEGER NOT NULL,
  id_produtos INTEGER NOT NULL,
  quantidade INTEGER NOT NULL,
  preco_unitario NUMERIC NOT NULL,
  FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON UPDATE CASCADE ON DELETE CASCADE,
  FOREIGN KEY (id_produtos) REFERENCES produtos(id_produtos) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Envio
CREATE TABLE IF NOT EXISTS envios (
  id_envio INTEGER PRIMARY KEY AUTOINCREMENT,
  id_pedido INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pendente','despachado','em_transito','entregue','cancelado')),
  transportadora TEXT,
  codigo_rastreio TEXT,
  endereco_entrega TEXT,
  valor_frete NUMERIC,
  data_atualizacao TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Pagamento
CREATE TABLE IF NOT EXISTS pagamentos (
  id_pagamento INTEGER PRIMARY KEY AUTOINCREMENT,
  id_pedido INTEGER NOT NULL,
  valor_pago NUMERIC NOT NULL,
  metodo TEXT NOT NULL CHECK (metodo IN ('card','pix','boleto','debito')),
  status TEXT NOT NULL CHECK (status IN ('pendente','pago','falha','estornado')),
  transacao TEXT,
  paid_at TEXT,
  FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Índices auxiliares
CREATE INDEX IF NOT EXISTS idx_produtos_fornecedor ON produtos(id_fornecedor);
CREATE INDEX IF NOT EXISTS idx_estoque_produto ON estoque(id_produtos);
CREATE INDEX IF NOT EXISTS idx_pedido_cliente ON pedidos(id_cliente);
CREATE INDEX IF NOT EXISTS idx_itens_pedido ON pedido_itens(id_pedido);
CREATE INDEX IF NOT EXISTS idx_itens_produto ON pedido_itens(id_produtos);

-- Triggers para manter produtos.quantidade_estoque sincronizado com estoque
CREATE TRIGGER IF NOT EXISTS trg_estoque_sync_insert
AFTER INSERT ON estoque
BEGIN
  UPDATE produtos SET quantidade_estoque = (SELECT quantidade FROM estoque WHERE id_produtos = NEW.id_produtos)
  WHERE id_produtos = NEW.id_produtos;
END;

CREATE TRIGGER IF NOT EXISTS trg_estoque_sync_update
AFTER UPDATE ON estoque
BEGIN
  UPDATE produtos SET quantidade_estoque = NEW.quantidade
  WHERE id_produtos = NEW.id_produtos;
END;

-- Triggers simples de baixa/estorno de estoque por itens de pedido
CREATE TRIGGER IF NOT EXISTS trg_itens_baixa_estoque
AFTER INSERT ON pedido_itens
BEGIN
  UPDATE estoque SET quantidade = quantidade - NEW.quantidade, updated_at = datetime('now')
  WHERE id_produtos = NEW.id_produtos;
  UPDATE produtos SET quantidade_estoque = (SELECT quantidade FROM estoque WHERE id_produtos = NEW.id_produtos)
  WHERE id_produtos = NEW.id_produtos;
END;

CREATE TRIGGER IF NOT EXISTS trg_itens_estorno_estoque
AFTER DELETE ON pedido_itens
BEGIN
  UPDATE estoque SET quantidade = quantidade + OLD.quantidade, updated_at = datetime('now')
  WHERE id_produtos = OLD.id_produtos;
  UPDATE produtos SET quantidade_estoque = (SELECT quantidade FROM estoque WHERE id_produtos = OLD.id_produtos)
  WHERE id_produtos = OLD.id_produtos;
END;