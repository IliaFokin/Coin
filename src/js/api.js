export async function authentication(login, password) {
  return await fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      login,
      password
    }),
  }).then(res => res.json());
}

export async function accounts(token) {
  return await fetch('http://localhost:3000/accounts', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${token}`,
    }
  }).then(res => res.json());
}

export async function accountInfo(account, token) {
  return await fetch(`http://localhost:3000/account/${account}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${token}`,
    }
  }).then(res => res.json());
}

export async function createAccount(token) {
  return await fetch('http://localhost:3000/create-account', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${token}`
    }
  }).then(res => res.json());
}

export async function transferFunds(from, to, amount, token) {
  return await fetch('http://localhost:3000/transfer-funds', {
    method: 'POST',
    body: JSON.stringify({
      from,
      to,
      amount,
    }),
    headers: {
      'Content-Type': 'application/json',
      authorization: `Basic ${token}`,
    },
  }).then((res) => res.json());
}

export async function allCurrencies() {
  return await fetch('http://localhost:3000/all-currencies', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  }).then(res => res.json());
}

export async function currencies(token) {
  return await fetch('http://localhost:3000/currencies', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${token}`,
    }
  }).then(res => res.json());
}

export async function currencyBuy(from, to, amount, token) {
  return await fetch('http://localhost:3000/currency-buy', {
    method: 'POST',
    body: JSON.stringify({
      from,
      to,
      amount,
    }),
    headers: {
      'Content-Type': 'application/json',
      authorization: `Basic ${token}`,
    }
  }).then(res => res.json());
}

export async function bankLocation() {
  return await fetch('http://localhost:3000/banks').then(res => res.json());
}

export async function currencyFeed() {
  return new WebSocket('ws://localhost:3000/currency-feed');
}



// Authorization: 'Basic ZGV2ZWxvcGVyOnNraWxsYm94'