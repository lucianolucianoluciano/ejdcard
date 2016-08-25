(function(){
    'use strict';
    var app = angular.module('ejdcard');
    app.directive("money", function () {
        return {
            require: "ngModel",
            link: function (scope, element, attrs, ctrl) {
                var _formatMoney = function (money) {
                    money = money.replace(/[^0-9]+/g, "");
                    if (money.length > 2){
                        money = money.substring(0,money.length-2) + "," + money.substring(money.length-2);
                    }
                    return money;
                };

                element.bind("keyup", function () {
                    try{
                    if (ctrl.$viewValue.length > 0) {
                        ctrl.$setViewValue(_formatMoney(ctrl.$viewValue));
                        ctrl.$render();
                    }}catch(name){

                    }
                });
            }
        };
    });
})();