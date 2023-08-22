import { el } from "redom";
import { router } from '../index.js';
import MiniSearch from 'minisearch';

const monthArr = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
const currentDate = new Date;

export const transactionAccountInput = el('input.transaction__input.autocomplete-example-container');
export const transactionAmountInput = el('input.transaction__input');



function createDynamicsTable(account, barAmount = 6) {
  let monthBalance;
  let monthIncome;
  let monthOutcome;
  if (barAmount === 6) {
    monthBalance = [0, 0, 0, 0, 0, 0];
    monthIncome = [0, 0, 0, 0, 0, 0];
    monthOutcome = [0, 0, 0, 0, 0, 0];
  } 
  else {
    monthBalance = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    monthIncome = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    monthOutcome = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  } 
  let allTransactions = [];
  let startMonth = currentDate.getMonth() + 1;

  for (let i = 0; i < account.transactions.length; i++) {
    allTransactions.push({
      month: account.transactions[i].date.split('T')[0].split('-')[1],
      amount: account.transactions[i].from === account.account ? (account.transactions[i].amount * -1) : account.transactions[i].amount,
    })
  }

  let total = account.balance;
  monthBalance[0] = total;
  

  for (let i = 0; i < (barAmount - 1); i++) {
    const currentMonth = startMonth - i;
    allTransactions.forEach(tran => {
      if (parseInt(tran.month) === currentMonth) {
        total -= tran.amount;
        if (tran.amount > 0) monthIncome[i] += tran.amount;
        else monthOutcome[i] -= tran.amount;
      };
    })
    monthBalance[i + 1] = total;
    monthBalance[i + 1] = ((Math.floor(monthBalance[i + 1] * 100)) / 100);
  }


  const maxMonthBalance = Math.max(...monthBalance);
  const maxMonthOutcome = Math.max(...monthOutcome);

  const graph = el('.dynamics__graph', [
    el('.dynamics__max', `${maxMonthBalance}`),
    el('.dynamics__min', 0),
  ]);

  const ratioGraph = el('.dynamics__graph', [
    el('.dynamics__max', `${maxMonthBalance}`),
    el('.dynamics__ratio', `${maxMonthOutcome}`),
    el('.dynamics__min', 0),
  ]);

  for (let i = barAmount - 1; i >= 0; i --) {
    if (100 * monthBalance[i] / maxMonthBalance < 1) continue;
    
    let blockMonth = startMonth - (i + 1);
    if ((startMonth - i + 1) < 0) blockMonth = startMonth - i + 13;
    
    const block = el('.dynamics__block', [
      el('.dynamics__scale', {style: `height: ${100 * monthBalance[i] / maxMonthBalance}%`}),
      el('.dynamics__month', monthArr[blockMonth].substring(0, 3))
    ])
    graph.append(block);

    const ratio = Math.floor(monthOutcome[i] / (monthIncome[i] + monthOutcome[i]) * 100);

    const ratioBlock = el('.dynamics__block', [
      el('.dynamics__scale', {style: `height: ${100 * monthBalance[i] / maxMonthBalance}%`}, [
        el('.dynamics__income', {style: `height: ${100 - ratio}%`}),
        el('.dynamics__outcome', {style: `height: ${ratio}%`}),
      ]),
      el('.dynamics__month', monthArr[blockMonth].substring(0, 3))
    ]);

    ratioGraph.append(ratioBlock);
  }



  let infoDynamics;

  if (barAmount === 6) {
    infoDynamics = el('.info__dynamics', [
      el('h3.subtitle', 'Динамика баланса'),
      graph
    ]);
  } else {
    infoDynamics = el('.info__wrapper', [
      el('.info__dynamics .info__dynamics--history', [
        el('h3.subtitle', 'Динамика баланса'),
        graph
      ]),
      el('.info__dynamics .info__dynamics--history', [
        el('h3.subtitle', 'Соотношение входящих исходящих транзакций'),
        ratioGraph
      ])
    ]);
  }
  
  return infoDynamics;
}

