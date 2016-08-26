var app = angular.module('ejdcard');

app.service('MoneyService', ['RestService','$localStorage','ENDPOINTS','jwtHelper','$q', function AuthService(RestService, $localStorage, ENDPOINTS, jwtHelper, $q){
    var self = this;
    
    function toInt(moneyStr){
        var patt = /\d{1,},\d{2}/
        if (!patt.test(moneyStr)){
            return -1;
        }
        moneyStr = moneyStr.replace(',', '');
        return parseInt(moneyStr);
    }

    this.toInt = toInt;

    this.novoSaldo = function(op, saldo, valor){
        valor = toInt(valor);
        if (valor == -1) return -2;
        if (op == "venda"){
            if (saldo < valor) return -1;
            return saldo - valor;
        }else if (op == "recarga"){
            return saldo + valor;
        }else if (op == "cadastro"){
            return valor;
        }
    };


}]);