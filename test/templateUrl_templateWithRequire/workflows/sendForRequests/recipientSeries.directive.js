(function () {
    'use strict';

    angular.module('app.workflows')
        .directive('recipientSeries', recipientSeriesDirective);

    /* @ngInject */
    function recipientSeriesDirective() {
        return {
            restrict: 'E',
            scope: {
                series: '=',
                seriesCollection: '='
            },
            templateUrl: 'app/workflows/sendForRequests/recipientSeries.html',
            controller: recipientSeriesDirectiveController
        };

        /* @ngInject */
        function recipientSeriesDirectiveController($scope, sendForService) {
            $scope.addRecipient = addRecipient;
            $scope.removeRecipient = removeRecipient;
            $scope.searchUsersAndUserGroups = sendForService.searchUsersAndUserGroups;

            function addRecipient(user) {
                if (userIsAlreadySelected(user.originalObject)) {
                    toastr.error('You have already selected this user for the current request');
                } else {
                    $scope.series.push(user.originalObject);
                }
            }

            function removeRecipient(recipient) {
                _.remove($scope.series, function (rec) {
                    return rec === recipient;
                });
            }

            function userIsAlreadySelected(user) {
                return _.some($scope.seriesCollection, function (series) {
                    return _.some(series, {id: user.id});
                });
            }
        }
    }
})();
