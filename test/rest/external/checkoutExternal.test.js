
const fs = require('fs');
const path = require('path');
const request = require('supertest');
const chai = require('chai');
const dotenv = require('dotenv');
dotenv.config();
const { expect } = chai;
const testesDeErroDeNegocio = require(path.join(__dirname, '../fixture/requisicoes/checkout/postChekoutWithError.json'));

describe('Checkout External', () => {
    describe('POST /api/checkout', () => {
        let token;
        beforeEach(async () => {
            const postLogin = require(path.join(__dirname, '../fixture/requisicoes/login/postLogin.json'));
            const respostaLogin = await request(process.env.BASE_URL_REST)
                .post('/api/users/login')
                .send(postLogin)

            token = respostaLogin.body.token;
        })


        it('Quando envio dados válidos no checkout com pagmento via cartão de crédito, recebo uma resposta 200', async () => {
            const postChekoutSucesso = require(path.join(__dirname, '../fixture/requisicoes/checkout/postChekoutSucesso.json'));
            const resposta = await request(process.env.BASE_URL_REST)
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}`)
                .send(postChekoutSucesso);

            const respostaEsperada = require(path.join(__dirname, '../fixture/respostas/checkout/quandoEnvioDadosValidosNoCheckoutReceboUmaResposta200.json'));

            expect(resposta.body).to.deep.equal(respostaEsperada)
            expect(resposta.status).to.equal(200);
        })

        testesDeErroDeNegocio.forEach(teste => {
            it(`Testando a regra relacionada a ${teste.nomeDoTeste}`, async function () {
                const resposta = await request(process.env.BASE_URL_REST)
                    .post('/api/checkout')
                    .set('Authorization', `Bearer ${token}`)
                    .send(teste.postCheckout);

                expect(resposta.status).to.equal(400);
                expect(resposta.body).to.have.property('error', teste.mensagemEsperada);
            });
        });

    })
})
