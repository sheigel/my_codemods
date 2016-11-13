(function () {
    'use strict';

    angular
        .module('app.workflows')
        .controller('SendForModalController', SendForModalController);

    /* @ngInject */
    function SendForModalController($scope, $uibModalInstance, $rootScope, action, taskDetails,
                                    blockBackdropService, validatorService, workflowsService, sendForService,
                                    clientService) {
        var vm = this;
        var requestIsModified;
        vm.workflow = taskDetails.workflow;
        vm.type = taskDetails.type;
        vm.user = taskDetails.user;
        vm.minDate = new Date();
        vm.requestDetails = {
            action: action,
            seriesCollection: [[]],
            qaLast: false,
            targetDate: null,
            comments: null,
            recipientsToNotify: [],
            completedBy: []
        };
        vm.showRequestContent = true;
        vm.sendButtonDisabled = false;
        vm.closeModal = closeModal;
        vm.send = send;
        vm.toggleQaLast = toggleQaLast;
        vm.addSeries = addSeries;
        vm.searchUsersAndUserGroups = sendForService.searchUsersAndUserGroups;
        vm.searchUsers = clientService.getCompanyUsers;
        vm.addRecipientToNotify = addRecipientToNotify;
        vm.removeRecipientToNotify = removeRecipientToNotify;
        vm.goBackToRequest = goBackToRequest;
        vm.askForConfirmation = askForConfirmation;
        vm.isCompletedByUsers = isCompletedByUsers;
        vm.hasUsersForReviewApprove = hasUsersForReviewApprove;

        activate();

        function activate() {
            var sendData = {
                workflow: vm.workflow,
                type: vm.type,
                section: taskDetails.section
            };
            workflowsService.getWorkflowDetails(sendData, vm.requestDetails.action)
                .then(res => {
                    if (!_.isEmpty(res)) {
                        vm.requestDetails.qaLast = res.qaLast;
                        vm.requestDetails.targetDate = res.targetDate ? new Date(res.targetDate) : null;
                        vm.requestDetails.comments = res.requestComments;
                        vm.requestDetails.seriesCollection = res.assignees;
                        vm.requestDetails.recipientsToNotify = res.notifications;
                        vm.requestDetails.completedBy = res.completedBy;
                    } else {
                        vm.requestDetails.seriesCollection[0][0] = vm.user;
                    }
                    watchRequestDetailsObject();
                })
                .catch(err => console.log(err));

            clientService.getCompanyInfo()
                .then(res => vm.clientConfigurations = res.config.sendForModal)
                .catch(err => console.log(err));
        }

        function watchRequestDetailsObject() {
            $scope.$watch(function () {
                return vm.requestDetails;
            }, function (newVal, oldVal) {
                if (newVal && oldVal !== newVal) {
                    requestIsModified = true;
                }
            }, true);
        }

        function hasUsersForReviewApprove() {
            return _.chain(vm.requestDetails.seriesCollection)
                .flattenDeep()
                .some('id')
                .value();
        }

        function isCompletedByUsers() {
            return vm.requestDetails.completedBy.length > 0;
        }

        function addSeries() {
            var emptyObject = _.find(vm.requestDetails.seriesCollection, function (series) {
                return series.length === 0;
            });

            if (!emptyObject) {
                vm.requestDetails.seriesCollection.push([]);
            } else {
                toastr.error('There is already an open empty series of recipients');
            }
        }

        function toggleQaLast() {
            vm.requestDetails.qaLast = !vm.requestDetails.qaLast;
        }

        function addRecipientToNotify(user) {
            if (user.title || validatorService.validateEmail(user.originalObject)) {
                vm.requestDetails.recipientsToNotify.push(user.originalObject);
            } else {
                toastr.error('Invalid email address');
            }
        }

        function removeRecipientToNotify(recipient) {
            _.remove(vm.requestDetails.recipientsToNotify, function (rec) {
                return rec === recipient;
            });
        }

        function send() {
            blockBackdropService.modalIsOpened = false;

            vm.sendButtonDisabled = true;

            // if (vm.requestDetails.qaLast) {
            //     setQaLast(vm.requestDetails.seriesCollection);
            // }

            var sendForReviewApprovalBody = {
                qaLast: vm.requestDetails.qaLast,
                users: retrieveAssigneesIds(vm.requestDetails.seriesCollection),
                notifications: retrieveRecipientsEmails(vm.requestDetails.recipientsToNotify),
                subject: {
                    id: vm.workflow.uuid,
                    type: vm.type,
                    action: vm.requestDetails.action
                },
                requestComments: vm.requestDetails.comments,
                targetDate: vm.requestDetails.targetDate
            };

            if (vm.type === 'section') {
                sendForReviewApprovalBody.subject.section = taskDetails.section;
            }

            var modalData = {
                sendForReviewApprovalBody: sendForReviewApprovalBody,
                workflow: vm.workflow,
                type: sendForReviewApprovalBody.subject.type,
                section: sendForReviewApprovalBody.subject.section
            };

            sendRequest(modalData, vm.requestDetails.action);
        }

        function sendRequest(sendForData, action) {
            workflowsService.getWorkflowDetails(sendForData, action)
                .then(function (res) {
                    sendOrUpdateRequest(res, sendForData);
                })
                .catch(function (err) {
                    toastr.error(err.data.message);
                });
        }

        function sendOrUpdateRequest(details, sendForData) {
            if (_.isEmpty(details)) {
                workflowsService.sendForReviewApproval(sendForData.sendForReviewApprovalBody)
                    .then(function () {
                        blockBackdropService.modalIsOpened = false;
                        toastr.success('Your request has been sent successfully');
                        $rootScope.$emit('UpdateTasks');
                        $rootScope.$emit('UpdateAuditTrail');
                        $rootScope.$broadcast('UpdateWorkflow');
                        $uibModalInstance.close();
                    })
                    .catch(function (err) {
                        blockBackdropService.modalIsOpened = false;
                        vm.sendButtonDisabled = false;
                        toastr.error(err.data.message);
                    });
            } else {
                workflowsService.updateReviewApproval(sendForData.sendForReviewApprovalBody)
                    .then(function () {
                        blockBackdropService.modalIsOpened = false;
                        toastr.success('Your request has been updated successfully');
                        $rootScope.$emit('UpdateTasks');
                        $rootScope.$emit('UpdateAuditTrail');
                        $rootScope.$broadcast('UpdateWorkflow');
                        $uibModalInstance.close();
                    })
                    .catch(function (err) {
                        blockBackdropService.modalIsOpened = false;
                        vm.sendButtonDisabled = false;
                        toastr.error(err.data.message);
                    });
            }
        }

        // function setQaLast(seriesCollection) {
        //     var qaUsers = _.map(seriesCollection, function (series) {
        //         var i;
        //         var j;
        //         var user;
        //
        //         for (i = 0; i < series.length; i++) {
        //             if (series[i].users) {
        //                 //user group
        //                 for (j = 0; j < series[i].users.length; j++) {
        //                     if (series[i].users[j].department === 'Quality Assurance' || series[i].users[j].department === 'QA') {
        //                         user = _.remove(series, function (rec) {
        //                             return rec === series[i].users[j];
        //                         });
        //                         j--;
        //                         return _.cloneDeep(user);
        //                     }
        //                 }
        //             } else {
        //                 //user
        //                 if (series[i].department === 'Quality Assurance' || series[i].department === 'QA') {
        //                     user = _.remove(series, function (rec) {
        //                         return rec === series[i];
        //                     });
        //                     i--;
        //                     return _.cloneDeep(user);
        //                 }
        //             }
        //         }
        //     });
        //
        //     seriesCollection.push(_.flatten(qaUsers));
        // }

        function retrieveAssigneesIds(seriesCollection) {
            return _.map(seriesCollection, function (series) {
                return _.chain(series)
                    .map(function (rec) {
                        if (rec.users) {
                            return _.map(rec.users, 'id');
                        } else {
                            return rec.id;
                        }
                    })
                    .flatten()
                    .value();
            });
        }

        function retrieveRecipientsEmails(series) {
            return _.chain(series)
                .map(function (rec) {
                    if (rec.users) {
                        return _.map(rec.users, 'email');
                    } else if (rec.email) {
                        return rec.email;
                    } else {
                        return rec;
                    }
                })
                .flatten()
                .value();
        }

        function askForConfirmation() {
            if (requestIsModified) {
                vm.showRequestContent = false;
            } else {
                vm.closeModal();
            }
        }

        function goBackToRequest() {
            vm.showRequestContent = true;
        }

        function closeModal() {
            blockBackdropService.modalIsOpened = false;
            $uibModalInstance.dismiss('close');
        }
    }
})();
