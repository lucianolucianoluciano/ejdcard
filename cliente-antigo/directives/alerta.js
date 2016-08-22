angular.module('ejdcard').directive('alerta', function(){
	return {
		restrict: 'E',
		transclude: true,
		scope:{
			erro: '='
		},
		templateUrl: 'directives/templates/alerta.html'
	};
});