-- Seed de exemplo para Sunshine Muscle
BEGIN TRANSACTION;

INSERT INTO fornecedores (nome_empresa, cnpj, email, telefone, endereco, estado, cidade, cep, responsavel)
VALUES
 ('Sunshine Muscle ', '08.107.684/0001-37', 'sunshineMuscle@gmail.com', '(41) 99999-0000', 'Av. Fitness, 100', 'SP', 'São Paulo', '01000-000', 'João Silva'),
 ('Power Supply Ltda', '08.107.684/0001-37', 'vendas@powersupply.com', '(21) 98888-1111', 'Rua Energia, 50', 'RJ', 'Rio de Janeiro', '20000-000', 'Maria Souza');

INSERT INTO suplementos (id_fornecedor, nome, email, telefone, cpf, endereco)
VALUES
 (1, 'João Silva', 'joao@sunshine.com', '(11) 99999-0000', '123.456.789-09', 'Av. Fitness, 100'),
 (2, 'Maria Souza', 'maria@powersupply.com', '(21) 98888-1111', '987.654.321-00', 'Rua Energia, 50');

INSERT INTO produtos (produto, peso, data_validade, preco, quantidade_estoque, id_fornecedor, id_suplemento)
VALUES
 ('Whey Chocolate em pó', 0.9, '2026-12-31', 89.90, 100, 1, 1),
 ('Creatina 300g', 0.3, '2027-06-30', 69.90, 50, 1, 1),
 ('Garrafa 1L', 0.25, NULL, 39.90, 200, 2, 2);

INSERT INTO estoque (id_produtos, quantidade)
VALUES
 (1, 100),
 (2, 50),
 (3, 200);

INSERT INTO clientes (nome, email, telefone, cpf, endereco)
VALUES
 ('Ana Lima', 'ana@example.com', '(11) 98888-2222', '111.222.333-44', 'Rua Saúde, 10, São Paulo/SP'),
 ('Bruno Alves', 'bruno@example.com', '(21) 97777-3333', '555.666.777-88', 'Av. Força, 20, Rio de Janeiro/RJ');

INSERT INTO pedidos (id_cliente, status)
VALUES
 (1, 'em_andamento');

-- Itens do pedido 1
INSERT INTO pedido_itens (id_pedido, id_produtos, quantidade, preco_unitario)
VALUES
 (1, 1, 2, 89.90),
 (1, 2, 1, 69.90);

-- Envio do pedido 1
INSERT INTO envios (id_pedido, status, transportadora, codigo_rastreio, endereco_entrega, valor_frete)
VALUES
 (1, 'pendente', 'Correios', 'BR123456789', 'Rua Saúde, 10, São Paulo/SP', 20.00);

-- Pagamento do pedido 1
INSERT INTO pagamentos (id_pedido, valor_pago, metodo, status, transacao, paid_at)
VALUES
 (1, 249.70, 'pix', 'pago', 'TX-001', datetime('now'));

COMMIT;