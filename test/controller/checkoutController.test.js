
import request from 'supertest';
import sinon from 'sinon';
import * as chai from 'chai';
const { expect } = chai;

import app from '../../rest/app.js';
import { equal } from 'assert';
import checkoutService from '../../src/services/checkoutService.js';
import { error } from 'console';

describe('Checkout Controller', () => {
    describe('POST /api/checkout', () => {
        let token;
        beforeEach(async () => {
            const respostaLogin = await request(app)
                .post('/api/users/login')
                .send({
                    email: "alice@email.com",
                    password: "123456"
                })

            token = respostaLogin.body.token;
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
