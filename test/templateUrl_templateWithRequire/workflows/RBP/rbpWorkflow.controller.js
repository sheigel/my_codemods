(function () {
    'use strict';

    angular
        .module('app.workflows')
        .controller('RBPWorkflowController', RBPWorkflowController);

    /* @ngInject */
    function RBPWorkflowController($state, $rootScope, $uibModal, workflow, clientConfig, workflowsService,
                                   workflowsDataService, rbpWorkflowService, RBPWorkflowViewModel, userService,
                                   sendForService, globalDataService, clientService, auditTrailService,
                                   AuditTrailActionsViewFactory) {
        var vm = this;

        globalDataService.clientConfig = clientConfig;

        activate();

        function activate() {
            if (workflow.summary) {
                $state.go('workflows.rbp.summary', {workflowId: workflow.uuid});
                return;
            }

            vm.workflow = new RBPWorkflowViewModel(workflow);
            vm.asideBarExpanded = true;
            vm.permissions = {
                allowed: false,
                isOwner: false,
                action: null,
                iHaveTask: false
            };
            getAuditTrailLogs();

            clientService.getCompanyInfo()
                .then(res => vm.client = res)
                .catch(err => console.log(err));

            $rootScope.$on('OwnerChanged', function (ev) {
                refreshWorkflow();
            });

            $rootScope.$on('UpdateAuditTrail', function (ev) {
                getAuditTrailLogs();
            });

            function getAuditTrailLogs() {
                auditTrailService.getLogs(workflow.uuid)
                    .then(res => vm.auditTrailActions = AuditTrailActionsViewFactory.createAuditTrailActions(res))
                    .catch(err => console.log(err));
            }

            $rootScope.$on('UpdateWorkflow', function (ev) {
                refreshWorkflow();
            });

            function refreshWorkflow() {
                rbpWorkflowService.getWorkflow(vm.workflow.uuid)
                    .then(res => vm.workflow = new RBPWorkflowViewModel(res))
                    .catch(err => console.log(err));
            }

            vm.hasReviewTask = workflowsDataService.hasReviewTask;
            vm.openReviewApproveModal = sendForService.openReviewApproveModal;
            vm.workflow.content.assessment.questionGroups[0].isExpanded = true;
            vm.getStateClassName = getStateClassName;
            vm.startNewThread = startNewThread;
            vm.toggleComments = toggleComments;
            vm.answerSelected = answerSelected;
            vm.isQuestionGroupComplete = isQuestionGroupComplete;
            vm.canSubmit = canSubmit;
            vm.submitWorkflow = submitWorkflow;
            vm.getTaskDetails = getTaskDetails;
            vm.submitJustification = submitJustification;

            $rootScope.$on('hasDoneTask', function (ev, args) {
                vm.hasCompletedReviewTask = args.reviewed;
            });

            userService.getUserProfile()
                .then(res => {
                    vm.user = res;
                    setUserPermissions();
                })
                .catch(err => {
                    console.log(err);
                });

            function setUserPermissions() {
                sendForService.returnPermissions(vm.workflow, vm.user)
                    .then(permissions => {
                        vm.permissions = workflowsDataService.mapPermissionsData(permissions, vm.user, ['workflow']);
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
        }


        function getTaskDetails() {
            return {
                type: 'workflow',
                user: vm.user,
                workflow: vm.workflow
            };
        }

        function answerSelected(question, answer) {
            if (!vm.permissions.isOwner) {
                toastr.error('Only the workflow owner can answer questions');
                return;
            }
            question.markAsChosen(answer);
            vm.workflow.content.assessment.assignTriggeredQuestionGroups(question, answer);
            saveWorkflow();
        }

        function isQuestionGroupComplete(questionGroup) {
            return vm.workflow.content.assessment.questionGroupCompletionPercentage(questionGroup) === 100;
        }

        function submitJustification(answer, justification){
            answer.justification = justification;
            saveWorkflow()
        }
        function saveWorkflow() {
            var dto = vm.workflow.toDTO();

            rbpWorkflowService
                .saveWorkflow(dto)
                .catch(function (err) {
                    toastr.error(err.data.message);
                });
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

        function canSubmit() {
            return vm.workflow.content.assessment.isAssessmentComplete();
        }

        function submitWorkflow() {
            workflowsService.getReviewStatus(vm.workflow)
                .then(function (res) {
                    if (res.total !== res.completed) {
                        openConfirmSubmitModal(res);
                    } else {
                        generateSummary(vm.workflow);
                    }
                })
                .catch(function (err) {
                    console.log(err.message);
                });
        }

        function openConfirmSubmitModal(reviewStatus) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'app/workflows/confirmSubmitModal.html',
                controller: 'ConfirmSubmitModalController as vm',
                windowTopClass: 'modal custom-modal',
                resolve: {
                    reviewStatus: function () {
                        return reviewStatus;
                    }
                },
                backdrop: 'static',
                keyboard: false
            });

            modalInstance.result.then(function () {
                generateSummary(vm.workflow);
            });
        }

        function generateSummary(workflow) {
            if (!canSubmit()) {
                toastr.error('You can only submit a completed workflow');
            }

            var workflowId = workflow.isCopy ? workflow.copyParentId : workflow.uuid;

            rbpWorkflowService
                .generateSummary(workflowId)
                .then(response => $state.go('workflows.rbp.summary', {workflowId: response.uuid}))
                .catch(err => toastr.error(err.data.message));
        }
    }
})();
