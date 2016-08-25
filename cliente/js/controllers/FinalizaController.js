(function(){
    'use strict';

    var app = angular.module('ejdcard');

    app.controller('MainController', ['AuthService','ModalService','$window','ENDPOINTS','RestService', function(AuthService, ModalService, $window, ENDPOINTS, RestService){
        
        var self = this;

        self.btnTexto = "Finalizar";

        self.hideBtn = false;

        self.formDisabled = false;

        self.confirmaButtonsDisabled = false;

        function clear(){
            self.serverError = false;
            self.confirmaShow = false;
            self.deuCertoShow = false;
        };

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
            clear();
            buttonToggle();
            self.confirmaButtonsDisabled = false;
            var config = {
                method: 'get',
                uri: ENDPOINTS.CARTAO + '/' + id
            };
            RestService.request(config).then(function(result){
                if (!result.active){
                    showError('O cartão '+data.id+' já foi finalizado');
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
            dados.estacao = $cookies.get('estacao');
            ejdAPI.putFinaliza(dados).success(function(data){
                if (data.erro == "1"){
                    self.confirmaButtonsDisabled = true;
                    self.formDisabled = false;
                    buttonToggle();
                    clear();
                    showError(data.stringErro);
                }else{
                    self.confirmaButtonsDisabled = true;
                    self.formDisabled = false;
                    buttonToggle();
                    clear();
                    console.log(dados);
                    self.deuCerto = {
                        usuario: data.usuario,
                        saldo: data.saldo,
                        log: data.lognum
                    };
                    self.deuCertoShow = true;
                    delete self.id;
                }
            }).error(function(data){

            });
        };

        self.confirmaCancelou = function(){
            clear();
            buttonToggle();
            self.formDisabled = false;
            delete self.id;
        };

    }]);
})();

    
    
    