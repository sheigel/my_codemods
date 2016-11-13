/*jshint -W072 */
(function () {
    'use strict';

    angular
        .module('app.workflows')
        .controller('WorkflowsController', WorkflowsController);

    /* @ngInject */
    function WorkflowsController($uibModal, $scope, $state, $localStorage, $rootScope, userService, clientService,
                                 workflowsService, RBPWorkflowViewModel, ECMWorkflowViewModel, globalDataService, clientConfig) {
        globalDataService.clientConfig = clientConfig;
        let me;
        let browserData = $localStorage;
        let dataFromBrowser = {};
        let limitNumber = 33;
        let vm = Object.assign(this,
            {
                filters: {},
                workflows: [],
                isScrolledUp: false,
                filtersExpanded: true,
                view: 'card',
                busyScrolling: false,
                openCreateWorkflowModal: openCreateWorkflowModal,
                getStateClassName,
                goToWorkflow,
                loadMoreWorkflows,
                hasSummary,
                test:'ce spui cuc?'
            });

        var createWorkflow = angular.element('.create-workflow');
        var createBtn = angular.element('.create-workflow-btn');

        $scope.$watch('vm.view', function () {
            displayButton();
        });

        $(window).scroll(function () {
            var scroll = $(window).scrollTop();
            vm.isScrolledUp = scroll >= 50;
            angular.element('.section-header').css('box-shadow', 'none');

            if (vm.isScrolledUp) {
                if (vm.view === 'list') {
                    createWorkflow.css('box-shadow', ' rgba(0, 0, 0, 0.0980392) 0px 4px 2px -2px');
                } else {
                    createWorkflow.css('box-shadow', '0 4px 2px -2px rgba(0, 0, 0, 0.1)');
                }
            } else {
                createWorkflow.css('box-shadow', 'none');
            }
            displayButton();
        });

        function displayButton() {
            if (vm.view === 'list' || vm.isScrolledUp) {
                createWorkflow.addClass('condensed');
                createBtn.addClass('condensed-btn');
            } else {
                createWorkflow.removeClass('condensed');
                createBtn.removeClass('condensed-btn');
            }
        }

        activate();

        function activate() {
            angular.element('html').removeClass('full-height');

            userService.getUserProfile()
                .then(function (res) {
                    me = res;
                    setView();
                    vm.isEditor = me.role !== 'viewer';
                })
                .catch(function (err) {
                    console.log(err);
                });

            clientService.getCompanyInfo()
                .then(function (res) {
                    vm.client = res;
                    return vm.client;
                })
                .then(function (client) {
                    vm.templates = clientService.getTemplates(client);
                })
                .catch(function (err) {
                    toastr.error(err);
                });
        }

        function setView() {
            if (browserData[me.id]) {
                dataFromBrowser = JSON.parse(atob(browserData[me.id]));
                if (dataFromBrowser.view) {
                    vm.view = dataFromBrowser.view;
                } else {
                    vm.view = 'card';
                }
                vm.filters = toFiltersDTO(dataFromBrowser);
            } else {
                vm.view = 'card';
            }
        }

        function openCreateWorkflowModal() {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'app/workflows/createWorkflowModal.html',
                controller: 'CreateWorkflowModalController as vm',
                windowTopClass: 'modal custom-modal',
                resolve: {
                    templates: vm.templates,
                    client: vm.client
                },
                backdrop: 'static',
                keyboard: false
            });

            modalInstance.result
                .then(workflowData => workflowsService.createWorkflow(workflowData))
                .then(workflow => {
                    $rootScope.$emit('UpdateTasks');
                    $state.go(`workflows.${workflow.module.abbreviation.toLowerCase()}.fill`, {workflowId: workflow.uuid});
                });
        }

        function getStateClassName(workflow) {
            return workflow.state.toLowerCase().replace(' ', '-');
        }

        function hasSummary(workflow) {
            return workflow.summary !== null;
        }

        function goToWorkflow(workflow) {
            const moduleAbbreviation = workflow.module.abbreviation.toLowerCase();
            var path = (hasSummary(workflow)) ? 'summary' : 'fill';
            $state.go(`workflows.${moduleAbbreviation}.${path}`, {workflowId: workflow.uuid});

        }

        function loadMoreWorkflows(filters, skipNumber) {
            if (me !== undefined) {
                if (vm.busyScrolling) {
                    return;
                }
                vm.busyScrolling = true;
                filters.limitNumber = limitNumber;
                filters.skipNumber = skipNumber === 0 ? 0 : vm.workflows.length;

                workflowsService.getFilteredWorkflows(filters)
                    .then(function (workflows) {
                        if (workflows.length === 0) {
                            vm.done = true;
                        } else {
                            _.forEach(workflows, function (workflowData) {
                                let workflow;
                                switch (workflowData.module.abbreviation) {
                                    case 'RBP':
                                        workflow = new RBPWorkflowViewModel(workflowData);
                                        break;
                                    case 'ECM':
                                        workflow = new ECMWorkflowViewModel(workflowData);
                                        break;
                                    default:
                                        console.log('unknown workflow type ' + workflowData.module.abbreviation);
                                        return;
                                }

                                vm.workflows.push(workflow);
                            });
                            vm.done = false;
                        }
                        vm.busyScrolling = false;
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            }
        }

        function toFiltersDTO(data) {
            if (data.myWorkflowsFilterActive) {
                data.initiator = me.id;
            }

            var resultData = {
                initiator: data.initiator ? data.initiator : null,
                startDate: data.startDate ? new Date(data.startDate) : null,
                targetDate: data.targetDate ? new Date(data.targetDate) : null,
                module: data.module,
                system: data.system,
                state: data.state,
                myWorkflowsFilterActive: data.myWorkflowsFilterActive,
                skipNumber: 0
            };
            if (resultData.state) {
                if (resultData.state.indexOf('In') > -1) {
                    resultData.state = resultData.state.substr(3);
                }
                resultData.state = resultData.state.toLowerCase();
            }

            return resultData;
        }
    }
})();
