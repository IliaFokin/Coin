import { el, setChildren } from 'redom';
import { currencyFeed } from './api.js';
import { router } from '../index.js'

const currencyFeedList = el('ul.currency__list.currency__feed');

(async () => {
  const socket = await currencyFeed();
  socket.addEventListener('message', (message) => {
    const currencyAmount = el('.currency__amount', `${JSON.parse(message.data).rate}`)
    if (JSON.parse(message.data).change === 1) currencyAmount.classList.add('currency__amount--up');
    else currencyAmount.classList.add('currency__amount--down');

    const currencyFeedItem = el('li.currency__item', [
      el('.currency__code', `${JSON.parse(message.data).from}/${JSON.parse(message.data).to}`),
      el('.currency__border'),
      currencyAmount
    ])
    currencyFeedList.prepend(currencyFeedItem);
  })

})();


export function renderCurrencyPage(allCurr, userCurrencies) {
  const currencyList = el('ul.currency__list');
  let dropdownFromArr = [];
  let dropdownToArr = [];
  const dropdownFromList = el('ul.dropdown__currency-list');
  const dropdownToList = el('ul.dropdown__currency-list');
  const dropdownFrom = el('.exchange__dropdown', 'BTC');
  const dropdownTo = el('.exchange__dropdown', 'USD');
  console.log(allCurr.payload);
  allCurr.payload.forEach(curr => {
    dropdownToArr.push(el('li.dropdown__currency-item', `${curr}`));
  })
  for (let key in userCurrencies) {
    if (userCurrencies[key].amount === 0) continue;
    const currencyItem = el('li.currency__item', [
      el('.currency__code', userCurrencies[key].code),
      el('.currency__border'),
      el('.currency__amount', userCurrencies[key].amount)
    ]);
    currencyList.append(currencyItem);

    dropdownFromArr.push(el('li.dropdown__currency-item', `${userCurrencies[key].code}`));
  };

  let lastCheckedFrom;
  let lastCheckedTo;

  dropdownFromArr.forEach(item => {
    if (item.textContent === 'BTC') {
      lastCheckedFrom = item;
      item.classList.add('dropdown__currency-item--checked');
    }
    dropdownFromList.append(item);
    item.addEventListener('click', () => {
      lastCheckedFrom.classList.remove('dropdown__currency-item--checked');
      lastCheckedFrom = item;
      item.classList.add('dropdown__currency-item--checked');
      dropdownFromList.classList.remove('dropdown__currency-list--active');
      dropdownFrom.textContent = item.textContent;
    })
  })

  dropdownToArr.forEach(item => {
    if (item.textContent === 'USD') {
      lastCheckedTo = item;
      item.classList.add('dropdown__currency-item--checked');
    }
    dropdownToList.append(item);
    item.addEventListener('click', () => {
      lastCheckedTo.classList.remove('dropdown__currency-item--checked');
      lastCheckedTo = item;
      item.classList.add('dropdown__currency-item--checked');
      dropdownToList.classList.remove('dropdown__currency-list--active');
      dropdownTo.textContent = item.textContent;
    })
  })

  dropdownFrom.addEventListener('click', () => {
    dropdownFromList.classList.toggle('dropdown__currency-list--active');
  });

  dropdownTo.addEventListener('click', () => {
    dropdownToList.classList.toggle('dropdown__currency-list--active');
  });

  const exchangeError = el('.exchange__error');
  const exchangeAmountInput = el('input.exchange__amount-input', { type: 'number' });

  const exchangeForm = el('form.exchange__form', [
    el('.exchange__left', [
      el('.exchange__currency', [
        el('span.exchange__descr', 'Из'),
        el('.exchange__dropdown-wrapper', [dropdownFromList, dropdownFrom]),
        el('span.exchange__descr', 'в'),
        el('.exchange__dropdown-wrapper', [dropdownToList, dropdownTo]),
      ]),
      el('.exchange__amount', [
        el('span.exchange__descr', 'Сумма'),
        exchangeAmountInput
      ])
    ]),
    el('button.btn', 'Отправить'),
    exchangeError
  ]);

  exchangeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    exchangeError.textContent = '';
    if (dropdownFrom.textContent === dropdownTo.textContent) {
      exchangeError.classList.add('exchange__error--active');
      exchangeError.textContent = 'Неккоректная валюта перевода';
    } else if (parseInt(exchangeAmountInput.value) <= 0 || exchangeAmountInput.value === '') {
      exchangeError.classList.add('exchange__error--active');
      exchangeError.textContent = 'Некорректная сумма';
    } else {
      router.navigate(`/currency/${dropdownFrom.textContent}/${dropdownTo.textContent}/${parseInt(exchangeAmountInput.value)}`);
    }
  })

  const container = el('.container', 
    el('.currency', [
      el('h2.sections__title', 'Валютный обменм'),
      el('.currency__wrapper', [
        el('.currency__operations', [
          el('.currency__exchange', [
            el('h3.currency__subtitle', 'Ваши валюты'),
            currencyList
          ]),
          el('.currency__exchange', [
            el('h3.currency__subtitle', 'Обмен валют'),
            exchangeForm
          ])
        ]),
        el('.currency__rates', [
          el('h3.currency__subtitle', 'Изменение курса валют в реальном времени'),
          currencyFeedList
        ])
      ])
    ]));

  return container;
}