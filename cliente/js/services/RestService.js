var app = angular.module('ejdcard');

app.service('RestService', ['$http','$q','$localStorage', 'apiRoot', '$window', function($http, $q, $localStorage, apiRoot, $window){
    function getToken(){
        return ($localStorage.token) ? $localStorage.token : "";
    }
    
    this.request = function (config) {
        var deferred = $q.defer();
        
        $http({
            method: config.method,
            url: (apiRoot+config.uri),
            data: config.body || {}
        }).then(
            function (output) {
                deferred.resolve(output.data);
            },
            function (output) {
                if (output.status == 403){
                    $window.location.href = "login.html";
                    deferred.reject("Unauthorized");
                }else{
                    var erro = output.data.err || output
                    deferred.reject(erro);
                }
            }
        );
        return deferred.promise;   
    };
    
}]);