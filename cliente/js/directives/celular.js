(function(){
    'use strict';
    var app = angular.module('ejdcard');
    app.directive("celular", function () {
        return {
            require: "ngModel",
            link: function (scope, element, attrs, ctrl) {
                var _formatCell = function (cell) {
                    cell = cell.replace(/\D/g, "");
                    if (cell.length > 2){
                        cell = "(" + cell.substring(0,2) + ")" + cell.substring(2);
                    }
                    if (cell.length > 9){
                        cell = cell.substring(0,9) + "-" + cell.substring(9);
                    }
                    if (cell.length > 14){
                        cell = cell.substring(0,14);
                    }
                    return cell;
                };

                element.bind("keyup", function () {
                    try{
                            ctrl.$setViewValue(_formatCell(ctrl.$viewValue));
                            ctrl.$render();
                        }catch(name){

                    }
                });

                /*ctrl.$parsers.push(function (value) {
                console.log(value);
                if (value.length > 2){
                return parseFloat(value.replace(",","."));
                }
                });

                /*ctrl.$formatters.push(function (value) {
                return value.replace(".", ",");
                });*/
            }
        };
    });
})();