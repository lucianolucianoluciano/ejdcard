var app = angular.module('ejdcard');

app.service('RestService', ['$http','$q','$localStorage', 'apiRoot', '$window', function($http, $q, $localStorage, apiRoot, $window){
    function getToken(){
        return ($localStorage.token) ? $localStorage.token : "";
    }
    
    this.request = function (config) {
        var deferred = $q.defer();
        var accessToken = getToken();
        
        $http({
            method: config.method,
            url: (apiRoot+config.uri),
            data: config.body || {},
            headers: {
                'Authorization': 'JWT '+accessToken
            }
        }).then(
            function (output) {
                deferred.resolve(output.data);
            },
            function (output) {
                if (output.status == 403){
                    $window.location.href = "login.html";
                    deferred.reject("Unauthorized");
                }else{
                    deferred.reject(output);
                }
            }
        );
        return deferred.promise;   
    };
    
}]);