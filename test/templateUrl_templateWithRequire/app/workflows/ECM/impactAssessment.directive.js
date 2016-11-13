(function () {
    'use strict';

    angular.module('app.workflows')
        .directive('impactAssessment', impactAssessmentDirective);

    /* @ngInject */
    function impactAssessmentDirective() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                user: '=',
                workflow: '=',
                index: '=',
                section: '=',
                accordionSteps: '=',
                permissions: '=',
                logs: '=',
                tasks: '='
            },
            templateUrl: 'app/workflows/ECM/impactAssessment.html',
            controller: impactAssessmentDirectiveController,
            controllerAs: 'vm',
            bindToController: true
        };

        /* @ngInject */
        function impactAssessmentDirectiveController($rootScope, ecmWorkflowsService, sendForService, ECMWorkflowViewModel) {
            var vm = Object.assign(this, {
                hasApproveTask: false,
                hasTasks,
                getTaskDetails,
                isNotApprovedButLocked,
                assessmentIsReadOnly,
                sectionIsComplete,
                answerSelected,
                showDocumentsCollectionDropdown,
                submitJustification: function (answer, justification) {
                    answer.justification = justification;
                },
                openSendForModal: sendForService.openSendForModal,
                openReviewApproveModal: sendForService.openReviewApproveModal
            });

            $rootScope.$on('ChangeDescriptionModified', function (ev) {
                ecmWorkflowsService.saveWorkflow(vm.workflow.uuid, vm.workflow.toDTO())
                    .then(res => vm.workflow = new ECMWorkflowViewModel(res))
                    .catch(err => console.log(err));
            });

            $rootScope.$on('PriorityChanged', function (ev) {
                vm.workflow.content.impactAssessment.index = vm.index;
            });

            $rootScope.$on('hasDoneTask', function (ev, args) {
                vm.hasCompletedApproveTask = args.approveOption.approved || args.approveOption.rejected;
            });

            function getTaskDetails() {
                return {
                    user: vm.user,
                    workflow: vm.workflow,
                    type: 'section',
                    section: 'impactAssessment'
                };
            }

            function hasTasks() {
                return !_.isEmpty(vm.tasks);
            }

            function showDocumentsCollectionDropdown(question) {
                return (question.type === 'yes/no collections') && !_.isEmpty(_.filter(question.answers, function(answer) {
                        return answer.text === 'yes' && answer.chosen === true;
                    }));
            }

            function answerSelected(question, answer) {
                if (!vm.permissions.isOwner) {
                    toastr.error('Only the workflow owner can answer questions');
                    return;
                }

                if (!vm.workflow.content.impactAssessment.editable || vm.workflow.content.impactAssessment.state === 'approved') {
                    toastr.error('You cannot edit this section.');
                    return;
                }
                markAsChosen(question, answer);
            }

            function isNotApprovedButLocked() {
                return !vm.workflow.content.impactAssessment.editable && vm.workflow.content.impactAssessment.state !== 'approved';
            }

            function assessmentIsReadOnly(){
                return !vm.workflow.content.impactAssessment.editable || isNotApprovedButLocked();
            }

            function sectionIsComplete() {
                return _.every(vm.workflow.content.changeDescriptions, function (description) {
                    return description.assessment.isAssessmentComplete();
                });
            }

            function markAsChosen(question, answer) {
                if (question.type !== 'multiple-choice') {
                    if (question.type === 'yes/no collections' && answer.text === 'no') {
                        _.forEach(question.collections, function(document) {
                            document.selected = false;
                        })
                    }

                    question.answers.forEach(a => a.chosen = false);
                    answer.chosen = true;
                } else {
                    answer.chosen = !answer.chosen;
                }
            }
        }
    }
})();
