(function(){
    'use strict';
    var app = angular.module('ejdcard');
    
    app.filter('monify', function() {
        return function(valor) {
            valor = valor || '';
            valor = valor.toString();
            if (valor.length == 2) valor = '0' + valor;
            if (valor.length == 1) valor = '00' + valor;
            return 'R$ ' + valor.slice(0,valor.length-2) + ',' + valor.slice(valor.length-2,valor.length)
        };
    });
    
})();