from pydantic import BaseModel, Field
from typing import Optional
from datetime import date


# --- User Schemas ---
class UserBase(BaseModel):
    email: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int

    class Config:
        orm_mode = True


# --- Token Schemas for Authentication ---
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


# --- Income Schemas ---
class IncomeBase(BaseModel):
    date: date
    type: str = Field(..., max_length=50)  # e.g., 'Salário', 'Diária', 'Freelance'
    value: float = Field(...)
    notes: Optional[str] = Field(None, max_length=255)


class IncomeCreate(IncomeBase):
    pass


class Income(IncomeBase):
    id: int
    owner_id: int

    class Config:
        orm_mode = True


# --- Expense Schemas ---
class ExpenseBase(BaseModel):
    date: date
    value: float = Field(...)
    type: str = Field(..., max_length=50)  # e.g., 'Alimentação', 'Transporte', 'Lazer'
    is_installment: bool = False
    installment_count: Optional[int] = Field(None, gt=0)
    installment_value: Optional[float] = Field(None, gt=0)
    is_recurring: bool = False
    recurring_start_date: Optional[date] = None
    notes: Optional[str] = Field(None, max_length=255)


class ExpenseCreate(ExpenseBase):
    pass


class Expense(ExpenseBase):
    id: int
    owner_id: int

    class Config:
        orm_mode = True
