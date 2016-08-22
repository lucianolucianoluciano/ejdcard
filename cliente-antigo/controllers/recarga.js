/**
 * Created by Luciano on 19/07/2015.
 */
angular.module("ejdcard", ['ngCookies', 'ngSanitize']);
angular.module("ejdcard").controller("recarga", ['$scope', '$filter', '$http', '$cookies', 'ejdConfig', 'ejdAPI', function($scope, $filter, $http, $cookies, ejdConfig, ejdAPI){
    //Não mostra o alert que será usado para provaveis erros de validação no servidor nem a div de sucesso
    var clear = function(){
        $scope.serverError = false;
        $scope.confirmaShow = false;
        $scope.deuCertoShow = false;
    };
    $scope.limpar = function(){
        $scope.serverError = false;
        $scope.confirmaShow = false;
        $scope.deuCertoShow = false;
    };
    clear();
    var showError = function(texto){
        $scope.serverError = texto;
    };
    // if ($cookies.get('estacao') != 45){
        if (false){
        window.location = "index.html";
    }else{
    //Mecanismo para desativar o botão enquanto o formulário é enviado
    $scope.btnTexto = "Crédito";
    $scope.hideBtn = false;
    $scope.formDisabled = false;
    $scope.confirmaButtonsDisabled = false;
    var buttonToggle = function(){
        $scope.btnTexto = ($scope.btnTexto == "Aguarde") ? "Crédito" : "Aguarde";
        $scope.hideBtn = !$scope.hideBtn;
    };
    //Função do click
    $scope.credito= function(cartao){
        clear();
        buttonToggle();
        $scope.confirmaButtonsDisabled = false;
        var credito = parseFloat(cartao.valor.replace(",","."));
        if (credito == "0" || credito == "0.0" || credito == "00.00" || credito == "0.00"){
                showError('Insira um valor maior que 0 reais');
                buttonToggle();
        }else{
        var idCartao = cartao.id;
        ejdAPI.getCartao(idCartao).success(function(data){
            if (data.erro == "1"){
                showError(data.stringErro);
                buttonToggle();
            }else if (data.ativo == "0") {
                showError('O cartão ' + data.id + ' já foi finalizado');
                buttonToggle();
            }else{
                $scope.formDisabled = true;
                proximo = parseFloat(data.saldo) + credito;
                $scope.confirma = {
                    usuario: data.usuario,
                    id: data.id,
                    saldo: data.saldo,
                    valor: credito,
                    proximoSaldo: proximo
                };
                $scope.confirmaShow = true;
            }
        }).error(function (data) {
            alert("Erro no HTTP PUT");
            console.log(data);
            });
    }


    };
    $scope.confirmaConfirmou = function (dados) {
        $scope.confirmaButtonsDisabled = true;
        dados.estacao = $cookies.get('estacao');
        //$http.put(ejdConfig.baseUrl+"recarga", dados).success(function(data){
        ejdAPI.putRecarga(dados).success(function (data) {
            if (data.erro == "1"){
                $scope.confirmaButtonsDisabled = true;
                $scope.formDisabled = false;
                buttonToggle();
                clear();
                showError(data.stringErro);
            }else{
                $scope.confirmaButtonsDisabled = true;
                $scope.formDisabled = false;
                buttonToggle();
                clear();
                console.log(dados);
                $scope.deuCerto = {
                    usuario: data.usuario,
                    saldo: data.proximoSaldo,
                    valor: data.valor,
                    log: data.lognum
                };
                $scope.deuCertoShow = true;
                delete $scope.cartao;
            }
        }).error(function(data){
            alert("Erro 1709 - HTTP PUT - Anote isso, notifique Luciano e atualize a página");
            console.log(data);
        });
    };
    $scope.confirmaCancelou = function(){
        clear();
        buttonToggle();
        $scope.formDisabled = false;
        delete $scope.cartao;
    };
    }
}]);