const data = require('../src/bancodedados');

function validar(id, body) {
  if (campoPrenchido(body)) {
    return campoPrenchido(body);
  }

  for (const conta of data.contas) {
    if (conta.numero === id) {
      const erro = {
        mensagem: 'Numero da conta ja registrado!',
        status: 500,
      };
      return erro;
    }

    if (conta.usuario.cpf === body.cpf || conta.usuario.email === body.email) {
      const erro = {
        mensagem: 'Já existe uma conta com o cpf ou e-mail informado!',
        status: 400,
      };
      return erro;
    }
  }
  return false;
}

function campoPrenchido(body) {
  const erro = {
    mensagem: '',
    status: 400,
  };
  if (!body.nome) {
    erro.mensagem = 'Nome é obrigatório!';
  }

  if (!body.cpf) {
    erro.mensagem = 'Cpf é obrigatório!';
  }

  if (!body.data_nascimento) {
    erro.mensagem = 'Data de nascimento é obrigatório!';
  }

  if (!body.telefone) {
    erro.mensagem = 'Teleforne é obrigatório!';
  }

  if (!body.email) {
    erro.mensagem = 'Email é obrigatório!';
  }

  if (!body.senha) {
    erro.mensagem = 'Senha é obrigatório!';
  }

  if (erro.mensagem !== '') {
    return erro;
  }

  return false;
}

function validarContaExistente(numero, body) {
  if (campoPrenchido(body)) {
    return campoPrenchido(body);
  }
  if (encontrarContas(numero)) {
    return encontrarContas(numero);
  }

  for (const conta of data.contas) {
    if (conta.usuario.cpf === body.cpf || conta.usuario.email === body.email) {
      if (conta.numero !== numero) {
        const erro = {
          mensagem: 'Este cpf ou e-mail informado ja está registrado em uma outra conta! Só é permitido uma conta por cpf/e-mail',
          status: 400,
        };
        return erro;
      }
    }
  }
  return false;
}

function encontrarContas(numeroConta) {
  const conta = data.contas.filter((cont) => cont.numero === Number(numeroConta));
  if (conta.length !== 1) {
    if (conta.length > 1) {
      const erro = {
        mensagem: 'Existe mais de uma conta com esse numero!',
        status: 500,
      };
      return erro;
    }
    const erro = {
      mensagem: 'Conta bancária não encontada!',
      status: 404,
    };
    return erro;
  }
  return false;
}

function validarTransacaoDS(body) {
  if (!body.numero_conta || !body.valor) {
    const erro = {
      mensagem: 'O número da conta e o valor são obrigatórios!',
      status: 400,
    };
    return erro;
  }

  if (encontrarContas(body.numero_conta)) {
    return encontrarContas(body.numero_conta);
  }

  if (body.valor <= 0) {
    const erro = {
      mensagem: 'O valor deve ser maior que 0!',
      status: 400,
    };
    return erro;
  }
  return false;
}

function validarTransferencia(body) {
  if (!body.numero_conta_destino || !body.numero_conta_destino) {
    const erro = {
      mensagem: 'Os numeros das contas são obrigatórios!',
      status: 400,
    };
    return erro;
  }
  if (!body.senha || !body.valor) {
    const erro = {
      mensagem: 'A senha e o valor são obrigatórios!',
      status: 400,
    };
    return erro;
  }
  if (body.valor <= 0) {
    const erro = {
      mensagem: 'O valor deve ser maior que 0!',
      status: 400,
    };
    return erro;
  }

  if (encontrarContas(body.numero_conta_origem)) {
    return encontrarContas(body.numero_conta_origem);
  }
  if (encontrarContas(body.numero_conta_destino)) {
    return encontrarContas(body.numero_conta_destino);
  }

  const contaOrigem = data.contas.find((cont) => cont.numero === Number(body.numero_conta_origem));
  const contaDestino = data.contas.find((cont) => cont.numero === Number(body.numero_conta_destino));

  if (!(contaOrigem.usuario.senha === body.senha)) {
    const erro = {
      mensagem: 'Senha invalida!',
      status: 401,
    };
    return erro;
  }
  if (contaOrigem.numero === contaDestino.numero) {
    const erro = {
      mensagem: 'As contas devem ter numeros diferentes!',
      status: 400,
    };
    return erro;
  }
  return false;
}

function validarConsultaSE(req) {
  const numeroConta = Number(req.query.numero_conta);
  const senhaConta = req.query.senha;

  if (!numeroConta || !senhaConta) {
    const erro = {
      mensagem: 'O numero da conta e a senha são obrigatórios',
      status: 400,
    };
    return erro;
  }

  if (encontrarContas(numeroConta)) {
    return encontrarContas(numeroConta);
  }

  const conta = data.contas.find((conta) => conta.numero === Number(req.query.numero_conta));
  if (conta.usuario.senha !== senhaConta) {
    const erro = {
      mensagem: 'Senha invalida!',
      status: 401,
    };
    return erro;
  }
  return false;
}

module.exports = {
  validar,
  validarContaExistente,
  validarTransacaoDS,
  validarTransferencia,
  validarConsultaSE,
  encontrarContas,
};
