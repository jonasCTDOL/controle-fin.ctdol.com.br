from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

# --- User Schemas ---

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

# --- User Schemas ---

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class User(BaseModel):
    id: int

    class Config:
        from_attributes = True # Em Pydantic v1, use orm_mode = True

# --- Token Schemas for Authentication ---

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Income Schemas ---

class IncomeBase(BaseModel):
    date: date
    type: str = Field(..., max_length=50) # e.g., 'Salário', 'Diária', 'Freelance'
    value: float = Field(..., gt=0)
    notes: Optional[str] = Field(None, max_length=255)

class IncomeCreate(IncomeBase):
    pass # Inherits all fields from IncomeBase

class Income(BaseModel):
    id: int
    owner_id: int

    class Config:
        from_attributes = True

# --- Expense Schemas ---

class ExpenseBase(BaseModel):
    date: date
    value: float = Field(..., gt=0)
    type: str = Field(..., max_length=50) # e.g., 'Alimentação', 'Transporte', 'Lazer'
    is_installment: bool = False
    installment_count: Optional[int] = Field(None, gt=0)
    installment_value: Optional[float] = Field(None, gt=0)
    is_recurring: bool = False
    recurring_start_date: Optional[date] = None
    notes: Optional[str] = Field(None, max_length=255)

class ExpenseCreate(ExpenseBase):
    pass # Inherits all fields from ExpenseBase

class Expense(BaseModel):
    id: int
    owner_id: int

    class Config:
        from_attributes = True


# --- Token Schemas for Authentication ---

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Income Schemas ---

class IncomeBase(BaseModel):
    date: date
    type: str = Field(..., max_length=50) # e.g., 'Salário', 'Diária', 'Freelance'
    value: float = Field(..., gt=0)
    notes: Optional[str] = Field(None, max_length=255)

class IncomeCreate(IncomeBase):
    pass # Inherits all fields from IncomeBase

class Income(IncomeBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True
