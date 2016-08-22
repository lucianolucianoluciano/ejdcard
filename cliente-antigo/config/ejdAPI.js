/**
 * Created by Luciano on 22/07/2015.
 */
angular.module("ejdcard").factory("ejdAPI", function($http, ejdConfig){
    var _getCartao = function(id){
        return $http.get(ejdConfig.baseUrl+id);
    };
    var _putRecarga = function(data){
        return $http.put(ejdConfig.baseUrl+"recarga", data);
    };
    var _putPreVenda = function(data){
        return $http.put(ejdConfig.baseUrl+"pre", data);
    };
    var _putVenda = function(data){
        return $http.put(ejdConfig.baseUrl, data);
    };
    var _postCadastro = function(data){
        return $http.post(ejdConfig.baseUrl, data);
    };
    var _putFinaliza = function(data){
        return $http.put(ejdConfig.baseUrl+"finaliza", data);
    };
    return {
        getCartao: _getCartao,
        putRecarga: _putRecarga,
        putPreVenda: _putPreVenda,
        putVenda: _putVenda,
        postCadastro: _postCadastro,
        putFinaliza: _putFinaliza
    }
});