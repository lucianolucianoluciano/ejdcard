var app = angular.module('ejdcard');

app.service('AuthService', ['RestService','$localStorage','ENDPOINTS','jwtHelper','$q', function AuthService(RestService, $localStorage, ENDPOINTS, jwtHelper, $q){
    var self = this;
    
    self.profile = {};
    
    function getUser() {
            return (self.isLoggedIn()) ? JSON.parse($localStorage.user) : {};
    }
    
    this.getToken = function(){
        return $localStorage.token || "";
    };

    this.isLoggedIn = function () {
        return !($localStorage.user == undefined || $localStorage.user == null);    
    };
    
    this.login = function (loginData) {
        
        var deferred = $q.defer();
    
        if (self.isLoggedIn()){
            deferred.reject("User is already logged in");
            return deferred.promise;
        }    

        RestService.request({
            method: 'post',
            uri: ENDPOINTS.LOGIN,
            body: loginData
        }).then(function (data) {
            $localStorage.token = data.token;
            var user = JSON.stringify(jwtHelper.decodeToken(data.token));
            $localStorage.user = user;
            deferred.resolve(JSON.parse(user));
        }, function (err) {
            deferred.reject(err.data.err); 
        });

        return deferred.promise;
    };
    
    this.logout = function () {
        $localStorage.$reset();
    };


}]);