import { readFile } from 'fs/promises';

import request from 'supertest';
import sinon from 'sinon';
import * as chai from 'chai';
const { expect } = chai;

import app from '../../../rest/app.js';
import { equal } from 'assert';
import checkoutService from '../../../src/services/checkoutService.js';
import { error } from 'console';

describe('Checkout Controller', () => {
    describe('POST /api/checkout', () => {
        let token;
        beforeEach(async () => {
            const postLogin = JSON.parse(
                await readFile(
                    new URL('../fixture/requisicoes/login/postLogin.json', import.meta.url)
                )
            );
            const respostaLogin = await request(app)
                .post('/api/users/login')
                .send(postLogin)

            token = respostaLogin.body.token;
        })

        it('Quando envio dados válidos no checkout com pagamento via cartão de crédito, recebo uma resposta 200', async () => {
            const postChekoutSucesso = JSON.parse(
                await readFile(
                    new URL('../fixture/requisicoes/checkout/postChekoutSucesso.json', import.meta.url)
                )
            );
            const checkoutMock = sinon.stub(checkoutService, 'checkout')
            checkoutMock.returns({
                userId: 1,
                items: [
                    {
                        "productId": 1,
                        "quantity": 2
                    }
                ],
                freight: 0,
                paymentMethod: "credit_card",
                total: 190

            })

            const resposta = await request(app)
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}`)
                .send(postChekoutSucesso);

            const respostaEsperada = JSON.parse(
                await readFile(
                    new URL('../fixture/respostas/checkout/quandoEnvioDadosValidosNoCheckoutReceboUmaResposta200.json', import.meta.url)
                )
            );

            expect(resposta.body).to.deep.equal(respostaEsperada)
            expect(resposta.status).to.equal(200);

        })

        it('Quando envio dados válidos no checkout com pagamento via boleto, recebo uma resposta 200', async () => {
            const postChekoutSucesso = JSON.parse(
                await readFile(
                    new URL('../fixture/requisicoes/checkout/postChekoutSucesso.json', import.meta.url)
                )
            );
            const checkoutMock = sinon.stub(checkoutService, 'checkout')
            checkoutMock.returns({
                userId: 1,
                items: [
                    {
                        "productId": 1,
                        "quantity": 2
                    }
                ],
                freight: 0,
                paymentMethod: "boleto",
                total: 190

            })

            const resposta = await request(app)
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}`)
                .send(postChekoutSucesso);

            const respostaEsperada = JSON.parse(
                await readFile(
                    new URL('../fixture/respostas/checkout/quandoEnvioDadosValidosNoCheckoutReceboUmaResposta200.json', import.meta.url)
                )
            );

            respostaEsperada.paymentMethod = "boleto"
            expect(resposta.body).to.deep.equal(respostaEsperada)
            expect(resposta.status).to.equal(200);

        })


        it('Checkout sem preencher os dados do cartão, recebo 400', async () => {
            const checkoutMock = sinon.stub(checkoutService, 'checkout')
            checkoutMock.throws(new Error('Dados do cartão obrigatórios para pagamento com cartão'))

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
                });

            expect(resposta.status).to.equal(400);
            expect(resposta.body).to.have.property('error', 'Dados do cartão obrigatórios para pagamento com cartão')
        });

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
                });

            expect(resposta.status).to.equal(400);
            expect(resposta.body).to.have.property('error', 'Produto não encontrado');
        });

        afterEach( async() => {
            sinon.restore();
        });
    });

});
