(function () {
    'use strict';

    angular.module('app.workflows')
        .directive('initiation', initiationDirective);

    /* @ngInject */
    function initiationDirective($timeout, globalDataService) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                section: '=',
                workflow: '=',
                reorderSections: '=',
                loading: '=',
                permissions: '=',
                user: '=',
                logs: '=',
                accordionSteps: '=',
                tasks: '='
            },
            templateUrl: 'app/workflows/ECM/initiation.html',
            controller: initiationDirectiveController,
            controllerAs: 'vm',
            bindToController: true,
            link: function (scope, element, attrs) {
                $timeout(function () {
                    globalDataService.expandInput('textarea');
                });
            }
        };
        /* @ngInject */
        function initiationDirectiveController($uibModal, $rootScope, globalDataService, validationService,
                                               blockBackdropService, fileUploadService, sendForService) {
            const priorities = {
                normal: 'normal',
                emergency: 'emergency',
                standard: 'standard'
            };

            const vm = Object.assign(this, {
                hasApproveTask: false,
                temporaryChangeDescription: null,
                getChangeDescriptionsClone,
                descriptionMustBeCompleted,
                changePriority,
                toggleScope,
                addDescription,
                validateDescription,
                removeDescription,
                hasTasks,
                isAbleToSendForApproval,
                getTaskDetails,
                canAddDocuments,
                validateAddDocuments,
                sectionApprovedOrUserNotOwner,
                expandInput: globalDataService.expandInput,
                openSendForModal: sendForService.openSendForModal,
                openReviewApproveModal: sendForService.openReviewApproveModal
            });


            $rootScope.$on('hasDoneTask', function (ev, args) {
                vm.hasCompletedApproveTask = args.approveOption.approved || args.approveOption.rejected;
            });

            activate();

            function activate() {
                vm.auditTrailLogs = vm.section.logs;
                manageImpactAssessmentTabs();
            }

            function hasTasks() {
                return !_.isEmpty(vm.tasks);
            }

            function getTaskDetails() {
                return {
                    user: vm.user,
                    workflow: vm.workflow,
                    type: 'section',
                    section: 'initiation'
                };
            }

            function getChangeDescriptionsClone() {
                if (vm.temporaryChangeDescription) {
                    return [...vm.workflow.content.changeDescriptions, vm.temporaryChangeDescription];
                } else {
                    return vm.workflow.content.changeDescriptions;
                }
            }

            function changePriority(priority) {
                vm.workflow.content.initiation.priority = priority;

                if (priority === priorities.emergency) {
                    vm.workflow.content.initiation.scopes = [{
                        text: 'Prevent loss, corruption of critical data or system crash/corruption',
                        chosen: false
                    }, {
                        text: 'Restore functionality to a system immediately',
                        chosen: false
                    }, {
                        text: 'Business Emergency',
                        chosen: false
                    }];
                }
                vm.reorderSections();
            }

            function toggleScope(scope) {
                _.forEach(vm.workflow.content.initiation.scopes, function (scp) {
                    scp.chosen = scp.text === scope.text;
                });
            }

            function addDescription() {
                if (vm.temporaryChangeDescription) {
                    toastr.error('There\'s already an empty change description added');
                } else {
                    vm.temporaryChangeDescription = {
                        documents: []
                    };
                }
            }

            function descriptionMustBeCompleted(description, index) {
                var changeDescriptions = vm.workflow.content.changeDescriptions;

                return changeDescriptions[index] && !description.text && changeDescriptions.length;
            }

            function validateDescription(description, index) {
                var changeDescriptions = vm.workflow.content.changeDescriptions;

                if (validationService.validateString(description.text)) {
                    var existentDescription = changeDescriptions[index];

                    if (!existentDescription) {
                        changeDescriptions.push(description);
                        vm.temporaryChangeDescription = null;
                        $rootScope.$broadcast('ChangeDescriptionModified');
                    } else {
                        changeDescriptions[index].text = description.text;
                    }
                    manageImpactAssessmentTabs();
                } else {
                    toastr.error('Please describe your change');
                }
            }

            function manageImpactAssessmentTabs() {
                vm.accordionSteps = [];
                _.forEach(vm.workflow.content.changeDescriptions, function (step, index) {
                    vm.accordionSteps[index] = {isExpanded: index === 0};
                });
            }

            function removeDescription(description) {
                blockBackdropService.modalIsOpened = true;

                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'app/components/deleteModal.html',
                    controller: 'DeleteModalController as vm',
                    windowTopClass: 'modal custom-modal',
                    resolve: {
                        item: function () {
                            return {
                                name: 'Change Description',
                                body: description
                            };
                        }
                    },
                    backdrop: 'static',
                    size: 'sm',
                    keyboard: false
                });

                modalInstance.result.then(function (deletedItem) {
                    blockBackdropService.modalIsOpened = false;

                    removeAllDescriptionFilesFrom(deletedItem);

                    if (deletedItem === vm.temporaryChangeDescription) {
                        vm.temporaryChangeDescription = null;
                        return;
                    }

                    const index = _.indexOf(vm.workflow.content.changeDescriptions, deletedItem);

                    _.pullAt(vm.workflow.content.changeDescriptions, index);
                    _.pullAt(vm.workflow.content.impactAssessment, index);
                }, function () {
                });
            }

            function removeAllDescriptionFilesFrom(description) {
                _.forEach(description.documents, (doc) => fileUploadService.deleteDocument(doc.key));
            }

            function isAbleToSendForApproval() {
                return validationService.validateString(vm.workflow.content.initiation.title)
                    && vm.workflow.content.changeDescriptions.length > 0
                    && _.every(vm.workflow.content.changeDescriptions, function (item) {
                        return validationService.validateString(item.text)
                    });
            }

            function canAddDocuments(description) {
                return validationService.validateString(description.text);
            }

            function validateAddDocuments(description, event) {
                if (!canAddDocuments(description)) {
                    toastr.error('Please describe your change first');
                    event.stopPropagation();
                    return false;
                }
                return true;
            }
            
            function sectionApprovedOrUserNotOwner() {
                return vm.workflow.content.initiation.state === 'approved' || !vm.permissions.isOwner;
            }
        }
    }
})();
