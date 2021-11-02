/* eslint-disable no-plusplus */
const format = require('date-fns/format');
const data = require('../src/bancodedados');
const validacao = require('./validar');

let id = 0;

function ListContas(req, res) {
  if (req.query.senha_banco === 'Cubos123Bank') {
    res.status(200);
    if (data.contas.length > 0) {
      res.json(data.contas);
    } else {
      res.json({
        mensagem: 'Nenhuma conta encontrada',
      });
    }
  } else {
    res.status(400);
    res.json({
      mensagem: 'A senha do banco informada é inválida!',
    });
  }
}

function criarConta(req, res) {
  const usuario = req.body;
  id++;
  const erro = validacao.validar(id, usuario);
  if (erro) {
    if (erro.status !== 500) {
      id--;
    }
    res.status(erro.status);
    res.json({ mensagem: erro.mensagem });
    return;
  }

  const novoUsuario = {
    numero: id,
    saldo: 0,
    usuario: {
      nome: usuario.nome,
      cpf: usuario.cpf,
      data_nascimento: usuario.data_nascimento,
      telefone: usuario.telefone,
      email: usuario.email,
      senha: usuario.senha,
    },
  };
  data.contas.push(novoUsuario);
  res.status(201);
  res.json();
}

function atualizarConta(req, res) {
  const usuario = req.body;
  const erro = validacao.validarContaExistente(Number(req.params.numeroConta), usuario);
  if (erro) {
    res.status(erro.status);
    res.json({ mensagem: erro.mensagem });
    return;
  }

  const conta = data.contas.find((conta) => conta.numero === Number(req.params.numeroConta));

  conta.usuario.nome = usuario.nome;
  conta.usuario.cpf = usuario.cpf;
  conta.usuario.data_nascimento = usuario.data_nascimento;
  conta.usuario.telefone = usuario.telefone;
  conta.usuario.email = usuario.email;
  conta.usuario.senha = usuario.senha;

  res.status(200);
  res.json();
}

function deletarConta(req, res) {
  const erro = validacao.encontrarContas(Number(req.params.numeroConta));
  if (erro) {
    res.status(erro.status);
    res.json({ mensagem: erro.mensagem });
    return;
  }

  const conta = data.contas.find((conta) => conta.numero === Number(req.params.numeroConta));

  if (conta.saldo !== 0) {
    res.status(403);
    res.json({ mensagem: 'A conta só pode ser removida se o saldo for zero!' });
    return;
  }
  data.contas.splice(data.contas.indexOf(conta), 1);
  res.status(200);
  res.json();
}

function depositar(req, res) {
  const erro = validacao.validarTransacaoDS(req.body);
  if (erro) {
    res.status(erro.status);
    res.json({ mensagem: erro.mensagem });
    return;
  }
  const conta = data.contas.find((conta) => conta.numero === Number(req.body.numero_conta));

  if (conta) {
    conta.saldo += req.body.valor;
    const novoDeposito = {
      data: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      numero_conta: req.body.numero_conta,
      valor: req.body.valor,
    };
    data.depositos.push(novoDeposito);
    res.status(201);
    res.json();
  }
}

function saque(req, res) {
  const erro = validacao.validarTransacaoDS(req.body);
  if (erro) {
    res.status(erro.status);
    res.json({ mensagem: erro.mensagem });
    return;
  }
  if (!req.body.senha) {
    res.status(400);
    res.json({ mensagem: 'A senha é obrigatória!' });
    return;
  }
  const conta = data.contas.find((conta) => conta.numero === Number(req.body.numero_conta));

  if (conta.usuario.senha === req.body.senha) {
    if (conta.saldo >= req.body.valor) {
      conta.saldo -= req.body.valor;
      const novoSaque = {
        data: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        numero_conta: req.body.numero_conta,
        valor: req.body.valor,
      };
      data.saques.push(novoSaque);
      res.status(201);
      res.json();
    } else {
      res.status(403);
      res.json({ mensagem: 'Saldo insuficiente!' });
    }
  } else {
    res.status(401);
    res.json({ mensagem: 'Senha invalida!' });
  }
}

function transferencia(req, res) {
  const erro = validacao.validarTransferencia(req.body);
  if (erro) {
    res.status(erro.status);
    res.json({ mensagem: erro.mensagem });
    return;
  }

  const contaOrigem = data.contas.find((conta) => conta.numero === Number(req.body.numero_conta_origem));
  const contaDestino = data.contas.find((conta) => conta.numero === Number(req.body.numero_conta_destino));

  if (contaOrigem.saldo >= req.body.valor) {
    contaOrigem.saldo -= req.body.valor;
    contaDestino.saldo += req.body.valor;
    const novaTransferencia = {
      data: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      numero_conta_origem: req.body.numero_conta_origem,
      numero_conta_destino: req.body.numero_conta_destino,
      valor: req.body.valor,
    };
    data.transferencias.push(novaTransferencia);
    res.status(201);
    res.json();
  } else {
    res.status(403);
    res.json({ mensagem: 'Saldo insuficiente!' });
  }
}

function consultarSaldo(req, res) {
  const erro = validacao.validarConsultaSE(req);
  if (erro) {
    res.status(erro.status);
    res.json({ mensagem: erro.mensagem });
    return;
  }

  const conta = data.contas.find((conta) => conta.numero === Number(req.query.numero_conta));
  const saldoConsultado = {
    saldo: conta.saldo,
  };
  res.status(201);
  res.json(saldoConsultado);
}

function consultarExtrato(req, res) {
  const erro = validacao.validarConsultaSE(req);
  if (erro) {
    res.status(erro.status);
    res.json({ mensagem: erro.mensagem });
    return;
  }

  const conta = data.contas.find((conta) => conta.numero === Number(req.query.numero_conta));

  const depositos = data.depositos.filter((cont) => Number(cont.numero_conta) === conta.numero);
  const saques = data.saques.filter((cont) => Number(cont.numero_conta) === conta.numero);
  const transferenciasEnviadas = data.transferencias.filter((cont) => Number(cont.numero_conta_origem) === conta.numero);
  const transferenciasRecebidas = data.transferencias.filter((cont) => Number(cont.numero_conta_destino) === conta.numero);

  const relatorioConta = {
    depositos,
    saques,
    transferenciasEnviadas,
    transferenciasRecebidas,
  };
  res.status(201);
  res.json(relatorioConta);
}

module.exports = {
  ListContas,
  criarConta,
  atualizarConta,
  deletarConta,
  depositar,
  saque,
  transferencia,
  consultarSaldo,
  consultarExtrato,
};
