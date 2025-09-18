import { readFile } from 'fs/promises';
import request from 'supertest';
import * as chai from 'chai';
const { expect } = chai;

describe('Checkout External', () => {
    describe('POST /api/checkout', () => {
        let token;
        beforeEach(async () => {

            const postLogin = JSON.parse(
                await readFile(
                    new URL('../fixture/requisicoes/login/postLogin.json', import.meta.url)
                )
            );
            const respostaLogin = await request('http://localhost:3000')
                .post('/api/users/login')
                .send(postLogin)

            token = respostaLogin.body.token;
        })


        it('Quando envio dados válidos no checkout com pagmento via cartão de crédito, recebo uma resposta 200', async () => {
            const postChekoutSucesso = JSON.parse(
                await readFile(
                    new URL('../fixture/requisicoes/checkout/postChekoutSucesso.json', import.meta.url)
                )
            );
            const resposta = await request('http://localhost:3000')
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

        it('Checkout sem preencher os dados do cartão, recebo 400', async () => {

            const resposta = await request('http://localhost:3000')
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
        })


        it('Checkout com produto não cadastrado, recebo 400', async () => {

            const resposta = await request('http://localhost:3000')
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
        })

    })
})
