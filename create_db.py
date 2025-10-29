import sqlite3
from pathlib import Path

root = Path(__file__).parent
schema_path = root / 'db' / 'schema.sql'
seed_path = root / 'db' / 'seed.sql'
db_path = root / 'db' / 'sunshine.sqlite3'

print('>> Criando banco em', db_path)
conn = sqlite3.connect(str(db_path))
conn.execute('PRAGMA foreign_keys = ON;')
with open(schema_path, 'r', encoding='utf-8') as f:
    conn.executescript(f.read())
with open(seed_path, 'r', encoding='utf-8') as f:
    conn.executescript(f.read())

cur = conn.cursor()
cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
tables = [r[0] for r in cur.fetchall()]
print('>> Tabelas:', ', '.join(tables))

# Mostrar contagem básica
for tbl in ['fornecedores','suplementos','produtos','estoque','clientes','pedidos','pedido_itens','envios','pagamentos']:
    try:
        cur.execute(f'SELECT COUNT(*) FROM {tbl};')
        count = cur.fetchone()[0]
        print(f'   - {tbl}: {count} registros')
    except Exception as e:
        print(f'   - {tbl}: erro ao contar ({e})')

conn.commit()
conn.close()
print('>> Banco criado com sucesso.')