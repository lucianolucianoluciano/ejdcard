/**
 * Created by Luciano on 12/07/2015.
 */

angular.module("ejdcard", ['ngCookies', 'ngSanitize']);


angular.module("ejdcard").controller("cadastro", ['$scope', '$filter', '$http', '$cookies', 'ejdAPI', function($scope, $filter, $http, $cookies, ejdAPI){
    //Seta o campo Celular para começar já com (83)9
    $scope.cartao = {celular: "(83)9"};
    //Não mostra o alert que será usado para provaveis erros de validação no servidor nem a div de sucesso
    $scope.serverError = false;
    $scope.serverResponse = false;
    // if ($cookies.get('estacao') != 45){
    if (false){
        window.location = "index.html";
    }else{
    //Mecanismo para desativar o botão enquanto o formulário é enviado
    $scope.btnTexto = "Lindos";
    $scope.hideBtn = false;
    var limpar = function(){
        $scope.cartao = {
            nome: "", id: "", valorInicial: "", celular: "(83)9"
        };
    };
    var buttonToggle = function(){
        $scope.btnTexto = ($scope.btnTexto == "Aguarde") ? "Cadastrar" : "Aguarde";
        $scope.hideBtn = !$scope.hideBtn;
    };
    //Função acionada quando é clicado no botão do formulário
    $scope.cadastra = function(cartao){
        //Zera o serverError no caso de erro proveniente do envio anterior
        $scope.serverError = false;
        $scope.serverResponse = false;
        //Desativa o botão
        buttonToggle();
        //Prepara para mandarar a requisição
        estacaoAtual = $cookies.get('estacao');
        //cartao.estacao = '48'; //ESTAVA DANDO UM ERRO NISSO AQUI. ACHO QUE O COOKIE EXPIRA. TAMBÉM NÃO ERA NADA CERTO.
        cartao.estacao = estacaoAtual;
        ejdAPI.postCadastro(cartao).success(function(data){
            console.log(data);
            if (data.erro == "1"){
                $scope.serverError = data.stringErro;
            }else{
                $scope.serverResponse = "O cartão <strong>"+data.id+"</strong> foi inserido no nome de <strong>"+data.nome+"</strong>.<br/> <span>LOG Nº <strong>"+data.log+".</strong></span>";
            }
            limpar();
            buttonToggle();
        }).error(function(data){
            console.log(data);
            alert("Erro HTTP. Chame Luciano.");
            limpar();
            buttonToggle();
        });

    };
}
}]);