export function renderAccountDetailsPage(account, type = 'overview') {

  const backBtn = el('button.btn.back-btn.info-btn', 'Вернуться назад');

  backBtn.addEventListener('click', () => {
    if (type === 'overview') router.navigate('/accounts');
    else router.navigate(`/accounts/${account.account}`);
  })

  const title = el('h2.title', 'Просмотр счёта');
  if ( type === 'history') title.textContent = 'История баланса';

  const transactionSuggestion = el('.transaction__suggestion');

  const transactionError = el('.transaction__error');

  const transactionForm =  el('form.info__transaction', [
    el('h3.subtitle', 'Новый перевод'),
    el('.transaction__descr', 'Номер счета получателя'),
    el('.transaction__wrapper', [
      transactionAccountInput,
      transactionSuggestion,
    ]),
    el('.transaction__descr', 'Сумма перевода'),
    el('.transaction__wrapper', transactionAmountInput),
    el('button.btn.transaction__btn', 'Отправить'),
    transactionError
  ]);


  // localStorage.clear();

  let localHistory = JSON.parse(localStorage.getItem('transactionHistory'));
  if (localHistory === null) localHistory = [];
  let documents = [];
  localHistory.forEach(entry => {
    documents.push({ id: documents.length, account: entry })
  });
  let miniSearch = new MiniSearch({
      fields: ['account'],
      storeFields: ['account']
    })
    
  miniSearch.addAll(documents);
  
  transactionAccountInput.addEventListener('keyup', () => {
    transactionSuggestion.innerHTML = '';
    transactionSuggestion.classList.remove('transaction__suggestion--active');
    const suggest = miniSearch.autoSuggest(transactionAccountInput.value.trim());
    suggest.forEach(suggestion => {
      const suggestionLine = el('.suggestion__line', suggestion.suggestion);
      suggestionLine.addEventListener('click', () => {
        transactionAccountInput.value = suggestionLine.textContent;
        transactionSuggestion.innerHTML = '';
        transactionSuggestion.classList.remove('transaction__suggestion--active');
      })
      transactionSuggestion.append(suggestionLine);
      transactionSuggestion.classList.add('transaction__suggestion--active');
    })
  })

  transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (transactionAccountInput.value.trim() === '' || transactionAmountInput.value.trim() === '') {
      transactionError.textContent = 'Нужно заполнить все поля';
    } else {
      if (!localHistory.includes(transactionAccountInput.value.trim())) {
        localHistory.push(transactionAccountInput.value.trim());
        localStorage.setItem('transactionHistory', JSON.stringify(localHistory));
      }
      transactionError.textContent = '';
      router.navigate(`accounts/${account.account}/transfer`);
    }
  })

  const historyTable = el('.info__history', [
    el('h3.subtitle', 'История баланса'),
    el('.history__table', [
      el('.table__head', [
        el('.table__cell', 'Отправитель'),
        el('.table__cell', 'Получатель'),
        el('.table__cell', 'Сумма'),
        el('.table__cell', 'Дата'),
      ])
    ])
  ]);

  let transactionNumber = 0;
  if (type === 'overview') transactionNumber = 11;
  else transactionNumber = 26;

  for (let i = 1; i < transactionNumber; i++) {
    if (account.transactions.length - i < 0) break;

    let amountCell;
    if (account.transactions[account.transactions.length - i].from === account.account) {
      amountCell = el('.table__cell.table__cell--negative', `- ${account.transactions[account.transactions.length - i].amount} ₽`);
    } else {
      amountCell = el('.table__cell.table__cell--positive', `+ ${account.transactions[account.transactions.length - i].amount} ₽`);
    }

    historyTable.append(el('.table__row', [
      el('.table__cell', account.transactions[account.transactions.length - i].from),
      el('.table__cell', account.transactions[account.transactions.length - i].to),
      amountCell,
      el('.table__cell', `${account.transactions[account.transactions.length - i].date.split('T')[0].split('-')[2]}.${account.transactions[account.transactions.length - i].date.split('T')[0].split('-')[1]}.${account.transactions[account.transactions.length - i].date.split('T')[0].split('-')[0]}`),
    ]))
  };

  let barAmount = 6;
  if (type === 'history') barAmount = 12;
  const infoDynamics = createDynamicsTable(account, barAmount);


  infoDynamics.addEventListener('click', () => {
    router.navigate(`/accounts/${account.account}/history`);
  });

  historyTable.addEventListener('click', () => {
    router.navigate(`/accounts/${account.account}/history`);
  });

  let infoMain;

  if (type === 'overview') {
    infoMain = el('.info__main', [
      transactionForm,
      infoDynamics,
    ]);
  } else {
    infoMain = el('div', [
      infoDynamics,
      // ratioTable
    ]);
  }

  const container = el('.container', 
    el('.info', [
      el('.info__top', [
        el('.info__left', [
          title,
          el('span.info__account-number', `№ ${account.account}`)
        ]),
        el('.info__right', [
          backBtn,
          el('span.info__balance', 'Баланс'),
          el('span.info__balance--value', `${account.balance} ₽`)
        ])
      ]),
      infoMain,
      historyTable
    ]));

  return container;
}