import request from 'supertest';
import * as chai from 'chai';
const { expect } = chai;

describe('Checkout Controller', () => {
    describe('POST /api/checkout', () => {
        let token;
        beforeEach(async () => {
            const respostaLogin = await request('http://localhost:3000')
                .post('/api/users/login')
                .send({
                    email: "alice@email.com",
                    password: "123456"
                })

            token = respostaLogin.body.token;
        })

        it('Checkout com sucesso, recebo 200', async () => {
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
                    cardData: {
                        number: "string",
                        name: "string",
                        expiry: "string",
                        cvv: "string"
                    }
                });

            expect(resposta.status).to.equal(200);
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