(function(){
    'use strict';

    var app = angular.module('ejdcard');

    app.controller('FinalizaController', ['AuthService','ModalService','$window','ENDPOINTS','RestService', function(AuthService, ModalService, $window, ENDPOINTS, RestService){
        
        var self = this;

        self.btnTexto = "Finalizar";

        self.hideBtn = false;

        self.formDisabled = false;

        self.confirmaButtonsDisabled = false;

        function limpa(){
            self.serverError = false;
            self.confirmaShow = false;
            self.deuCertoShow = false;
        };

        this.limpa = limpa;

        function showError(texto){
            self.serverError = texto;
        };

        function buttonToggle(){
            self.btnTexto = (self.btnTexto == "Aguarde") ? "Finalizar" : "Aguarde";
            self.hideBtn = !self.hideBtn;
        };

        (function main(){
            if (!AuthService.isLoggedIn()) $window.location.href = "login.html";
        })();

        self.finaliza = function(id){
            limpa();
            buttonToggle();
            self.confirmaButtonsDisabled = false;
            var config = {
                method: 'get',
                uri: ENDPOINTS.CARTAO + '/' + id
            };
            RestService.request(config).then(function(result){
                if (!result.active){
                    showError('O cartão '+result._id+' já foi finalizado');
                    return buttonToggle();
                }
                self.formDisabled = true;
                self.confirma = {
                        usuario: result.owner.name,
                        id: result._id,
                        saldo: result.balance
                    };
                self.confirmaShow = true;
            }, function(err){
                showError(err);
                return buttonToggle();
            });
        };

        self.confirmaConfirmou = function (dados) {
            self.confirmaButtonsDisabled = true;
            var config = {
                method: 'patch',
                uri: ENDPOINTS.CARTAO + '/' + dados.id,
                body: {
                    active: false
                }
            };
            RestService.request(config).then(function(result){
                self.confirmaButtonsDisabled = true;
                self.formDisabled = false;
                buttonToggle();
                limpa();
                console.log(dados);
                self.deuCerto = {
                    usuario: result.owner.name,
                    saldo: result.balance,
                    log: result.logId
                };
                self.deuCertoShow = true;
                delete self.id;
            }, function(err){
                self.confirmaButtonsDisabled = true;
                self.formDisabled = false;
                buttonToggle();
                limpa();
                showError(data.stringErro);
            });
        };

        self.confirmaCancelou = function(){
            limpa();
            buttonToggle();
            self.formDisabled = false;
            delete self.id;
        };

    }]);
})();

    
    
    