/**
 * Angular TT - Angular wrapper for TT.js
 * @version v0.0.1 - 2014-08-18
 * @link https://github.com/Knape/TT-angular
 * @author Philip Knape <philip.knape@gmail.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
angular.module('angular-tt', []);

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

'use strict';

angular.module('angular-tt', [])
.value('ttSelectConfig', {})
.directive('ttSelect', function ($timeout, ttSelectConfig) {
  var options = {};
  if (ttSelectConfig) {
    angular.extend(options, ttSelectConfig);
  }
  return {
    require: 'ngModel',
    priority: 1,
    compile: function (tElm, tAttrs) {
      var watch,
        repeatOption,
        repeatAttr,
        isSelect = tElm.is('select'),
        isMultiple = angular.isDefined(tAttrs.multiple);

      // Enable watching of the options dataset if in use
      if (tElm.is('select')) {
        repeatOption = tElm.find( 'optgroup[ng-repeat], optgroup[data-ng-repeat], option[ng-repeat], option[data-ng-repeat]');

        if (repeatOption.length) {
          repeatAttr = repeatOption.attr('ng-repeat') || repeatOption.attr('data-ng-repeat');
          watch = jQuery.trim(repeatAttr.split('|')[0]).split(' ').pop();
        }
      }

      return function (scope, elm, attrs, controller) {
        // instance-specific options
        var opts = angular.extend({}, options, scope.$eval(attrs.ttSelect));

        /*
        Convert from Select2 view-model to Angular view-model.
        */
        var convertToAngularModel = function(ttSelectData) {
          var model;
          if (opts.simple_tags) {
            model = [];
            angular.forEach(ttSelectData, function(value, index) {
              model.push(value.id);
            });
          } else {
            model = ttSelectData;
          }
          return model;
        };

        /*
        Convert from Angular view-model to Select2 view-model.
        */
        var convertToSelect2Model = function(angular_data) {
          var model = [];
          if (!angular_data) {
            return model;
          }

          if (opts.simple_tags) {
            model = [];
            angular.forEach(
              angular_data,
              function(value, index) {
                model.push({'id': value, 'text': value});
              });
          } else {
            model = angular_data;
          }
          return model;
        };

        if (isSelect) {
          // Use <select multiple> instead
          delete opts.multiple;
          delete opts.initSelection;
        } else if (isMultiple) {
          opts.multiple = true;
        }

        if (controller) {
          // Watch the model for programmatic changes
           scope.$watch(tAttrs.ngModel, function(current, old) {
            if (!current) {
              return;
            }
            if (current === old) {
              return;
            }
            controller.$render();
          }, true);
          controller.$render = function () {
            if (isSelect) {
              elm.select2('val', controller.$viewValue);
            } else {
              if (opts.multiple) {
                controller.$isEmpty = function (value) {
                  return !value || value.length === 0;
                };
                var viewValue = controller.$viewValue;
                if (angular.isString(viewValue)) {
                  viewValue = viewValue.split(',');
                }
                elm.select(
                  'data', convertToSelect2Model(viewValue));
                if (opts.sortable) {
                  elm.select("container").find("ul.select2-choices").sortable({
                    containment: 'parent',
                    start: function () {
                      elm.select("onSortStart");
                    },
                    update: function () {
                      elm.select("onSortEnd");
                      elm.trigger('change');
                    }
                  });
                }
              } else {
                if (angular.isObject(controller.$viewValue)) {
                  elm.select('data', controller.$viewValue);
                } else if (!controller.$viewValue) {
                  elm.select('data', null);
                } else {
                  elm.select('val', controller.$viewValue);
                }
              }
            }
          };

          // Watch the options dataset for changes
          if (watch) {
            scope.$watch(watch, function (newVal, oldVal, scope) {
              if (angular.equals(newVal, oldVal)) {
                return;
              }
              // Delayed so that the options have time to be rendered
              $timeout(function () {
                elm.select2('val', controller.$viewValue);
                // Refresh angular to remove the superfluous option
                controller.$render();
                if(newVal && !oldVal && controller.$setPristine) {
                  controller.$setPristine(true);
                }
              });
            });
          }

          // Update valid and dirty statuses
          controller.$parsers.push(function (value) {
            var div = elm.prev();
            div
              .toggleClass('ng-invalid', !controller.$valid)
              .toggleClass('ng-valid', controller.$valid)
              .toggleClass('ng-invalid-required', !controller.$valid)
              .toggleClass('ng-valid-required', controller.$valid)
              .toggleClass('ng-dirty', controller.$dirty)
              .toggleClass('ng-pristine', controller.$pristine);
            return value;
          });

          if (!isSelect) {
            // Set the view and model value and update the angular template manually for the ajax/multiple select2.
            elm.bind("change", function (e) {
              e.stopImmediatePropagation();

              if (scope.$$phase || scope.$root.$$phase) {
                return;
              }
              scope.$apply(function () {
                controller.$setViewValue(
                  convertToAngularModel(elm.select('data')));
              });
            });

            if (opts.initSelection) {
              var initSelection = opts.initSelection;
              opts.initSelection = function (element, callback) {
                initSelection(element, function (value) {
                  var isPristine = controller.$pristine;
                  controller.$setViewValue(convertToAngularModel(value));
                  callback(value);
                  if (isPristine) {
                    controller.$setPristine();
                  }
                  elm.prev().toggleClass('ng-pristine', controller.$pristine);
                });
              };
            }
          }
        }

        elm.bind("$destroy", function() {
          elm.select("destroy");
        });

        attrs.$observe('disabled', function (value) {
          elm.select('enable', !value);
        });

        attrs.$observe('readonly', function (value) {
          elm.select('readonly', !!value);
        });

        if (attrs.ngMultiple) {
          scope.$watch(attrs.ngMultiple, function(newVal) {
            attrs.$set('multiple', !!newVal);
            elm.select2(opts);
          });
        }

        // Initialize the plugin late so that the injected DOM does not disrupt the template compiler
        $timeout(function () {
          elm.select(opts);

          // Set initial value - I'm not sure about this but it seems to need to be there
          elm.select('data', controller.$modelValue);
          // important!
          controller.$render();

          // Not sure if I should just check for !isSelect OR if I should check for 'tags' key
          if (!opts.initSelection && !isSelect) {
              var isPristine = controller.$pristine;
              controller.$pristine = false;
              controller.$setViewValue(
                  convertToAngularModel(elm.select2('data'))
              );
              if (isPristine) {
                  controller.$setPristine();
              }
            elm.prev().toggleClass('ng-pristine', controller.$pristine);
          }
        });
      };
    }
  };
});

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

