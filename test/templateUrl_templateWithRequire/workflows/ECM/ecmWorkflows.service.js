(function () {
    'use strict';

    angular
        .module('app.workflows')
        .factory('ecmWorkflowsService', ecmWorkflowsService);

    /* @ngInject */
    function ecmWorkflowsService($http, $q, config) {

        var workflows = [];
        let baseUrl = `${config.apiURL}workflows/ecm/`;
        return {
            getWorkflow,
            saveWorkflow
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

        function saveWorkflow(uuid, workflowData) {
            var deferred = $q.defer();

            $http.put(baseUrl + uuid, workflowData)
                .then(function (response) {
                    var updatedAssessmentData = response.data;

                    var index = _.findIndex(workflows, function (assessment) {
                        return assessment.uuid === updatedAssessmentData.uuid;
                    });

                    workflows[index] = updatedAssessmentData;

                    return deferred.resolve(updatedAssessmentData);
                })
                .catch(function (err) {
                    return deferred.reject(err);
                });

            return deferred.promise;
        }

        function generateSummary(assessmentData) {
            var deferred = $q.defer(); 

            var assessmentId = assessmentData.isCopy ? assessmentData.copyParentId : assessmentData.uuid;

            $http.put(config.apiURL + 'assessments/' + assessmentId + '/summary')
                .then(function (response) {
                    return deferred.resolve(response.data);
                })
                .catch(function (err) {
                    return deferred.reject(err);
                });

            return deferred.promise;
        }

        function removeSummary(assessmentData) {
            var deferred = $q.defer();

            $http.delete(config.apiURL + 'assessments/' + assessmentData.uuid + '/summary')
                .then(function (response) {
                    return deferred.resolve(response.data);
                })
                .catch(function (err) {
                    return deferred.reject(err);
                });

            return deferred.promise;
        }

        function createEditableAssessmentCopy(assessmentData) {
            var deferred = $q.defer();

            $http.post(config.apiURL + 'assessments/' + assessmentData.uuid + '/copy')
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
