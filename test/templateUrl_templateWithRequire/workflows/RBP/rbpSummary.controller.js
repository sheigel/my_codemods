(function () {
    'use strict';

    angular
        .module('app.workflows')
        .controller('RBPSummaryController', RBPSummaryController);

    /* @ngInject */
    function RBPSummaryController($timeout, $window, $state, $rootScope, clientService, sendForService, workflow, RBPWorkflowViewModel,
                                  RBPSummaryView, userService, workflowsService, rbpWorkflowService, auditTrailService,
                                  workflowsDataService, AuditTrailActionsViewFactory, globalDataService) {
        var vm = this;

        activate();

        function activate() {
            if (!workflow.summary) {
                $state.go('workflows.rbp.fill', {workflowId: workflow.uuid});
                return;
            }

            var workflowView = new RBPWorkflowViewModel(workflow);
            vm.summary = new RBPSummaryView(workflowView, workflow);
            vm.chartData = vm.summary.getDataChart();
            vm.asideBarExpanded = true;
            vm.summary.workflow.content.assessment.questionGroups[0].isExpanded = true;
            vm.permissions = {
                allowed: true,
                isOwner: false,
                action: null,
                iHaveTask: false
            };
            vm.taskDetails = {
                type: 'summary',
                user: vm.user,
                workflow: vm.summary.workflow
            };

            auditTrailService.getLogs(workflow.uuid)
                .then(function (res) {
                    vm.auditTrailActions = AuditTrailActionsViewFactory.createAuditTrailActions(res);
                })
                .catch(function (err) {
                    console.log(err);
                });
            clientService.getCompanyInfo()
                .then(function (res) {
                    vm.client = res;
                })
                .catch(function (err) {
                    console.log(err);
                });
            vm.getStateClassName = getStateClassName;
            vm.openReviewApproveModal = sendForService.openReviewApproveModal;
            vm.goToEditWorkflowPage = goToEditWorkflowPage;
            vm.visibleComments = false;
            vm.showComments = showComments;
            vm.canEditWorkflow = canEditWorkflow;
            vm.hasToComment = hasToComment;
            vm.hasApproveTask = workflowsDataService.hasApproveTask;
            vm.hasReviewTask = workflowsDataService.hasReviewTask;
            vm.openDocument = openDocument;
            vm.getDateOfTimeStamp = workflowsDataService.getDateOfTimeStamp;
            vm.getHoursOfTimeStamp = workflowsDataService.getHoursOfTimeStamp;
            vm.getTaskDetails = getTaskDetails;
            vm.getRangeLevel = getRangeLevel;
            vm.getFileType = globalDataService.getFileType;

            $timeout(function () {
                $('[href^="http://www.amcharts.com"]').remove();
            }, 4000);

            $rootScope.$on('hasDoneTask', function (ev, args) {
                vm.hasCompletedReviewTask = args.reviewed;
                vm.hasCompletedApproveTask = args.approveOption.approved || args.approveOption.rejected;
            });

            $rootScope.$on('OwnerChanged', function (ev) {
                refreshWorkflow();
            });

            $rootScope.$on('UpdateAuditTrail', function (ev) {
                getAuditTrailLogs();
            });

            function getAuditTrailLogs() {
                auditTrailService.getLogs(workflow.uuid)
                    .then(res => {
                        vm.auditTrailActions = AuditTrailActionsViewFactory.createAuditTrailActions(res);
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }

            $rootScope.$on('UpdateWorkflow', function (ev) {
                refreshWorkflow();
            });

            function refreshWorkflow() {
                rbpWorkflowService.getWorkflow(vm.summary.workflow.uuid)
                    .then(res => {
                        vm.summary.workflow.state = res.state;
                        vm.summary.workflow.owner = res.owner;
                    })
                    .catch(err => console.log(err));
            }

            userService.getUserProfile()
                .then(function (res) {
                    vm.user = res;
                    getPermissions();
                })
                .catch(function (err) {
                    console.log(err);
                });
        }

        function getTaskDetails() {
            return {
                type: 'summary',
                user: vm.user,
                workflow: vm.summary.workflow
            };
        }

        function getRangeLevel(output) {
            if (output.range.from === output.limit.min) {
                return 'low';
            }
            if (output.range.to === output.limit.max) {
                return 'high';
            }
            return 'medium';
        }

        function getPermissions() {
            sendForService.returnPermissions(vm.summary.workflow, vm.user)
                .then(function (permissions) {
                    vm.permissions = workflowsDataService.mapPermissionsData(permissions, vm.user, ['summary']);
                })
                .catch(function (err) {
                    console.log(err);
                });
        }

        function getStateClassName(workflow) {
            return workflow.state.toLowerCase().replace(' ', '-');
        }

        function showComments(question) {
            question.visibleComments = !question.visibleComments;
        }

        function goToEditWorkflowPage() {
            if (vm.summary.workflow.editableCopyId) {
                $state.go('workflows.rbp.fill', {workflowId: vm.summary.workflow.editableCopyId});
                return;
            }

            workflowsService
                .createEditableWorkflowCopy(vm.summary.workflow.toDTO())
                .then(function (response) {
                    $state.go('workflows.rbp.fill', {workflowId: response.uuid});
                })
                .catch(function (err) {
                    toastr.error(err.data.error);
                });
        }

        function canEditWorkflow() {
            return vm.summary.workflow.state !== 'approved' && vm.permissions.isOwner;
        }

        function hasToComment() {
            return (vm.hasReviewTask(vm.permissions.iHaveTask, vm.permissions.action) && !vm.hasCompletedReviewTask) ||
                (vm.hasApproveTask(vm.permissions.iHaveTask, vm.permissions.action) && !vm.hasCompletedApproveTask) ||
                vm.permissions.isOwner;
        }

        function openDocument(doc) {
            if (doc.isRecommended) {
                $window.open(doc.location, '_blank');
            }
        }
    }
})();
