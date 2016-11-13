(function () {
    'use strict';

    angular.module('app.workflows')
        .directive('workflowDetails', workflowDetailsDirective);

    /* @ngInject */
    function workflowDetailsDirective() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                workflow: '='
            },
            templateUrl: 'app/workflows/components/workflowDetails.html',
            controller: workflowDetailsDirectiveController,
            controllerAs: 'vm',
            bindToController: true
        };

        /* @ngInject */
        function workflowDetailsDirectiveController() {

        }
    }
})();
