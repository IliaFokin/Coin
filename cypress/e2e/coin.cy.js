/// <reference types="cypress" />

describe('Coin app', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080');
    cy.get('#login-input').type('developer');
    cy.get('#password-input').type('skillbox');
    cy.get('.login__btn').click();
  })


  it('view accounts list', () => {
    cy.get('.accounts').should('be.visible');
  });

  it('transfer funds', () => {
    cy.get('.btn').eq(2).click();
    cy.get('.info__account-number').should('not.be.empty');
    cy.get('.transaction__input').eq(0).type('68425718057538880137353046');
    cy.get('.transaction__input').eq(1).type('1000');
    cy.get('.transaction__btn').click();
  });

  it('create new account and transfer funds', () => {
    cy.get('.accounts__item').then((accounts) => {
      cy.log(accounts.length);
      cy.get('.accounts__btn').click();
      cy.get('.btn').eq(0).click();
      cy.get('.accounts__item').should('have.length', accounts.length + 1);
      cy.get('.btn').eq(accounts.length + 2).click();
      cy.get('.transaction__input').eq(0).type('74213041477477406320783754');
      cy.get('.transaction__input').eq(1).type('1000');
      cy.get('.transaction__btn').click();
      cy.get('.message__message').contains('Ошибка при переводе средств');
    })
  });
  
})












// cy.then(() => {
//   cy.get('.accounts__btn').click();
//   cy.get('.accounts__item').should('have.length', accounts.length + 1);
// });