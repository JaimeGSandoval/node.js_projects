const express = require('express');
const route = express.Router();
const accounts = require('./database');

route.get('/accounts', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      userData: accounts,
    },
  });
});

route.get('/accounts/:id', (req, res) => {
  const accountID = Number(req.params.id);
  const account = accounts.find((account) => account.id === accountID);

  if (!account) {
    res.status(404).json({
      status: 'fail',
      data: {
        message: 'Account not found',
      },
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      result,
    },
  });
});

route.post('/accounts', (req, res) => {
  const incomingAccount = req.body;

  accounts.push(incomingAccount);
  res.status(201).json({
    status: 'success',
    message: 'Account added',
    data: {
      accounts,
    },
  });
});

route.put('/accounts/:id', (req, res) => {
  const accountID = Number(req.params.id);
  const body = req.body;
  const account = accounts.find((account) => account.id === accountID);
  const index = accounts.indexOf(account);

  if (!account) {
    res.status(404).json({
      status: 'fail',
      message: 'Account not found',
    });
  }

  const updatedAccount = { ...account, ...body };
  accounts[index] = updatedAccount;

  res.status(201).json({
    status: 'success',
    message: 'Account updated',
    data: {
      updatedAccount,
    },
  });
});

route.delete('/accounts/:id', (req, res) => {
  const accountID = Number(req.params.id);
  const updatedAccounts = accounts.filter(
    (account) => account.id !== accountID
  );

  res.status(200).json({
    status: 'success',
    message: 'Account deleted',
    data: {
      updatedAccounts,
    },
  });
});

module.exports = route;
