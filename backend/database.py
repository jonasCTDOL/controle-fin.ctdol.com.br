from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# URL de conexão para o banco de dados SQLite
# O arquivo do banco se chamará 'finance.db' e ficará na raiz do backend.
SQLALCHEMY_DATABASE_URL = "sqlite:///./finance.db"

# Cria a 'engine' do banco de dados. A engine é o ponto de entrada principal.
# O argumento connect_args é necessário apenas para o SQLite para permitir múltiplos
# threads, como acontece em uma aplicação web.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Cria uma classe SessionLocal que será usada para criar sessões de banco de dados.
# Cada instância de SessionLocal será uma sessão de banco de dados.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Cria uma classe Base que será a base para todas as nossas classes de modelo (tabelas).
Base = declarative_base()
