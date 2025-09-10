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
                  <ListItemText primary={`${i.type} — R$ ${i.value}`} secondary={i.date} />
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
                  <ListItemText primary={`${e.type} — R$ ${e.value}`} secondary={e.date} />
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
