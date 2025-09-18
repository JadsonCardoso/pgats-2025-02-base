const request = require('supertest');
const sinon = require('sinon');

let expect;

const app = require('../../rest/app');
const { equal } = require('assert')

const checkoutService = require('../../src/services/checkoutService');
const { error } = require('console');

describe('Checkout Controller', () => {
before(async () => {
    // Importa chai dinamicamente para suportar ESM
    const chai = await import('chai');
    expect = chai.expect;
});
    describe('POST /api/checkout', () => {
        beforeEach(async () => {
            const respostaLogin = await request(app)
                .post('/api/users/login')
                .send({
                    email: "alice@email.com",
                    password: "123456"
                })

            token = respostaLogin.body.token
        })

         it('Checkout com sucesso, recebo 200', async () => {
            const checkoutMock = sinon.stub(checkoutService, 'checkout')
            checkoutMock.returns({
                userId: 1,
                items: 2,
                freight: 0,
                paymentMethod: "credit_card",
                total: 190

            })

            const resposta = await request(app)
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    items: [
                        {
                            "productId": 1,
                            "quantity": 2
                        }
                    ],
                    freight: 0,
                    paymentMethod: "credit_card",
                    cardData: {
                        number: "string",
                        name: "string",
                        expiry: "string",
                        cvv: "string"
                    }
                });

            expect(resposta.status).to.equal(200);
            expect(resposta.body).to.have.property('userId', 1)
            expect(resposta.body).to.have.property('items', 2)
            expect(resposta.body).to.have.property('freight', 0)
            expect(resposta.body).to.have.property('paymentMethod', 'credit_card')
            expect(resposta.body).to.have.property('total', 190)

            sinon.restore();
        })


        it('Checkout com produto não cadastrado, recebo 400', async () => {
            const calculateTotalMock = sinon.stub(checkoutService, 'calculateTotal')
            calculateTotalMock.throws(new Error('Produto não encontrado'))

            const resposta = await request(app)
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    items: [
                        {
                            "productId": 13,
                            "quantity": 2
                        }
                    ],
                    freight: 0,
                    paymentMethod: "boleto",
                    cardData: {
                        number: "string",
                        name: "string",
                        expiry: "string",
                        cvv: "string"
                    }
                });

            expect(resposta.status).to.equal(400);
            expect(resposta.body).to.have.property('error', 'Produto não encontrado')

            sinon.restore();
        })

    })
})
