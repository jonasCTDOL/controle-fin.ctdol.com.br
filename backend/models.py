from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    incomes = relationship("Income", back_populates="owner")
    expenses = relationship("Expense", back_populates="owner")

class Income(Base):
    __tablename__ = "incomes"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True)
    type = Column(String, index=True) # e.g., 'Salário', 'Diária', 'Freelance'
    value = Column(Float)
    notes = Column(String, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="incomes")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True)
    value = Column(Float)
    type = Column(String, index=True) # e.g., 'Alimentação', 'Transporte', 'Lazer'
    is_installment = Column(Boolean, default=False)
    installment_count = Column(Integer, nullable=True) # Total number of installments
    installment_value = Column(Float, nullable=True) # Value of each installment
    is_recurring = Column(Boolean, default=False)
    recurring_start_date = Column(Date, nullable=True) # Date when recurring payment starts
    notes = Column(String, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="expenses")
