(function(){
    'use strict';

    var app = angular.module('ejdcard');

    app.controller('LoginController', ['AuthService','ModalService','$window', function(AuthService, ModalService, $window){
        
        var self = this;

        this.loading = false;

        this.logar = function(loginData){
            self.loading = true;
            AuthService.login(loginData).then(function(data){
                ModalService.sucesso("<h1>Sucesso ao logar</h1><p>Bem-vindo(a) <b>"+data.name+"</b>, você será redirecionado!</p>");           
                setTimeout(function () {
                    $window.location.href =   "index.html";
                }, 2000);
            }, function(err){
                ModalService.erro(err);
                self.loading = false;
            });

            return false;
        };

    }]);
})();