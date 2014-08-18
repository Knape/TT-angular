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
