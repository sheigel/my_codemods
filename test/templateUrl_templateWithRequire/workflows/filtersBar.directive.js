(function () {
    'use strict';

    angular.module('app.workflows')
        .directive('filtersBar', filtersBarDirective);

    /* @ngInject */
    function filtersBarDirective() {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: {
                expanded: '=',
                workflows: '=',
                clientModules: '=modules',
                loadWorkflows: '=',
                filters: '=',
                systems: '='
            },
            templateUrl: 'app/workflows/filtersBar.html',
            controller: filtersBarDirectiveController,
            controllerAs: 'vm',
            bindToController: true
        };

        /* @ngInject */
        function filtersBarDirectiveController($scope, $q, $state, $localStorage, workflowsService, clientService, userService, globalDataService) {
            var me;
            var browserData = $localStorage;
            var dataFromBrowser;
            const vm = Object.assign(this, {
                workflows: [],
                myWorkflowsFilterActive: false,
                states: ['Started', 'In Review', 'Reviewed', 'In Approval', 'Approved'],
                toggleBar,
                inputChanged,
                goToWorkflow,
                selectInitiatorFilter,
                selectModuleFilter,
                selectSystemFilter,
                selectStateFilter,
                searchTitle,
                searchInitiator,
                toggleMyWorkflows,
                toggleRememberSettings,
                applyFilters,
                resetFilter,
                clearAllFilters
            });

            function toggleBar() {
                vm.expanded = !vm.expanded;
                if (vm.expanded) {
                    angular.element('.bar-header .title').html('SEARCH');
                } else {
                    angular.element('.bar-header .title').html('SEARCH AND FILTERS');
                }
            }

            function inputChanged(filterString) {
                vm.filters.initiator = null;
            }

            function goToWorkflow(title) {
                if (title) {
                    if (title.originalObject.module.abbreviation === 'RBP') {
                        $state.go('workflows.rbp.fill', {workflowId: title.originalObject.uuid});
                    } else if (title.originalObject.module.abbreviation === 'ECM') {
                        $state.go('workflows.ecm.fill', {workflowId: title.originalObject.uuid});
                    }
                }
            }

            function selectInitiatorFilter(initiator) {
                if (initiator) {
                    vm.filters.initiator = initiator.originalObject;
                }
            }

            function selectModuleFilter(module) {
                vm.filters.module = module;
            }

            function selectSystemFilter(system) {
                vm.filters.system = system;
            }

            function selectStateFilter(state) {
                vm.filters.state = state;
            }

            function searchTitle(searchString) {
                var deferred = $q.defer();
                workflowsService.getWorkflows(searchString)
                    .then(res => deferred.resolve(res))
                    .catch(err => console.log(err));
                return deferred.promise;
            }

            function searchInitiator(searchString) {
                var deferred = $q.defer();
                clientService.getCompanyUsers(searchString)
                    .then(res => deferred.resolve(res))
                    .catch(err => console.log(err));
                return deferred.promise;
            }

            function toggleMyWorkflows() {
                vm.myWorkflowsFilterActive = !vm.myWorkflowsFilterActive;
                if (vm.filters.initiator === me.id && !vm.myWorkflowsFilterActive) {
                    vm.filters.initiator = null;
                }
            }

            function toggleRememberSettings() {
                vm.rememberOptionActive = !vm.rememberOptionActive;
            }

            function applyFilters() {
                var sendData = toDTO();
                if (vm.rememberOptionActive) {
                    saveDataToBrowser(sendData);
                }
                filterWorkflows(sendData);
            }

            function resetFilter(field) {
                vm.filters[field] = null;
            }

            function clearAllFilters() {
                vm.workflows = [];
                vm.filters = {};
                vm.myWorkflowsFilterActive = false;
                $scope.$broadcast('angucomplete-alt:clearInput');

                if (vm.rememberOptionActive) {
                    deleteDataFromBrowser();
                }
                vm.loadWorkflows(vm.filters, 0);
            }

            function filterWorkflows(filters) {
                vm.workflows = [];
                vm.loadWorkflows(filters, 0);
            }

            function saveDataToBrowser() {
                var data = {
                    initiator: vm.filters.initiator ? vm.filters.initiator : null,
                    startDate: vm.filters.startDate,
                    targetDate: vm.filters.targetDate,
                    module: vm.filters.module,
                    system: vm.filters.system,
                    state: vm.filters.state,
                    myWorkflowsFilterActive: vm.myWorkflowsFilterActive
                };
                if (dataFromBrowser) {
                    data.view = dataFromBrowser.view || 'card';
                }
                browserData[me.id] = btoa(JSON.stringify(data));
            }

            function deleteDataFromBrowser() {
                delete browserData[me.id];
            }

            function toDTO() {
                if (vm.myWorkflowsFilterActive) {
                    vm.filters.initiator = me.id;
                    $scope.$broadcast('angucomplete-alt:clearInput');
                }

                var sendData = _.cloneDeep(vm.filters);

                if (sendData.state) {
                    if (sendData.state.indexOf('In') > -1) {
                        sendData.state = sendData.state.substr(3);
                    }
                    sendData.state = sendData.state.toLowerCase();
                }

                if (sendData.initiator) {
                    sendData.initiator = sendData.initiator.id;
                }

                sendData.startDate = sendData.startDate && globalDataService.getSystemDate(sendData.startDate);
                sendData.targetDate = sendData.targetDate && globalDataService.getSystemDate(sendData.targetDate);

                return sendData;
            }

            activate();

            function activate() {
                $q.all([
                    vm.clientModules
                        .then(res => vm.modules = _.map(res, 'module'))
                        .catch(err => console.log(err)),
                    userService.getUserProfile()
                        .then(res => {
                            me = res;
                            if (browserData[me.id]) {
                                dataFromBrowser = JSON.parse(atob(browserData[me.id]));
                                vm.myWorkflowsFilterActive = dataFromBrowser.myWorkflowsFilterActive;
                            }
                        })
                        .catch(err => console.log(err)),
                    clientService.getSystemNames()
                        .then(res => vm.systems = res)
                        .catch(err => console.log(err))
                ])
                    .then(function () {
                        vm.applyFilters();
                    });
            }
        }
    }
})
();
