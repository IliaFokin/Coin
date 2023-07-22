import './css/normalize.css';
import './css/style.css';
import { el, setChildren } from "redom";
import Navigo from 'navigo';
import { header, atmsBtn, accountsBtn, currencyBtn, logoutBtn } from './js/header.js';
import { renderLoginForm, loginForm, loginInput, passwordInput, loginError, passwordError, errorMessage } from './js/login.js';
import { 
  authentication,
  accounts,
  accountInfo,
  createAccount,
  transferFunds,
  allCurrencies,
  currencies,
  currencyBuy,
  bankLocation,
  currencyFeed
} from './js/api.js';
import { renderAccountsPage, newAccountBtn } from './js/account-page.js';
import { renderCurrencyPage }  from './js/currency-page.js';
import { renderAccountDetailsPage, transactionAccountInput, transactionAmountInput } from './js/account-details.js';
import { renderMap } from './js/map.js';

export const router = new Navigo('/');
let token = 0;
const main = el('main.main');
setChildren(window.document.body, [header, main]);


(async () => {
  // export const socket = await currencyFeed();
  // const socket = await currencyFeed();
  // console.log(socket);
  // socket.addEventListener('message', (message) => {
  //   if (JSON.parse(message.data).from === 'BTC') console.log(JSON.parse(message.data));
  //   console.log(JSON.parse(message.data).from);
  // })

  // const test = await transferFunds('74213041477477406320783754', '25812101014840716720083771', 2000, 'ZGV2ZWxvcGVyOnNraWxsYm94');
  // console.log(test);

  // const test = await allCurrencies();
  // console.log(test);

  // const test2 = await currencies('ZGV2ZWxvcGVyOnNraWxsYm94');
  // console.log(test2);
  // router.navigate('/');

  // const link = document.createElement('link');
  // link.rel = 'stylesheet';
  // link.href = 'custom-select.css';
  // link.addEventListener('load', () => resolve());
})();


function renderPage(func) {
  main.innerHTML = '';
  setChildren(main, func);
}


// login

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  token = 'ZGV2ZWxvcGVyOnNraWxsYm94';
  router.navigate('/accounts');

  // if (loginInput.value.trim().length >= 6 && passwordInput.value.trim().length >= 6) {
    
  //   const response = await authentication(loginInput.value, passwordInput.value);
    
  //   if (response.payload) {
  //     token = response.payload.token;
  //     router.navigate('/accounts');
  //     loginInput.value = '';
  //     loginError.classList.remove('error__show');
  //     passwordError.classList.remove('error__show');
  //     errorMessage.textContent = '';
  //   } else {
  //     if (response.error === 'No such user') {
  //       loginInput.value = '';
  //       loginError.classList.add('error__show');
  //     }
  //     else {
  //       passwordInput.value = '';
  //       passwordError.classList.add('error__show');
  //     }
  //   }
  // } else {
  //   errorMessage.textContent = 'Некорректный логин/пароль';
  // }
  // passwordInput.value = '';
});


// header buttons 

accountsBtn.addEventListener('click', () => {
  router.navigate('/accounts');
})

currencyBtn.addEventListener('click', () => {
  router.navigate('currency');
})

atmsBtn.addEventListener('click', () => {
  router.navigate('map');
})

logoutBtn.addEventListener('click', () => {
  router.navigate('/');
})


// accounts

function sortArr(arr, prop) {
  let sortedArr = arr.sort((a, b) => {
    if (a[prop] > b[prop]) return -1;
  });
  return sortedArr;
}

async function sortAccountList(prop) {
  const accountList = await accounts(token).then(res => res.payload);
  
  if (prop === 'lastTransaction') {
    accountList.forEach(account => {
      account.transactions.length ?
        account.lastTransaction = account.transactions[0].date :
        account.lastTransaction = '-';
    })
  }

  const accountListSorted = sortArr(accountList, prop);
  renderPage(renderAccountsPage(accountListSorted, prop));
}


// account-details 

// backBtn.addEventListener('click', () => {
//   router.navigate('/accounts');
// })



// router

router.on('/', () => {
  token = 0;
  renderPage(renderLoginForm());
});

router.on('map', async () => {
  const data = await bankLocation().then(data => data.payload);
  main.innerHTML = '';
  setChildren(main, await renderMap(data));
});

router.on('currency', async () => {
  if (token === 0) {
    router.navigate('/');
  } else {
    const allCurr = await allCurrencies();
    const userCurrencies = await currencies(token).then(res => res.payload);
    renderPage(renderCurrencyPage(allCurr, userCurrencies));
  }
})

router.on('/currency/:from/:to/:amount', async ({ data: { from, to, amount } }) => {
  await currencyBuy(from, to, amount, token).then(router.navigate('/currency'));
})

router.on('/accounts', async () => {
  if (token === 0) router.navigate('/');
  else {
    const accountList = await accounts(token).then(res => res.payload);
    renderPage(renderAccountsPage(accountList));
  }
});

router.on('/accounts/sort/:field', ({ data: {field} }) => {
  if (token === 0) router.navigate('/');
  else {
    sortAccountList(field);
  }
});

router.on('/accounts/:id', async ({ data: {id} }) => {
  if (token === 0) router.navigate('/');
  else {
    const accountData = await accountInfo(id, token).then(res => res.payload);
    renderPage(renderAccountDetailsPage(accountData));
  }
});

router.on('/accounts/:id/history', async ({ data: {id} }) => {
  if (token === 0) router.navigate('/');
  else {
    const accountData = await accountInfo(id, token).then(res => res.payload);
    renderPage(renderAccountDetailsPage(accountData, 'history'));
  }
});

router.on('/accounts/:id/transfer', async ({ data: {id} }) => {
  transferFunds(id, transactionAccountInput.value, transactionAmountInput.value, token);
  transactionAccountInput.value = '';
  transactionAmountInput.value = '';
  router.navigate(`/accounts/${id}`);
})

router.resolve();