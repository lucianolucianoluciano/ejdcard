/**
 * Created by Luciano on 10/07/2015.
 */
angular.module("ejdcard", ['ngCookies']);
angular.module("ejdcard").controller("consulta", ['$scope', '$filter', '$http', '$cookies', 'ejdAPI', function($scope, $filter, $http, $cookies, ejdAPI){
    $scope.retorno = false;
    $scope.botao = false;
    $scope.co = $cookies.get('meucu');
    $scope.mostraerro = false;
    $scope.texto = "Consultar";
    $scope.classedoretorno = 'resultado';
    $scope.consultar = function(){
        $scope.classedoretorno = 'resultado';
        $scope.desativado = false;
        $scope.botao = true;
        $scope.texto = "Aguarde...";
        ejdAPI.getCartao($scope.numero).success(function(data){
            if (data["existe"]){
                if (data["ativo"] == "0"){
                    $scope.classedoretorno = 'preto';
                    $scope.desativado = true;
                }
                $scope.mostraerro = false;
                $scope.retorno = false;
                saldo = parseFloat(data["saldo"]);
                usuario = data["usuario"];

                $scope.saldofinal = $filter('currency')(saldo);
                $scope.usuario = usuario;

                $scope.botao = false;
                $scope.texto = "Consultar";
                $scope.retorno = true;
            }else{
                $scope.retorno = false;
                $scope.mostraerro = true;
                $scope.botao = false;
                $scope.texto = "Consultar";
        }
        }).error(function(){
            alert("Erro na solicitação HTTP. Chame Luciano.");
            $scope.botao = false;
            $scope.texto = "Consultar";
        });
    };
    $scope.ver = false;
    }]);
