import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, Grid, Paper, List, ListItem, ListItemText } from '@mui/material';
import { fetchIncomes, fetchExpenses, createIncome, createExpense, removeToken, getToken } from '../services/auth';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [incomeData, setIncomeData] = useState({ date: '', type: '', value: '' });
  const [expenseData, setExpenseData] = useState({ date: '', type: '', value: '' });
  const navigate = useNavigate();

  // Helpers / cálculos do painel
  const formatCurrency = (v) => {
    const n = Number(v) || 0;
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const calcTotals = () => {
    const totalIncome = incomes.reduce((s, i) => s + (Number(i.value) || 0), 0);
    const totalExpense = expenses.reduce((s, ex) => s + (Number(ex.value) || 0), 0);
    const balance = totalIncome - totalExpense;

    const now = new Date();
    const monthPrefix = now.toISOString().slice(0, 7); // 'YYYY-MM'
    const monthIncome = incomes
      .filter(i => i.date && i.date.startsWith(monthPrefix))
      .reduce((s, i) => s + (Number(i.value) || 0), 0);
    const monthExpense = expenses
      .filter(e => e.date && e.date.startsWith(monthPrefix))
      .reduce((s, e) => s + (Number(e.value) || 0), 0);

    return { totalIncome, totalExpense, balance, monthIncome, monthExpense };
  };

  useEffect(() => {
    if (!getToken()) {
      navigate('/login');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const inc = await fetchIncomes();
      const exp = await fetchExpenses();
      setIncomes(inc);
      setExpenses(exp);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateIncome = async (e) => {
    e.preventDefault();
    try {
      const created = await createIncome({ ...incomeData, value: parseFloat(incomeData.value) });
      setIncomes(prev => [created, ...prev]);
      setIncomeData({ date: '', type: '', value: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    try {
      const created = await createExpense({ ...expenseData, value: parseFloat(expenseData.value) });
      setExpenses(prev => [created, ...prev]);
      setExpenseData({ date: '', type: '', value: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  return (
    <Box sx={{ p: 4 }}>
      <Grid container spacing={2} alignItems="flex-start">
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h4">Dashboard</Typography>
          <Button variant="outlined" color="secondary" onClick={handleLogout}>Logout</Button>
        </Grid>

        {/* Painel de controle / resumo */}
        <Grid item xs={12} md={12}>
          <Paper sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
            {(() => {
              const t = calcTotals();
              return (
                <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="subtitle2">Total Entradas</Typography>
                    <Typography variant="h6">{formatCurrency(t.totalIncome)}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2">Total Despesas</Typography>
                    <Typography variant="h6">{formatCurrency(t.totalExpense)}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2">Saldo</Typography>
                    <Typography variant="h6" color={t.balance < 0 ? 'error.main' : 'success.main'}>{formatCurrency(t.balance)}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2">Mês (Entradas / Saídas)</Typography>
                    <Typography variant="body1">{formatCurrency(t.monthIncome)} / {formatCurrency(t.monthExpense)}</Typography>
                  </Box>
                </Box>
              );
            })()}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Criar Entrada</Typography>
            <Box component="form" onSubmit={handleCreateIncome} sx={{ mt: 2 }}>
              <TextField fullWidth label="Data" type="date" InputLabelProps={{ shrink: true }} value={incomeData.date} onChange={e => setIncomeData({ ...incomeData, date: e.target.value })} />
              <TextField fullWidth label="Tipo" value={incomeData.type} onChange={e => setIncomeData({ ...incomeData, type: e.target.value })} sx={{ mt: 1 }} />
              <TextField fullWidth label="Valor" value={incomeData.value} onChange={e => setIncomeData({ ...incomeData, value: e.target.value })} sx={{ mt: 1 }} />
              <Button type="submit" variant="contained" sx={{ mt: 2 }}>Adicionar Entrada</Button>
            </Box>
          </Paper>

          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6">Entradas</Typography>
            <List>
              {incomes.map(i => (
                <ListItem key={i.id} divider>
                  <ListItemText primary={`${i.type} \u2014 R$ ${i.value}`} secondary={i.date} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Criar Despesa</Typography>
            <Box component="form" onSubmit={handleCreateExpense} sx={{ mt: 2 }}>
              <TextField fullWidth label="Data" type="date" InputLabelProps={{ shrink: true }} value={expenseData.date} onChange={e => setExpenseData({ ...expenseData, date: e.target.value })} />
              <TextField fullWidth label="Tipo" value={expenseData.type} onChange={e => setExpenseData({ ...expenseData, type: e.target.value })} sx={{ mt: 1 }} />
              <TextField fullWidth label="Valor" value={expenseData.value} onChange={e => setExpenseData({ ...expenseData, value: e.target.value })} sx={{ mt: 1 }} />
              <Button type="submit" variant="contained" sx={{ mt: 2 }}>Adicionar Despesa</Button>
            </Box>
          </Paper>

          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6">Despesas</Typography>
            <List>
              {expenses.map(e => (
                <ListItem key={e.id} divider>
                  <ListItemText primary={`${e.type} \u2014 R$ ${e.value}`} secondary={e.date} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
