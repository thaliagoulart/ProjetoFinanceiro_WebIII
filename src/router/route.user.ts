import { Router } from "express";
import { randomUUID } from "node:crypto";
import { Database } from "../database";
import { timeStamp } from "node:console";

const userRoute = Router();

const database = new Database();

const table = "user";

userRoute.get("/", (request, response) => {
  const user = database.select(table);
  response.json(user);
});

userRoute.get("/:id", (request, response) => {
  const { id } = request.params;

  const result = database.select(table, id);


  if (result === undefined)
    response.status(400).json({ msg: "AVISO: Usuário não encontrado!" });

  response.json(result);
});

// Parâmetro que esta vindo do CLIENTE - REQUEST
// Parâmetro que esta indo para o CLIENTE - RESPONSE


// alterar user
userRoute.put("/alterar/:id", (request, response) => {
  const { id } = request.params;
  const { nome, endereco, cpf, saldo, transacao } = request.body;

  const userExist: any = database.select(table, id);
  if (userExist === undefined)
    return response.status(400).json({ msg: "AVISO: Usuário não encontrado!" });

  database.update(table, id, { nome, endereco, cpf, saldo, transacao });

  response.status(201).json({ msg: `AVISO: O ID {${id}} foi alterado no banco!` });
});

// calculo
userRoute.post("/", (request, response) => {
  const { nome, endereco, cpf, saldo, transacao, } = request.body;

  const user = {
    id: randomUUID(),
    nome,
    endereco,
    cpf,
    saldo,
    transacao
  };

  database.insert(table, user);

  response.status(201).json({ msg: "sucesso!" });
});

userRoute.delete("/:id", (request, response) => {
  const { id } = request.params;

  const userExist: any = database.select(table, id);

  if (userExist === undefined)
    return response.status(400).json({ msg: "AVISO: Usuário não encontrado!" });

  database.delete(table, id);

  response
    .status(202)
    .json({ msg: `AVISO: Usuário ${userExist.name} deletado com sucesso!` });
});

userRoute.put('/sacar/:id', (request,response)=>{

  const {id} = request.params
  const {nome, transacao: [{ tipo, valor}]} = request.body

  const userExist:any = database.select(table, id);

  if(userExist === undefined)
  return response.status(400).json(
    {msg:'AVISO: Usuário não encontrado!'});

    let transacao = userExist.transacao
    transacao.push({tipo:"Saque", valor})
    console.log(transacao)
    let saldo = userExist.saldo
    database.update(table, id, {id, nome, saldo: saldo - valor, transacao})

    response.status(201).json(
      {msg: ` ATENÇÃO: Foi sacado o valor de R$${valor} na sua conta!` });

})

userRoute.put('/depositar/:id', (request,response)=>{

  const {id} = request.params
  const {nome, transacao: [{ tipo, valor}]} = request.body

  const userExist:any = database.select(table, id);


  if(userExist === undefined)
  return response.status(400).json(
    {msg:'AVISO: Usuário não encontrado!'});

    let transacao = userExist.transacao
    transacao.push({tipo:"Deposito", valor})
    console.log(transacao)
    let saldo = userExist.saldo
    database.update(table, id, {id, nome, saldo: saldo + valor, transacao})

    response.status(201).json(
      {msg: ` AVISO: Depósito efetuado no valor de: R$${valor}.` });

})

export { userRoute };
