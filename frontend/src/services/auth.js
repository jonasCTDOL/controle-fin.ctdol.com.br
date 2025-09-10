const API_BASE_URL = window.__API_BASE_URL__ || (process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000');

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      username: email,
      password: password,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Erro ao fazer login');
  }

  const data = await response.json();
  localStorage.setItem('access_token', data.access_token);
  return data;
};

export const register = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Erro ao registrar usuário');
  }

  const data = await response.json();
  return data;
};

export const getToken = () => {
  return localStorage.getItem('access_token');
};

export const removeToken = () => {
  localStorage.removeItem('access_token');
};

// --- API helpers for incomes/expenses ---
export const fetchIncomes = async () => {
  const response = await fetch(`${API_BASE_URL}/incomes/`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
  if (!response.ok) {
    throw new Error('Erro ao buscar entradas');
  }
  return await response.json();
};

export const createIncome = async (income) => {
  const response = await fetch(`${API_BASE_URL}/incomes/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(income),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Erro ao criar entrada');
  }
  return await response.json();
};

export const fetchExpenses = async () => {
  const response = await fetch(`${API_BASE_URL}/expenses/`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  });
  if (!response.ok) {
    throw new Error('Erro ao buscar despesas');
  }
  return await response.json();
};

export const createExpense = async (expense) => {
  const response = await fetch(`${API_BASE_URL}/expenses/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(expense),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Erro ao criar despesa');
  }
  return await response.json();
};
