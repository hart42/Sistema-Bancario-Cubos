const express = require('express');
const controlador = require('../controladores/controlador');

const roteador = express();

roteador.get('/contas', controlador.ListContas);
roteador.post('/contas', controlador.criarConta);
roteador.put('/contas/:numeroConta/usuario', controlador.atualizarConta);
roteador.delete('/contas/:numeroConta', controlador.deletarConta);
roteador.post('/transacoes/depositar', controlador.depositar);
roteador.post('/transacoes/sacar', controlador.saque);
roteador.post('/transacoes/transferir', controlador.transferencia);
roteador.get('/contas/saldo', controlador.consultarSaldo);
roteador.get('/contas/extrato', controlador.consultarExtrato);

module.exports = roteador;
