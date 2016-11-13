(function () {
    'use strict';

    angular.module('app.workflows')
        .directive('implementation', function () {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    workflow: '=',
                    afterAssessment: '=',
                    index: '=',
                    section: '=',
                    permissions: '=',
                    loading: '='
                },
                templateUrl: 'app/workflows/ECM/implementation.html',
                controller: implementationDirectiveController,
                controllerAs: 'vm',
                bindToController: true
            }
        });

    /* @ngInject */
    function implementationDirectiveController(globalDataService) {
        var vm = Object.assign(this, {
            implementation: this.workflow.content.implementation,
            getFileType: globalDataService.getFileType,
            getSectionsGroup,
            assessmentIsReadOnly,
            userNotOwner
        });
        
        let sectionsGroup = [];

        function getSectionsGroup() {
            sectionsGroup.length = 0;
            sectionsGroup.push(vm.workflow.content.implementation.approvedDeliverables);
            sectionsGroup.push(vm.workflow.content.implementation.executedProtocols);
            sectionsGroup.push(vm.workflow.content.implementation.summaryReports);
            return sectionsGroup;
        }

        function isNotApprovedButLocked() {
            return !vm.workflow.content.implementation.editable && vm.workflow.content.implementation.state !== 'approved';
        }

        function assessmentIsReadOnly() {
            return !vm.workflow.content.implementation.editable || isNotApprovedButLocked();
        }

        function userNotOwner() {
            return !vm.permissions.isOwner;
        }
    }

})();
