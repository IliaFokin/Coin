import { el, setChildren } from "redom";
import { router } from '../index.js';

const monthArr = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
const currentDate = new Date;

export const transactionAccountInput = el('input.transaction__input');
export const transactionAmountInput = el('input.transaction__input');

function createDynamicsTable(account, barAmount = 6) {
  let monthBalance;
  if (barAmount === 6) monthBalance = [0, 0, 0, 0, 0, 0];
  else monthBalance = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
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
        // monthBalance[i] += tran.amount;
        total -= tran.amount;
      };
    })
    // monthBalance[i] = ((Math.floor(monthBalance[i] * 100)) / 100);
    // total -= monthBalance[i];
    monthBalance[i + 1] = total;
    monthBalance[i + 1] = ((Math.floor(monthBalance[i + 1] * 100)) / 100);
  }

  console.log(monthBalance);

  const maxMonthBalance = Math.max(...monthBalance);
  const minMonthBalance = Math.min(...monthBalance);

  const graph = el('.dynamics__graph', [
    el('.dynamics__max', `${maxMonthBalance}`),
    el('.dynamics__min', `${minMonthBalance}`),
  ]);

  for (let i = 5; i >= 0; i --) {
    if (100 * monthBalance[i] / maxMonthBalance < 1) continue; 
    const block = el('.dynamics__block', [
      el('.dynamics__scale', {style: `height: ${100 * monthBalance[i] / maxMonthBalance}%`}),
      el('.dynamics__month', monthArr[startMonth - i].substring(0, 3))
    ])
    graph.append(block);
  }

  const infoDynamics = el('.info__dynamics', [
    el('h3.subtitle', 'Динамика баланса'),
    graph
  ]);

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
    el('.transaction__descr', 'Сумма перевода'),
    transactionAmountInput,
    el('button.btn.transaction__btn', 'Отправить')
  ]);

  transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (transactionAccountInput.value.trim() !== '' && transactionAmountInput.value.trim() !== '') {
      router.navigate(`accounts/${account.account}/transfer`);
    }
  })

  // let monthBalance = [0, 0, 0, 0, 0, 0];
  // let allTransactions = [];
  // let startMonth = currentDate.getMonth() + 1;

  // for (let i = 0; i < account.transactions.length; i++) {
  //   allTransactions.push({
  //     month: account.transactions[i].date.split('T')[0].split('-')[1],
  //     amount: account.transactions[i].from === account.account ? (account.transactions[i].amount * -1) : account.transactions[i].amount,
  //   })
  // }

  // let total = account.balance;

  // for (let i = 0; i < 6; i++) {
  //   const currentMonth = startMonth - i;
  //   allTransactions.forEach(tran => {
  //     if (parseInt(tran.month) === currentMonth) {
  //       monthBalance[i] += tran.amount;
  //     };
  //   })
  //   monthBalance[i] = ((Math.floor(monthBalance[i] * 100)) / 100);
  //   total -= monthBalance[i];
  // }

  // const maxMonthBalance = Math.max(...monthBalance);
  // const minMonthBalance = Math.min(...monthBalance);

  // const graph = el('.dynamics__graph', [
  //   el('.dynamics__max', `${maxMonthBalance}`),
  //   el('.dynamics__min', `${minMonthBalance}`),
  // ]);

  // for (let i = 5; i >= 0; i --) {
  //   if (100 * monthBalance[i] / maxMonthBalance < 1) continue; 
  //   const block = el('.dynamics__block', [
  //     el('.dynamics__scale', {style: `height: ${100 * monthBalance[i] / maxMonthBalance}%`}),
  //     el('.dynamics__month', monthArr[startMonth - i].substring(0, 3))
  //   ])
  //   graph.append(block);
  // }


  

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

  for (let i = 1; i < 11; i++) {
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

  const infoDynamics = createDynamicsTable(account);

  // const infoDynamics = el('.info__dynamics', [
  //       el('h3.subtitle', 'Динамика баланса'),
  //       graph
  //     ]);

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
    infoDynamics.classList.add('info__dynamics--history');
    const ratioTable = el('.info__ratio', 'test');
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