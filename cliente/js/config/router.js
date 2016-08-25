(function(){
    var app = angular.module('ejdcard');

    app.config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise("/main");
    //
    // Now set up the states
    $stateProvider
        .state('main', {
        url: "/main",
        templateUrl: "view/main.html",
        controller: 'MainController as mainCtrl'
        })
        .state('cadastra', {
        url: "/cadastra",
        templateUrl: "view/cadastra.html",
        controller: 'CadastraController as cadastraCtrl'
        })
        .state('venda', {
        url: "/venda",
        templateUrl: "view/venda.html",
        controller: 'VendaController as vendaCtrl'
        })
        .state('recarga', {
        url: "/recarga",
        templateUrl: "view/recarga.html",
        controller: 'RecargaController as recargaCtrl'
        })
        .state('finaliza', {
        url: "/finaliza",
        templateUrl: "view/finaliza.html",
        controller: 'FinalizaController as finalizaCtrl'
        });
    });
})();