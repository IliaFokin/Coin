import { el } from "redom";

export const atmsBtn = el('button.nav__btn', 'Банкоматы');
export const accountsBtn = el('button.nav__btn', 'Счета');
export const currencyBtn = el('button.nav__btn', 'Валюта');
export const logoutBtn = el('button.nav__btn', 'Выйти')

export const header = el('header.header', [
  el ('.container', [
    el('.header__wrapper', [
      el('h1.header__title', 'Coin.'),
      el('nav.header__nav', [
        atmsBtn,
        accountsBtn,
        currencyBtn,
        logoutBtn,
      ])
    ])
  ])
]);