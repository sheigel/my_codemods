(function () {
    'use strict';

    angular
        .module('app.workflows')
        .factory('rbpWorkflowService', rbpWorkflowService);

    /* @ngInject */
    function rbpWorkflowService($http, $q, config) {

        var workflows = [];
        let baseUrl = `${config.apiURL}workflows/rbp/`;
        return {
            getWorkflow,
            saveWorkflow,
            generateSummary
        };

        function getWorkflow(workflowId) {
            var deferred = $q.defer();

            $http.get(baseUrl + workflowId)
                .then(function (response) {
                    workflows.push(response.data);
                    return deferred.resolve(response.data);
                })
                .catch(function (err) {
                    return deferred.reject(err);
                });

            return deferred.promise;
        }

        function saveWorkflow(workflowData) {
            var deferred = $q.defer();

            $http.put(baseUrl + workflowData.uuid, workflowData)
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

        function generateSummary(workflowId) {
            var deferred = $q.defer();

            $http.post(baseUrl + workflowId + '/summary')
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
