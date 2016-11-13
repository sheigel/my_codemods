(function () {
    'use strict';

    angular
        .module('app.workflows')
        .factory('workflowsService', workflowsService);

    /* @ngInject */
    function workflowsService($rootScope, $http, $q, config) {

        var workflows = [];
        return {
            getWorkflows: getWorkflows,
            getFilteredWorkflows: getFilteredWorkflows,
            getWorkflowDetails: getWorkflowDetails,
            createWorkflow: createWorkflow,
            deleteWorkflow: deleteWorkflow,
            changeOwner: changeOwner,
            getReviewStatus: getReviewStatus,
            sendForReviewApproval: sendForReviewApproval,
            updateReviewApproval: updateReviewApproval,
            finishReviewApproval: finishReviewApproval,
            createEditableWorkflowCopy: createEditableWorkflowCopy,
            generateImpactAssessmentSummary: generateImpactAssessmentSummary
        };

        function getWorkflows(searchString) {
            var deferred = $q.defer();

            $http.get(config.apiURL + 'workflows', {params: {search: searchString}})
                .then(function (response) {
                    workflows = response.data;
                    return deferred.resolve(response.data);
                })
                .catch(function (err) {
                    return deferred.reject(err);
                });

            return deferred.promise;
        }

        function getFilteredWorkflows(searchObject) {
            var deferred = $q.defer();
            searchObject.state = searchObject.state ? searchObject.state.toLowerCase() : null;

            $http.get(config.apiURL + 'workflows', {
                params: {
                    moduleId: searchObject.module ? searchObject.module.id : undefined,
                    systemName: searchObject.systemName,
                    initiator: searchObject.initiator,
                    state: searchObject.state,
                    startDate: searchObject.startDate,
                    targetDate: searchObject.targetDate,
                    skip: searchObject.skipNumber,
                    limit: searchObject.limitNumber
                }
            })
                .then(function (response) {
                    workflows = response.data;
                    return deferred.resolve(response.data);
                })
                .catch(function (err) {
                    return deferred.reject(err);
                });

            return deferred.promise;
        }

        function getWorkflowDetails(sendData, action) {
            var deferred = $q.defer();

            $http.get(config.apiURL + 'workflows/' + sendData.workflow.uuid + '/details', {
                params: {
                    action: action,
                    type: sendData.type,
                    section: sendData.section
                }
            })
                .then(function (response) {
                    return deferred.resolve(response.data);
                })
                .catch(function (err) {
                    return deferred.reject(err);
                });

            return deferred.promise;
        }

        function createWorkflow(workflowData) {
            var deferred = $q.defer();

            $http.post(`${config.apiURL}workflows/${workflowData.moduleAbbreviation}`, workflowData)
                .then(function (response) {
                    workflows.push(response.data);
                    return deferred.resolve(response.data);
                })
                .catch(function (err) {
                    return deferred.reject(err);
                });

            return deferred.promise;
        }

        function deleteWorkflow(workflowData) {
            var deferred = $q.defer();

            $http.delete(config.apiURL + 'workflows/' + workflowData.uuid)
                .then(function (response) {
                    return deferred.resolve(response.data);
                })
                .catch(function (err) {
                    return deferred.reject(err);
                });

            return deferred.promise;
        }

        function changeOwner(workflowData) {
            var deferred = $q.defer();

            $http.put(config.apiURL + 'workflows/' + workflowData.uuid + '/owner', {owner: workflowData.owner})
                .then(function (response) {
                    var updatedWorkflowData = response.data;
                    var index = _.findIndex(workflows, function (workflow) {
                        return workflow.uuid === updatedWorkflowData.uuid;
                    });
                    workflows[index] = updatedWorkflowData;

                    return deferred.resolve(updatedWorkflowData);
                })
                .catch(function (err) {
                    return deferred.reject(err);
                });

            return deferred.promise;
        }

        function getReviewStatus(workflowData) {
            var deferred = $q.defer();

            $http.get(config.apiURL + 'workflows/' + workflowData.uuid + '/review-status')
                .then(function (response) {
                    return deferred.resolve(response.data);
                })
                .catch(function (err) {
                    return deferred.reject(err);
                });

            return deferred.promise;
        }

        function sendForReviewApproval(sendForReviewApprovalBody) {
            var deferred = $q.defer();

            $http.post(config.apiURL + 'tasks', sendForReviewApprovalBody)
                .then(function (response) {
                    return deferred.resolve(response.data);
                })
                .catch(function (err) {
                    return deferred.reject(err);
                });

            return deferred.promise;
        }

        function updateReviewApproval(sendForReviewApprovalBody) {
            var deferred = $q.defer();

            $http.post(config.apiURL + 'workflows/update/details', sendForReviewApprovalBody)
                .then(function (response) {
                    return deferred.resolve(response.data);
                })
                .catch(function (err) {
                    return deferred.reject(err);
                });

            return deferred.promise;
        }

        function finishReviewApproval(reviewApprovalBody) {
            var deferred = $q.defer();

            $http.put(config.apiURL + 'workflows/' + reviewApprovalBody.subjectId + '/' + reviewApprovalBody.action,
                reviewApprovalBody, {params: {type: reviewApprovalBody.type}})
                .then(function (response) {
                    var result = {
                        reviewed: response.data.outcome.action === 'review' && response.data.completed,
                        approveOption: {
                            approved: response.data.outcome.action === 'approve' && response.data.completed,
                            rejected: response.data.outcome.action === 'reject' && response.data.completed
                        }
                    };
                    $rootScope.$emit('hasDoneTask', result);
                    return deferred.resolve(result);
                })
                .catch(function (err) {
                    return deferred.reject(err);
                });

            return deferred.promise;
        }

        function createEditableWorkflowCopy(workflowData) {
            var deferred = $q.defer();

            $http.post(config.apiURL + 'workflows/' + workflowData.uuid + '/copy')
                .then(function (response) {
                    return deferred.resolve(response.data);
                })
                .catch(function (err) {
                    return deferred.reject(err);
                });

            return deferred.promise;
        }
        
        function generateImpactAssessmentSummary(workflowData) {
            var deferred = $q.defer();

            $http.post(config.apiURL + 'workflows/ecm/' + workflowData.uuid + '/summary')
                .then(function (response) {
                    return deferred.resolve(response.data);
                })
                .catch(function (err) {
                    return deferred.reject(err);
                });

            return deferred.promise;
        }
    }
})();

