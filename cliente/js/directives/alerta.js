(function(){
    'use strict';
    var app = angular.module('ejdcard');

    app.directive('alerta', function(){
        return {
            restrict: 'E',
            transclude: true,
            scope:{
                erro: '='
            },
            templateUrl: 'view/alerta.html'
        };
    });
})();