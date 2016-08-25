(function(){
    'use strict';

    var app = angular.module('ejdcard');

    app.controller('ConsultaController', ['AuthService','ModalService','$window', function(AuthService, ModalService, $window){
        
        var self = this;

        (function main(){
            if (!AuthService.isLoggedIn()) $window.location.href = "login.html";
        })();

    }]);
})();