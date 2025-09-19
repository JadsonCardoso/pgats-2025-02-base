import { readFile } from 'fs/promises';

// Carrega o JSON de erro de negócio no topo do arquivo (Node.js ES Modules com top-level await)
const testesDeErroDeNegocio = JSON.parse(
    await readFile(
        new URL('../fixture/requisicoes/checkout/postChekoutWithError.json', import.meta.url)
    )
);
import request from 'supertest';
import * as chai from 'chai';
import dotenv from 'dotenv';
dotenv.config();
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
            const respostaLogin = await request(process.env.BASE_URL_REST)
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
            const resposta = await request(process.env.BASE_URL_REST)
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
