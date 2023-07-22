import { el } from "redom";

export const loginInput = el('input.login__input', { type: 'text', placeholder: ' '});
export const loginError = el('label.login__error', 'Неверный логин');
export const passwordInput = el('input.login__input', { type: 'password', placeholder: ' '});
export const passwordError = el('label.password__error', 'Неправильный пароль');
export const errorMessage = el('.error__message');
export const loginForm = el('form.login', [
  el('h2.login__title', 'Вход в аккаунт'),
  errorMessage, 
  el('.login__input-wrapper', [
    loginInput,
    el('label.login__placeholder', 'Логин'),
    loginError
  ]),
  el('.login__input-wrapper', [
    passwordInput,
    el('label.login__placeholder', 'Пароль'),
    passwordError
  ]),
  el('button.login__btn', 'Войти')
])

export function renderLoginForm() {
  const container = el('.container', loginForm);
  return container;
} 
