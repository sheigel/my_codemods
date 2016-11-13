(function () {
    'use strict';

    angular.module('app.workflows')
        .directive('workflowLogs', workflowLogsDirective);

    /* @ngInject */
    function workflowLogsDirective() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                action: '=',
                insideSection: '='
            },
            templateUrl: 'app/workflows/components/workflowLogs.html',
            controller: workflowLogsDirectiveController
        };

        /* @ngInject */
        function workflowLogsDirectiveController($scope, workflowsDataService) {
            $scope.getDate = workflowsDataService.getDateOfTimeStamp;
            $scope.getHours = workflowsDataService.getHoursOfTimeStamp;
        }
    }
})();
