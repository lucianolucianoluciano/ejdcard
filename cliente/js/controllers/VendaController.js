(function(){
    'use strict';

    var app = angular.module('ejdcard');

    app.controller('VendaController', ['AuthService','ModalService','$window','ENDPOINTS','MoneyService','RestService','monifyFilter', function(AuthService, ModalService, $window, ENDPOINTS, MoneyService, RestService, monifyFilter){
        
        var self = this;

        self.btnTexto = "Vender";

        self.confirma = {};

        self.novoSaldo = 0;

        self.hideBtn = false;

        self.formDisabled = false;

        self.confirmaButtonsDisabled = false;

        function showError(texto){
            self.serverError = texto;
        };

        function limpa(){
            self.serverError = false;
            self.confirmaShow = false;
            self.deuCertoShow = false;
        };

        function buttonToggle(){
            self.btnTexto = (self.btnTexto == "Aguarde") ? "Vender" : "Aguarde";
            self.hideBtn = !self.hideBtn;
        }

        (function main(){
            limpa();
            if (!AuthService.isLoggedIn()) $window.location.href = "login.html";
        })();

        //Função do click
        self.vende = function(cartao){
            limpa();
            buttonToggle();
            self.confirmaButtonsDisabled = false;

            var config = {
                method: 'get',
                uri: ENDPOINTS.CARTAO + '/' + cartao.id
            };

            RestService.request(config).then(function(cartaoServidor){
                if (!cartaoServidor.active){
                    buttonToggle();
                    return showError('O cartão ' + cartao.id + ' já foi finalizado');
                }
                var novoSaldo = MoneyService.novoSaldo("venda", cartaoServidor.balance, cartao.valor);
                if (novoSaldo == -1){
                    buttonToggle();
                    return showError("<b>SALDO INSUFICIENTE<br>Nome: </b>" + cartaoServidor.owner.name + "<br><b>Saldo: </b>" + monifyFilter(cartaoServidor.balance));
                }
                self.formDisabled = true;
                self.confirma = {
                    usuario: cartaoServidor.owner.name,
                    id: cartaoServidor._id,
                    saldo: cartaoServidor.balance,
                    valor: MoneyService.toInt(cartao.valor),
                    proximoSaldo: novoSaldo
                };
                self.confirmaShow = true;
            }, function(err){
                buttonToggle();
                console.log(err);
                showError("Ocorreu um erro :( ")
            });
        }


        self.confirmaConfirmou = function (dados) {
            self.confirmaButtonsDisabled = true;

            var config = {
                method: 'patch',
                uri: ENDPOINTS.CARTAO + '/' + dados.id,
                body: {
                    balance: dados.proximoSaldo
                }
            }
            RestService.request(config).then(function(data){
                self.confirmaButtonsDisabled = true;
                self.formDisabled = false;
                buttonToggle();
                clear();
                self.deuCerto = {
                        usuario: data.owner.name,
                        saldo: data.balance,
                        valor: data.valor,
                        log: data.logId
                };
                self.deuCertoShow = true;
                delete self.cartao;
            }, function(err){
                self.confirmaButtonsDisabled = true;
                self.formDisabled = false;
                buttonToggle();
                clear();
                showError(err);
            });
        };

        self.confirmaCancelou = function(){
            clear();
            buttonToggle();
            self.formDisabled = false;
            delete self.cartao;
        };

    }]);
})();