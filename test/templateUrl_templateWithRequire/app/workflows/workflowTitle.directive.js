(function () {
    'use strict';

    angular.module('app.workflows')
        .directive('workflowTitle', workflowTitleDirective);

    /* @ngInject */
    function workflowTitleDirective() {
        return {
            restrict: 'E',
            scope: {
                name: '=',
                state: '='
            },
            templateUrl: 'app/workflows/workflowTitle.html',
            controller: workflowTitleDirectiveController,
            controllerAs: 'vm',
            bindToController: true
        };

        /* @ngInject */
        function workflowTitleDirectiveController() {
            var _this = this;

            _this.getStateClassName = () => {
                return _this.state ? _this.state.toLowerCase().replace(' ', '-') : '';
            }
        }
    }
})();
