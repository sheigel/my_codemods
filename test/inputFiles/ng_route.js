(function () {
    'use strict';

    angular
        .module('app.workflows')
        .run(appRun);

    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'workflows',
                config: {
                    url: '/workflows',
                    template: '<ui-view/>',
                    templateUrl: 'app/workflows/workflows.html',
                    controller: 'WorkflowsController',
                    controllerAs: 'vm',
                    abstract: true,
                    resolve: {
                        /* @ngInject */
                        clientConfig: function clientInfo(clientService, $q) {
                            var deferred = $q.defer();

                            clientService.getCompanyInfo()
                                .then(function (companyInfo) {
                                    deferred.resolve(companyInfo.config);
                                })
                                .catch(function (err) {
                                    deferred.reject(err);
                                });

                            return deferred.promise;
                        }
                    }
                }
            }, {
                state: 'workflows.dashboard',
                config: {
                    url: '/dashboard',
                    title: 'Workspace',
                    template: require('./workflows.html'),
                    controller: 'WorkflowsController',
                    controllerAs: 'vm'
                }
            }, {
                state: 'workflows.rbp',
                config: {
                    url: '/rbp',
                    title: 'RBP',
                    abstract: true,
                    template: '<ui-view/>'
                }
            }, {
                state: 'workflows.rbp.fill',
                config: {
                    url: '/fill/:workflowId',
                    title: 'RBP Assessment',
                    templateUrl: 'app/workflows/RBP/rbpWorkflow.html',
                    controller: 'RBPWorkflowController',
                    controllerAs: 'vm',
                    resolve: {
                        /* @ngInject */
                        workflow: function getWorkflow(rbpWorkflowService, $q, $stateParams) {
                            var deferred = $q.defer();
                            var workflowId = $stateParams.workflowId;
                            rbpWorkflowService.getWorkflow(workflowId)
                                .then(workflow => deferred.resolve(workflow))
                                .catch(err => deferred.reject(err));
                            return deferred.promise;
                        }
                    }
                }
            }, {
                state: 'workflows.rbp.summary',
                config: {
                    url: '/summary/:workflowId',
                    title: 'RBP Summary',
                    templateUrl: 'app/workflows/RBP/rbpSummary.html',
                    controller: 'RBPSummaryController',
                    controllerAs: 'vm',
                    resolve: {
                        /* @ngInject */
                        workflow: function getWorkflow(rbpWorkflowService, $q, $stateParams) {
                            var deferred = $q.defer();
                            var workflowId = $stateParams.workflowId;
                            rbpWorkflowService.getWorkflow(workflowId)
                                .then(workflow => deferred.resolve(workflow))
                                .catch(err => deferred.reject(err));
                            return deferred.promise;
                        }
                    }
                }
            }, {
                state: 'workflows.ecm',
                config: {
                    url: '/ecm',
                    title: 'ECM',
                    abstract: true,
                    template: '<ui-view/>'
                }
            }, {
                state: 'workflows.ecm.fill',
                config: {
                    url: '/fill/:workflowId',
                    title: 'ECM Workflow',
                    templateUrl: 'app/workflows/ECM/ecmWorkflow.html',
                    controller: 'ECMWorkflowController',
                    controllerAs: 'vm',
                    resolve: {
                        /* @ngInject */
                        workflow: function getWorkflow(ecmWorkflowsService, $q, $stateParams) {
                            var deferred = $q.defer();
                            var workflowId = $stateParams.workflowId;
                            ecmWorkflowsService.getWorkflow(workflowId)
                                .then(workflow => deferred.resolve(workflow))
                                .catch(err => deferred.reject(err));
                            return deferred.promise;
                        }
                    }
                }
            }

        ];
    }
})();
