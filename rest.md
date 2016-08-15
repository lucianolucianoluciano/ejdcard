1. implementar JWT.

GET /:id
    Recupera os dados de um objeto Cartão com o id infomrado

POST /
    Cadastra um Cartão com os seguintes dados informados:
    ```
        {"nome": "Luciano de Oliveira Júnior", 
         "celular": "(83)98827-2999",
         "id": "210",
         "valorInicial": "12,50"}
    ```

    Não deve existir um Cartão com o mesmo id
    O nome do proprietário do Cartão deve ter mais que 10 caracteres
    O número do id deve estar entre 1 e 700
    O valor inicial deve ser informado, mesmo que com 0,0

PUT /pre
    Checa as precondiçoes para uma futura compra com o cartão, enviando o núemro 
    e o valor pretendido. Esse recurso deve ser substituido!
    ```
     {"id": "211", 
      "valor": "10,00"}
    ```
      O cartão com o ID deve existir
      O cartão deve estar com o status ATIVO (é desativado no fim do evento)
      O valor deve ser válido

PUT /
    Faz a venda (alterando o saldo do cartão). 
    ```
    {"id": "210", 
     "valor": "2,50", 
     "saldo": "10,00",
     "proximoSaldo": "7,50" }
     ```

PUT /recarga
    Realiza uma recarga (alterando o saldo do cartão)
    ```
    {"id": "210", 
     "valor": "2,50", 
     "saldo": "10,00",
     "proximoSaldo": "12,50" }
     ```
PUT /finaliza
    Desativa o Cartão (alterando o status do cartão para inativo)

DELETE /:id

Quase todas as requisições de resposta enviam o número do log da operação.

Objeto Cartão

{"_id": String,
 "balance": Number, 
 "owner": {
     "name": String,
     "cellphone": String
    },
 "active": Boolean
 }

 Objeto Log 

{"_id": String,
 "type": String,
 "timestamp": Number, 
 "cardNumber": String,
 "station": String,
 "balanceBefore": Number,
 "balanceAfter": Number
 }

