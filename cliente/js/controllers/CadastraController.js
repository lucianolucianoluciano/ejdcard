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

        self.cadastra = function(cartaoData){
            cartaoData.valorInicial = MoneyService.novoSaldo("cadastro", 0, cartaoData.valorInicial);
            self.serverError = false;
            self.serverResponse = false;
            buttonToggle();
            var config = {
                method: 'post',
                uri: ENDPOINTS.CARTAO,
                body: cartaoData
            };
            RestService.request(config).then(function(data){
                self.serverResponse = "O cartão <strong>"+data._id+"</strong> foi inserido no nome de <strong>"+data.nome+"</strong>.<br/> <span>LOG Nº <strong>"+data.logId+".</strong></span>";
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