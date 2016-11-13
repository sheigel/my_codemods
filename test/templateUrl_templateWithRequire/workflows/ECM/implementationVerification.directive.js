(function () {
    'use strict';

    angular.module('app.workflows')
        .directive('implementationVerification', implementationVerificationDirective);

    /* @ngInject */
    function implementationVerificationDirective() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                workflow: '=',
                afterAssessment: '=',
                index: '=',
                section: '=',
                permissions: '=',
                user: '=',
                logs: '=',
                tasks: '='
            },
            templateUrl: 'app/workflows/ECM/implementationVerification.html',
            controller: implementationVerificationDirectiveController,
            controllerAs: 'vm',
            bindToController: true
        };

        /* @ngInject */
        function implementationVerificationDirectiveController($rootScope, blockBackdropService, $uibModal, sendForService) {
            var vm = Object.assign(this, {
                answerSelected,
                isNotApprovedButLocked,
                triggerExtraInfo,
                openAskOwnerApprovalModal,
                sectionIsComplete,
                questionsAreAnswered,
                hasTasks,
                getTaskDetails,
                openSendForModal: sendForService.openSendForModal,
                openReviewApproveModal: sendForService.openReviewApproveModal
            });

            $rootScope.$on('hasDoneTask', function (ev, args) {
                vm.hasCompletedApproveTask = args.approveOption.approved || args.approveOption.rejected;
            });

            function triggerExtraInfo(question, questionType, answer) {
                return question.type === ('yes/no ' + questionType) && answer.text === 'yes' && answer.chosen;
            }

            function isNotApprovedButLocked() {
                return !vm.workflow.content.implementationVerification.editable &&
                    vm.workflow.content.implementationVerification.state !== 'approved';
            }

            function answerSelected(question, answer) {
                if (!vm.permissions.isOwner) {
                    toastr.error('Only the workflow owner can answer questions');
                    return;
                }

                if (!vm.workflow.content.implementationVerification.editable || vm.workflow.content.implementationVerification.state === 'approved') {
                    toastr.error('You cannot edit this section.');
                    return;
                }
                vm.workflow.content.implementationVerification.assessment.assignTriggeredQuestionGroups(question, answer);
                markAsChosen(question, answer);
            }

            function markAsChosen(question, answer) {
                question.answers.forEach(a => {
                    a.chosen = false;
                    if (a.date) {
                        a.date = null;
                    }
                    if (a.deviationReferences) {
                        a.deviationReferences = "";
                    }
                });
                answer.chosen = true;
            }

            function openAskOwnerApprovalModal() {
                if(!vm.permissions.isOwner || vm.workflow.content.implementationVerification.ownerApproved ||
                    !vm.questionsAreAnswered()) {
                   return;
                }

                blockBackdropService.modalIsOpened = true;

                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'app/components/confirmationWithPasswordModal.html',
                    controller: 'ConfirmationWithPasswordModalController as vm',
                    windowTopClass: 'modal custom-modal',
                    resolve: {
                        action: {
                            title: 'Approve ECM',
                            message: 'approve this ECM workflow'
                        },
                        user: vm.user
                    },
                    backdrop: 'static',
                    keyboard: false
                });

                modalInstance.result.then(function () {
                    vm.workflow.content.implementationVerification.ownerApproved = true;
                });
            }
            
            function sectionIsComplete(){
                return vm.questionsAreAnswered() && vm.workflow.content.implementationVerification.ownerApproved;
            }

            function questionsAreAnswered() {
                return vm.workflow.content.implementationVerification.assessment.isAssessmentComplete();
            }

            function getTaskDetails() {
                return {
                    user: vm.user,
                    workflow: vm.workflow,
                    type: 'section',
                    section: 'implementationVerification'
                };
            }

            function hasTasks() {
                return !_.isEmpty(vm.tasks);
            }
        }
    }
})();
