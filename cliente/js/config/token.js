(function(){
    'use strict';
    var app = angular.module('ejdcard');

    app.config(function Config($httpProvider, jwtOptionsProvider) {

    jwtOptionsProvider.config({
      tokenGetter: ['AuthService', function(AuthService) {
        return AuthService.getToken();;
      }]
    });

    $httpProvider.interceptors.push('jwtInterceptor');
  })
})();