'use strict';

angular.module('angular-tt', [])
.directive('ttSwitch', function () {
  return {
    restrict: 'EA',
    replace: true,
    require:'ngModel',
    scope: {
      disabled: '@',
      onLabel: '@',
      offLabel: '@',
      knobLabel: '@'
    },
    template: '<div role="radio" class="switch has-switch" ng-class="{ \'disabled\': disabled, \'switch-off\': !model, \'switch-on\': model }">' +
        '<div class="switch-animate" ng-class="{\'switch-off\': !model, \'switch-on\': model}">' +
        '<span class="switch-left" ng-bind="onLabel"></span>' +
        '<label ng-bind="knobLabel"></label>' +
        '<span class="switch-right" ng-bind="offLabel"></span>' +
        '</div>' +
        '</div>',
    link: function(scope, element, attrs, ngModelCtrl){
      if (!attrs.onLabel) { attrs.onLabel = 'On'; }
      if (!attrs.offLabel) { attrs.offLabel = 'Off'; }
      if (!attrs.knobLabel) { attrs.knobLabel = '\u00a0'; }
      if (!attrs.disabled) { attrs.disabled = false; }
      element.on('click', function() {
        scope.$apply(scope.toggle);
      });

      ngModelCtrl.$formatters.push(function(modelValue){
         return modelValue;
      });

      ngModelCtrl.$parsers.push(function(viewValue){
        return viewValue;
      });

      ngModelCtrl.$render = function(){
          scope.model = ngModelCtrl.$viewValue;
      };
      scope.toggle = function toggle() {
        if(!scope.disabled) {
          scope.model = !scope.model;
          ngModelCtrl.$setViewValue(scope.model);
        }
      };
    }
  };
});