angular.module('angular-tt', [])

.factory('TT', function () {
    var TT;
    TT = window.TT;
    return TT;
})

.factory('ttService', function($q, TT) {

    var API = {};

    API.init = function() {
        var deferred = $q.defer();

        TT.native.init()
            .done(function(data) {
                deferred.resolve(data);
            })
            .fail(function() {
                console.log('ERROR')
            });

        return deferred.promise;

    };

    API.getMe = function() {
        var deferred = $q.defer();

        TT.api.get('v1/me')
            .done(function (user) {
                deferred.resolve(user)
            })
            .fail(function(err) {
                deferred.reject(err)
            });

        return deferred.promise;
    }

    API.getProducts = function (id) {
        var deferred = $q.defer();

        TT.api.get('v1/stores/' + id + '/products')
            .done(function(products) {
              deferred.resolve(products)
            })
            .fail(function(err) {
                deferred.reject(err)
            });

        return deferred.promise;
    }

    API.loaded = function() {
        return TT.native.loaded();
    };

    API.loading = function() {
        return TT.native.loading();
    };

    API.performCard = function() {
        return TT.native.performCard()
    };

    API.reportSize = function(size) {
        return TT.native.reportSize(size)
    }

    API.showShareDialog = function( heading, message ) {
      return TT.showShareDialog(heading, message)
    }

    API.showStatus = function(message) {
        return TT.native.showStatus(message);
    }

    API.accessToken = function() {
        return TT.native.accessToken;
    }

    return API;

})
