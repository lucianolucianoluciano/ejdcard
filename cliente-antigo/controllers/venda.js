/**
 * Created by Luciano on 19/07/2015.
 */
angular.module("ejdcard").controller("venda", ['$scope', '$filter', '$http', '$cookies', 'ejdAPI', function($scope, $filter, $http, $cookies, ejdAPI){
    //Não mostra o alert que será usado para provaveis erros de validação no servidor nem a div de sucesso
    var clear = function(){
        $scope.serverError = false;
        $scope.confirmaShow = false;
        $scope.deuCertoShow = false;
    };
    
    $scope.limpar = clear();
    clear();
    var showError = function(texto){
        $scope.serverError = texto;
    };
    // if ($cookies.get('estacao') != 45){
        if (false){
        window.location = "index.html";
    }else{
        //Mecanismo para desativar o botão enquanto o formulário é enviado
        $scope.btnTexto = "Vender";
        $scope.hideBtn = false;
        $scope.formDisabled = false;
        $scope.confirmaButtonsDisabled = false;
        var buttonToggle = function(){
            $scope.btnTexto = ($scope.btnTexto == "Aguarde") ? "Vender" : "Aguarde";
            $scope.hideBtn = !$scope.hideBtn;
        };
        //Função do click
        $scope.vende= function(cartao){
            clear();
            buttonToggle();
            $scope.confirmaButtonsDisabled = false;
            ejdAPI.putPreVenda(cartao).success(function(data){
                console.log("Sucesso no HTTP PUT");
                console.log(data);
                if (data.erro == "1"){
                    showError(data.stringErro);
                    buttonToggle();
                    console.log("Entro");
                }else if (data.ativo == "0") {
                    showError('O cartão ' + data.id + ' já foi finalizado');
                    buttonToggle();
                }else{
                    if (parseFloat(data.saldo) < parseFloat(data.valor)) {
                        showError("<b>SALDO INSUFICIENTE<br>Nome: </b>" + data.usuario + "<br><b>Saldo: </b>" + data.saldo);
                        buttonToggle();
                    }else{
                        $scope.formDisabled = true;
                        proximo = parseFloat(data.saldo) - parseFloat(data.valor);

                        $scope.confirma = {
                            usuario: data.usuario,
                            id: data.id,
                            saldo: data.saldo,
                            valor: data.valor,
                            proximoSaldo: proximo
                        };
                        console.log($scope.confirma);
                        $scope.confirmaShow = true;
                    }
                }
            }).error(function(data){
                alert("Erro no HTTP PUT");
                console.log(data);
            });

        };
        $scope.confirmaConfirmou = function (dados) {
            $scope.confirmaButtonsDisabled = true;
            dados.estacao = $cookies.get('estacao');
            ejdAPI.putVenda(dados).success(function(data){
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