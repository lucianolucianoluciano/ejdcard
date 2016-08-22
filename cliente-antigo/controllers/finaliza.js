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
    //Dados que serão exibidos no retorno
    
    if ($cookies.get('estacao') != 45){
        window.location = "index.html";
    }else{
    //Mecanismo para desativar o botão enquanto o formulário é enviado
    $scope.btnTexto = "Finalizar";
    $scope.hideBtn = false;
    $scope.formDisabled = false;
    $scope.confirmaButtonsDisabled = false;
    var buttonToggle = function(){
        $scope.btnTexto = ($scope.btnTexto == "Aguarde") ? "Finalizar" : "Aguarde";
        $scope.hideBtn = !$scope.hideBtn;
    };
    //Função do click
    $scope.finaliza = function(id){
        clear();
        buttonToggle();
        $scope.confirmaButtonsDisabled = false;
        ejdAPI.getCartao(id).success(function(data){
            if (data.erro == "1"){
                showError(data.stringErro);
                buttonToggle();
            } else if (data.ativo == "0"){
                showError('O cartão '+data.id+' já foi finalizado');
                buttonToggle();
            }else{
                $scope.formDisabled = true;
                $scope.confirma = {
                    usuario: data.usuario,
                    id: data.id,
                    saldo: data.saldo,
                    inicial: data.inicial
                };
                $scope.confirmaShow = true;
            }
        }).error(function(){
            alert("Erro no HTTP GET");
            console.log(data);
        });
    };
    $scope.confirmaConfirmou = function (dados) {
        $scope.confirmaButtonsDisabled = true;
        dados.estacao = $cookies.get('estacao');
        ejdAPI.putFinaliza(dados).success(function(data){
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
                    saldo: data.saldo,
                    log: data.lognum
                };
                $scope.deuCertoShow = true;
                delete $scope.id;
            }
        }).error(function(data){

        });
        //$http.put(ejdConfig.baseUrl+"recarga", dados).success(function(data){
        /*ejdAPI.putRecarga(dados).success(function (data) {
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
        });*/
    };
    $scope.confirmaCancelou = function(){
        clear();
        buttonToggle();
        $scope.formDisabled = false;
        delete $scope.id;
    };
}
}]);