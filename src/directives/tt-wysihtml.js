'use strict';

angular.module('angular-tt', [])
.directive('ttWysiwyg', function() {
    return {
        restrict : "A",
        require : 'ngModel',
        transclude : true,
        link : function(scope, element, attrs, ctrl) {

          var textarea = element.wysiwyg({"html": true});

          var editor = textarea.data('wysiwyg').editor;

          // view -> model
          editor.on('change', function() {
              if(editor.getValue())
              scope.$apply(function() {
                  ctrl.$setViewValue(editor.getValue());
              });
          });

          // model -> view
          ctrl.$render = function() {
            textarea.html(ctrl.$viewValue);
            editor.setValue(ctrl.$viewValue);
          };

          ctrl.$render();
        }
    };
});
