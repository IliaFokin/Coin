import { el, setChildren } from "redom";
import { router } from '../index.js'

function getDate(date) {
  const monthArr = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const splitDate = date.split('T')[0].split('-');
  const lastTransactionDate = `${splitDate[2]} ${monthArr[splitDate[1] - 1]} ${splitDate[0]}`;
  return lastTransactionDate;
}

export const newAccountBtn = el('button.btn.accounts__btn', 'Создать новый счет');

export function renderAccountsPage(data, sortedField = null) {
  const dropdownAccount = el('li.dropdown__item', 'По номеру');
  const dropdownBalance = el('li.dropdown__item', 'По балансу');
  const dropdownTransaction = el('li.dropdown__item', 'По последней транзакции');
  const dropdown = el('ul.accounts__dropdown', [
    dropdownAccount,
    dropdownBalance,
    dropdownTransaction,
  ]);

  const sort = el('.accounts__sort');
  if (sortedField === 'account') {
    dropdownAccount.classList.add('dropdown__item--checked');
    sort.textContent = dropdownAccount.textContent;
  } else if (sortedField === 'balance') {
    dropdownBalance.classList.add('dropdown__item--checked');
    sort.textContent = dropdownBalance.textContent;
  } else if (sortedField === 'lastTransaction') {
    dropdownTransaction.classList.add('dropdown__item--checked');
    sort.textContent = dropdownTransaction.textContent;
  } else {
    sort.textContent = 'Сортировка';
  }
  
  sort.addEventListener('click', () => {
    sort.classList.toggle('accounts__sort--active');
  });
  
  dropdownAccount.addEventListener('click', () => {
    router.navigate('/accounts/sort/account');
  })
  
  dropdownBalance.addEventListener('click', () => {
    router.navigate('/accounts/sort/balance');
  })
  
  dropdownTransaction.addEventListener('click', () => {
    router.navigate('/accounts/sort/lastTransaction');
  })

  const accountsList = el('ul.accounts__list');
  const container = el('.container', [
    el('.accounts', [
      el('.accounts__top', [
        el('.accounts__menu', [
          el('h2.section__title', 'Ваши счета'),
          el('.accounts__sort-wrapper', [sort, dropdown])
        ]),
        newAccountBtn
      ]),
      accountsList
    ])
  ]);

  data.forEach(account => {
    const listItem = el('li.accounts__item', [
      el('.item__info', [
        el('.item__account', account.account),
        el('.item__sum', `${account.balance} ₽`)
      ]),
      el('.item__actions', [
        el('.item__transaction',`Последняя транзакция: ${account.transactions.length ? getDate(account.transactions[0].date) : '-'}`),
        el('a.btn', {
          href: `accounts/${account.account}`,
          onclick(event) {
            event.preventDefault();
            router.navigate(event.target.getAttribute('href'));
          }}, 'Открыть')
      ])
    ]);
    accountsList.append(listItem);
  });

  return container;
}