from datetime import timedelta
from typing import List # Removed Annotated

import os
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from . import models, schemas, security
from .database import SessionLocal, engine

# Cria as tabelas no banco de dados ao iniciar a aplicação
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API de Controle Financeiro",
    description="API para gerenciar finanças pessoais, registrar entradas e saídas, e visualizar dados.",
    version="0.1.0"
)

# Configura CORS para permitir chamadas do frontend
_origins_env = os.getenv('FRONTEND_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173')
if _origins_env.strip() == '*':
    _allow_origins = ["*"]
else:
    _allow_origins = [o.strip() for o in _origins_env.split(',') if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OAuth2PasswordBearer para lidar com o esquema de segurança OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Dependency para obter a sessão do banco de dados
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Dependency para obter o usuário atual
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)): # Changed
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = security.jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except Exception:
        # Decodificação de token falhou
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    return user

# --- Endpoints ---

@app.get("/")
def read_root():
    """Endpoint raiz para verificar se a API está online."""
    return {"status": "API Online", "message": "Bem-vindo à API de Controle Financeiro!"}

@app.post("/users/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)): # Changed
    """Registra um novo usuário."""
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email já registrado")
    
    hashed_password = security.get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)): # Changed
    """Cria um token de acesso para o usuário."""
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me/", response_model=schemas.User)
async def read_users_me(current_user: schemas.User = Depends(get_current_user)): # Changed
    """Retorna informações do usuário logado."""
    return current_user

# --- Income Endpoints ---

@app.post("/incomes/", response_model=schemas.Income)
def create_income(
    income: schemas.IncomeCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) # Changed
):
    """Cria um novo registro de entrada para o usuário logado."""
    db_income = models.Income(**income.dict(), owner_id=current_user.id)
    db.add(db_income)
    db.commit()
    db.refresh(db_income)
    return db_income

@app.get("/incomes/", response_model=List[schemas.Income])
def read_incomes(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) # Changed
):
    """Retorna todos os registros de entrada do usuário logado."""
    incomes = db.query(models.Income).filter(models.Income.owner_id == current_user.id).offset(skip).limit(limit).all()
    return incomes

@app.get("/incomes/{income_id}", response_model=schemas.Income)
def read_income(
    income_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) # Changed
):
    """Retorna um registro de entrada específico do usuário logado."""
    db_income = db.query(models.Income).filter(
        models.Income.id == income_id, models.Income.owner_id == current_user.id
    ).first()
    if db_income is None:
        raise HTTPException(status_code=404, detail="Entrada não encontrada")
    return db_income

@app.put("/incomes/{income_id}", response_model=schemas.Income)
def update_income(
    income_id: int,
    income: schemas.IncomeCreate, # Using IncomeCreate for update as well
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) # Changed
):
    """Atualiza um registro de entrada existente do usuário logado."""
    db_income = db.query(models.Income).filter(
        models.Income.id == income_id, models.Income.owner_id == current_user.id
    ).first()
    if db_income is None:
        raise HTTPException(status_code=404, detail="Entrada não encontrada")
    
    for key, value in income.dict().items():
        setattr(db_income, key, value)
    
    db.add(db_income)
    db.commit()
    db.refresh(db_income)
    return db_income

@app.delete("/incomes/{income_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_income(
    income_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) # Changed
):
    """Deleta um registro de entrada do usuário logado."""
    db_income = db.query(models.Income).filter(
        models.Income.id == income_id, models.Income.owner_id == current_user.id
    ).first()
    if db_income is None:
        raise HTTPException(status_code=404, detail="Entrada não encontrada")
    
    db.delete(db_income)
    db.commit()

# --- Expense Endpoints ---


@app.post("/expenses/", response_model=schemas.Expense)
def create_expense(
    expense: schemas.ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Cria um novo registro de despesa para o usuário logado."""
    db_expense = models.Expense(**expense.dict(), owner_id=current_user.id)
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense


@app.get("/expenses/", response_model=List[schemas.Expense])
def read_expenses(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Retorna todos os registros de despesa do usuário logado."""
    expenses = db.query(models.Expense).filter(models.Expense.owner_id == current_user.id).offset(skip).limit(limit).all()
    return expenses


@app.get("/expenses/{expense_id}", response_model=schemas.Expense)
def read_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Retorna um registro de despesa específico do usuário logado."""
    db_expense = db.query(models.Expense).filter(models.Expense.id == expense_id, models.Expense.owner_id == current_user.id).first()
    if db_expense is None:
        raise HTTPException(status_code=404, detail="Despesa não encontrada")
    return db_expense


@app.put("/expenses/{expense_id}", response_model=schemas.Expense)
def update_expense(
    expense_id: int,
    expense: schemas.ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Atualiza um registro de despesa existente do usuário logado."""
    db_expense = db.query(models.Expense).filter(models.Expense.id == expense_id, models.Expense.owner_id == current_user.id).first()
    if db_expense is None:
        raise HTTPException(status_code=404, detail="Despesa não encontrada")
    for key, value in expense.dict().items():
        setattr(db_expense, key, value)
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense


@app.delete("/expenses/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Deleta um registro de despesa do usuário logado."""
    db_expense = db.query(models.Expense).filter(models.Expense.id == expense_id, models.Expense.owner_id == current_user.id).first()
    if db_expense is None:
        raise HTTPException(status_code=404, detail="Despesa não encontrada")
    db.delete(db_expense)
    db.commit()