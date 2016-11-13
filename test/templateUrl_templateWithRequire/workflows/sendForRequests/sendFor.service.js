(function () {
    'use strict';

    angular
        .module('app.workflows')
        .service('sendForService', sendForService);

    /* @ngInject */
    function sendForService($uibModal, $rootScope, $q, myTasksService, blockBackdropService, workflowsService,
                            userGroupsService, clientService) {

        return {
            openSendForModal: openSendForModal,
            searchUsersAndUserGroups: searchUsersAndUserGroups,
            openReviewApproveModal: openReviewApproveModal,
            returnPermissions: returnPermissions
        };

        function openSendForModal(taskDetails, action) {
            blockBackdropService.modalIsOpened = true;

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'app/workflows/sendForRequests/sendForModal.html',
                controller: 'SendForModalController as vm',
                windowTopClass: 'modal custom-modal send-for-modal',
                resolve: {
                    action: function () {
                        return action;
                    },
                    taskDetails: function () {
                        return taskDetails;
                    }
                },
                backdrop: 'static',
                keyboard: false
            });

            modalInstance.result.then(function() {});
        }

        function searchUsersAndUserGroups(searchString) {
            //TODO this function should probably not be here since it deals with API data - different than the other functions
            var deferred = $q.defer();

            async.parallel([
                searchUsers,
                searchUserGroups
            ], function (err, results) {
                if (err) {
                    toastr.error(err.message);
                    deferred.reject(toastr.error);
                    return;
                }
                deferred.resolve(_.flatten(results));
            });

            return deferred.promise;

            function searchUserGroups(callback) {
                userGroupsService.getUserGroups(searchString)
                    .then(function (userGroups) {
                        callback(null, userGroups);
                    })
                    .catch(function (res) {
                        callback(res);
                    });
            }

            function searchUsers(callback) {
                clientService.getCompanyUsers(searchString)
                    .then(function (users) {
                        callback(null, users);
                    })
                    .catch(function (res) {
                        callback(res);
                    });
            }
        }

        function openReviewApproveModal(taskDetails, action) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'app/workflows/sendForRequests/reviewApproveModal.html',
                controller: 'ReviewApproveModalController as vm',
                windowTopClass: 'modal custom-modal',
                resolve: {
                    action: function () {
                        return action;
                    },
                    taskDetails: function () {
                        return taskDetails;
                    }
                },
                backdrop: 'static',
                keyboard: false
            });

            modalInstance.result.then(function (data) {
                workflowsService.finishReviewApproval(data)
                    .then(res => {
                        var actionDone = _.includes(['approve', 'reject'], action) ? (res.approveOption.approved ? 'approval' : 'rejection') : action;
                        toastr.success('Your ' + actionDone + ' is done!');
                        $rootScope.$emit('UpdateTasks');
                        $rootScope.$broadcast('UpdateAuditTrail');
                        $rootScope.$broadcast('UpdateWorkflow');
                    })
                    .catch(err => {
                        console.log(err.message);
                        toastr.error(err.data.message);
                    });
            }, function () {
            });
        }

        function returnPermissions(workflow, user) {
            var deferred = $q.defer();

            myTasksService.getMyTasks(workflow, user)
                .then(function (res) {
                    var task = returnTaskOnWorkflow(res, workflow);
                    var result = {
                        task: task || null,
                        isOwner: isWorkflowOwner(user, workflow.owner.id)
                    };
                    return deferred.resolve(result);
                })
                .catch(function (err) {
                    toastr.error(err.data.message);
                    return deferred.reject(err);
                });

            return deferred.promise;
        }

        function isWorkflowOwner(user, workflowOwnerId) {
            return user.id === workflowOwnerId;
        }

        function returnTaskOnWorkflow(tasks, workflow) {
            var reviewTask;
            var approveTask = _.find(tasks, function (task) {
                return workflowTaskActionIs(workflow, task, 'approve');
            });
            if (!approveTask) {
                reviewTask = _.find(tasks, function (task) {
                    return workflowTaskActionIs(workflow, task, 'review');
                });
            }
            return approveTask || reviewTask;

            function workflowTaskActionIs(workflow, task, action) {
                return task.subject.id === workflow.uuid && task.subject.action === action && !task.completed;
            }
        }
    }
})();
