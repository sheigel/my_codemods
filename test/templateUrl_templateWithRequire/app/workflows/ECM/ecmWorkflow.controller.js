(function () {
    'use strict';

    angular
        .module('app.workflows')
        .controller('ECMWorkflowController', ECMWorkflowController);

    /* @ngInject */
    function ECMWorkflowController($rootScope, $scope, $state, $timeout, clientConfig, ecmWorkflowsService, globalDataService,
                                   userService, sendForService, clientService, auditTrailService, workflowsDataService,
                                   AuditTrailActionsViewFactory, ECMWorkflowViewModel, workflow, myTasksService, workflowsService,
                                   ecmPriorities) {
        const vm = Object.assign(this, {
            loading: false,
            filteredLogs: [],
            filteredTasks: [],
            workflow: new ECMWorkflowViewModel(workflow),
            hasApproveTask,
            startNewThread,
            toggleComments,
            getStateClassName,
            expandInput: globalDataService.expandInput,
            openReviewApproveModal: sendForService.openReviewApproveModal
        });
        globalDataService.clientConfig = clientConfig;

        $rootScope.$on('hasDoneTask', function (ev, args) {
            vm.hasCompletedReviewTask = args.reviewed;
            vm.hasCompletedApproveTask = args.approveOption.approved || args.approveOption.rejected;
        });

        vm.getSections = function () {
            switch (vm.workflow.content.initiation.priority) {
                case 'emergency':
                    return ecmPriorities.emergency;
                case 'standard':
                    return ecmPriorities.standard;
                default:
                    return ecmPriorities.normal;
            }
        };

        vm.reorderSections = function () {
            vm.workflowSections = _.concat(vm.getSections(), [{
                name: 'Summary & Closeout',
                isTriggered: true
            }]);
            $timeout(function () {
                $rootScope.$broadcast('PriorityChanged');
            }, 0);
        };

        vm.togglePostImpactSections = function (action) {
            if (action === 'add') {
                vm.workflowSections.splice(vm.workflowSections.length - 1, 0, {
                        name: 'Post-Impact Implementation',
                        identifier: 'postImpactImplementation',
                        isTriggered: true
                    },
                    {
                        name: 'Post-Impact Implementation Verification',
                        identifier: 'postImpactImplementationVerification',
                        isTriggered: true
                    });
            } else {
                _.remove(vm.workflowSections, function (section) {
                    return _.includes(['postImpactImplementation', 'postImpactImplementationVerification'], section.identifier);
                });
            }
        };

        $rootScope.$on('OwnerChanged', function (ev) {
            refreshWorkflow();
        });

        $rootScope.$on('UpdateAuditTrail', function (ev) {
            getAuditTrailLogs();
        });

        $rootScope.$on('UpdateWorkflow', function (ev) {
            refreshWorkflow();
        });

        function refreshWorkflow() {
            ecmWorkflowsService.getWorkflow(vm.workflow.uuid)
                .then(res => {
                    vm.workflow = new ECMWorkflowViewModel(res);
                    if (vm.workflow.content.impactAssessment.state === 'approved' &&
                        _.some(vm.workflow.content.changeDescriptions, cd => !cd.summary)) {
                        workflowsService.generateImpactAssessmentSummary(res)
                            .then(res => vm.workflow = new ECMWorkflowViewModel(res))
                            .catch(err => console.log(err));
                    }
                })
                .catch(err => console.log(err));
        }

        activate();

        function activate() {
            if (workflow.summary) {
                $state.go('assessments.ecm.summary', {assessmentId: workflow.uuid});
                return;
            }
            vm.asideBarExpanded = true;
            vm.permissions = {
                allowed: false,
                isOwner: false,
                action: null,
                iHaveTask: false,
                section: null
            };
            vm.accordionSteps = [];
            vm.reorderSections();
            getAuditTrailLogs();
            clientService.getCompanyInfo()
                .then(res => vm.client = res)
                .catch(err => console.log(err));

            $scope.$watch(() => {
                return vm.workflow.content;
            }, (oldVal, newVal) => {
                if (!angular.equals(oldVal, newVal)) {
                    saveWorkflow();
                }
            }, true);

            userService.getUserProfile()
                .then(res => {
                    vm.user = res;

                    filterTasksBySection();
                    setUserPermissions();
                })
                .catch(err => console.log(err));

            function filterTasksBySection() {
                myTasksService.getMyTasks(vm.workflow, vm.user)
                    .then(res => {
                        var sections = vm.getSections();
                        _.forEach(sections, function (sect, index) {
                            vm.filteredTasks[index] = _.filter(res, function (task) {
                                return task.subject.type === 'section' &&
                                    task.subject.section === sect.identifier && !task.completed;
                            });
                        });
                    })
                    .catch(err => toastr.error(err));
            }

            function setUserPermissions() {
                sendForService.returnPermissions(vm.workflow, vm.user)
                    .then(permissions => {
                        vm.permissions = workflowsDataService.mapPermissionsData(permissions, vm.user, ['workflow', 'section'])

                    })
                    .catch(err => console.log(err));
            }
        }

        function getAuditTrailLogs() {
            auditTrailService.getLogs(workflow.uuid)
                .then(res => {
                    vm.auditTrailActions = AuditTrailActionsViewFactory.createAuditTrailActions(res);
                    var sections = vm.getSections();
                    _.forEach(sections, function (sect, index) {
                        vm.filteredLogs[index] = _.filter(vm.auditTrailActions, function (log) {
                            return log.type === 'section' && log.section === sect.identifier && _.includes(['approve', 'reject'], log.action);
                        });
                    });
                })
                .catch(err => console.log(err));
        }

        function saveWorkflow() {
            ecmWorkflowsService.saveWorkflow(vm.workflow.uuid, vm.workflow.toDTO())
                .then(res => {
                    vm.expandInput('textarea')
                })
                .catch(err => toastr.error(err.data.message));
        }

        function hasApproveTask() {
            return false;
        }

        function toggleComments(question, questionGroup) {
            try {
                question.toggleComments(questionGroup, vm.permissions.allowed);
            } catch (err) {
                toastr.error(err.message);
            }
        }

        function startNewThread(question, questionGroup) {
            try {
                question.startNewThread();
                questionGroup.numberOfThreads++;
            } catch (err) {
                toastr.error(err.message);
            }
        }

        function getStateClassName(workflow) {
            return workflow.state.toLowerCase().replace(' ', '-');
        }
    }
})();
