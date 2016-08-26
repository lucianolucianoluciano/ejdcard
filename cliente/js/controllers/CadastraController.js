(function(){
    'use strict';

    var app = angular.module('ejdcard');

    app.controller('CadastraController', ['AuthService','ModalService','$window','RestService', 'ENDPOINTS', 'MoneyService', function(AuthService, ModalService, $window, RestService, ENDPOINTS, MoneyService){
        
        var self = this;

        self.cartao = {};

        self.serverError = false;

        self.serverResponse = false;

        self.hideBtn = false;
        
        self.btnTexto = "Enviar";

        function limpa(){
            self.cartao = {
                nome: "", id: "", valorInicial: "", celular: "(83)9"
            };
        };

        function buttonToggle(){
            self.btnTexto = (self.btnTexto == "Aguarde") ? "Cadastrar" : "Aguarde";
            self.hideBtn = !self.hideBtn;
        };

        (function main(){
            limpa();
            if (!AuthService.isLoggedIn()) $window.location.href = "login.html";
        })();

        function montaCard(id, valorInicial, nome, celular){
            if (typeof id == 'object'){
                return {
                    _id: id.id,
                    balance: id.valorInicial,
                    owner: {
                        name: id.nome,
                        cellphone: id.celular
                    }
                };
            }else{
                return {
                    _id: id,
                    balance: valorInicial,
                    owner: {
                        name: nome,
                        cellphone: celular
                    }
                };
            }
        };

        self.cadastra = function(cartaoData){
            self.serverError = false;
            self.serverResponse = false;
            cartaoData.id = (parseInt(cartaoData.id)).toString();
            cartaoData.valorInicial = MoneyService.novoSaldo("cadastro", 0, cartaoData.valorInicial);
            cartaoData = montaCard(cartaoData)
            buttonToggle();
            var config = {
                method: 'post',
                uri: ENDPOINTS.CARTAO,
                body: cartaoData
            };
            RestService.request(config).then(function(data){
                self.serverResponse = "O cartão <strong>"+data._id+"</strong> foi inserido no nome de <strong>"+data.owner.name+"</strong>.<br/>";
                limpa();
                buttonToggle();
            }, function(err){
                buttonToggle();
                limpa();
                self.serverError = "Erro: " + err;
            });
        };

    }]);
})();