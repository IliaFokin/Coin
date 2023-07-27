import { el, setChildren } from "redom";
import { router } from '../index.js';
import autoComplete from "@tarekraafat/autocomplete.js";
import MiniSearch from 'minisearch';
import accessibleAutocomplete from 'accessible-autocomplete';

const monthArr = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
const currentDate = new Date;

export const transactionAccountInput = el('input.transaction__input.autocomplete-example-container');
export const transactionAmountInput = el('input.transaction__input');

// const autoCompleteJS = new autoComplete({ 
//   placeHolder: "Search for Food...",
//     data: {
//         src: ["Sauce - Thousand Island", "Wild Boar - Tenderloin", "Goat - Whole Cut"]
//     },
//     resultItem: {
//         highlight: true,
//     }
// });

const list = [
  'Item 1',
  'Item 2',
  'Item 3',
]

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

  console.log(monthBalance);
  console.log(monthIncome);
  console.log(monthOutcome);

  const maxMonthBalance = Math.max(...monthBalance);
  const minMonthBalance = Math.min(...monthBalance);
  const maxMonthOutcome = Math.max(...monthOutcome);

  const graph = el('.dynamics__graph', [
    el('.dynamics__max', `${maxMonthBalance}`),
    // el('.dynamics__min', `${minMonthBalance}`),
    el('.dynamics__min', 0),
  ]);

  const ratioGraph = el('.dynamics__graph', [
    el('.dynamics__max', `${maxMonthBalance}`),
    el('.dynamics__ratio', `${maxMonthOutcome}`),
    // el('.dynamics__min', `${minMonthBalance}`),
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
    console.log(`month: ${monthArr[blockMonth]}: ${ratio}`);

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
  console.log(account);

  const backBtn = el('button.btn.back-btn.info-btn', 'Вернуться назад');

  backBtn.addEventListener('click', () => {
    if (type === 'overview') router.navigate('/accounts');
    else router.navigate(`/accounts/${account.account}`);
  })

  const title = el('h2.title', 'Просмотр счёта');
  if ( type === 'history') title.textContent = 'История баланса';

  const transactionForm =  el('form.info__transaction', [
    el('h3.subtitle', 'Новый перевод'),
    el('.transaction__descr', 'Номер счета получателя'),
    transactionAccountInput,
    // el('label', {for: `autocomplete-example`}, 'Select an item'),
    // el('#autocomplete-example-container'),
    el('.transaction__descr', 'Сумма перевода'),
    transactionAmountInput,
    el('button.btn.transaction__btn', 'Отправить')
  ]);

  // accessibleAutocomplete({
  //   // container element
  //   element: document.querySelector('#autocomplete-example-container'),
  //   // input id
  //   id: 'autocomplete-example',
  //   // data source
  //   source: list
  // })
  // // use select box
  // accessibleAutocomplete.enhanceSelectElement({
  //   selectElement: document.querySelector('#list')
  // })

  transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (transactionAccountInput.value.trim() !== '' && transactionAmountInput.value.trim() !== '') {
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
      ratioTable
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