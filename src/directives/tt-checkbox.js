'use strict';

angular.module('angular-tt', [])
.directive('ttCheck', function($timeout) {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
            return $timeout(function() {
                var value;
                value = attrs['value'];

                scope.$watch(attrs['ngModel'], function (newVal) {
                    $(element).check('update');
                })

                return $(element).check({
                    checkboxClass: 'icheckbox',
                    radioClass: 'iradio_flat-aero'

                }).on('ifChanged', function (e) {
                    if ($(element).attr('type') === 'checkbox' && attrs['ngModel']) {
                        scope.$apply(function() {
                            return ngModel.$setViewValue(e.target.checked);
                        });
                    }
                    if ($(element).attr('type') === 'radio' && attrs['ngModel']) {
                        return scope.$apply(function() {
                            return ngModel.$setViewValue(value);
                        });
                    }
                });
            });
        }
    };
});
