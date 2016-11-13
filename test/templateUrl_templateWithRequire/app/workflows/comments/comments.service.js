(function () {
    'use strict';

    angular
        .module('app.workflows')
        .service('commentsService', commentsService);

    /* @ngInject */
    function commentsService($http, $q, config) {

        return {
            createNewThread: createNewThread,
            addCommentOnExistingThread: addCommentOnExistingThread,
            closeThread: closeThread
        };

        function createNewThread(workflowId, questionLocation, message, type) {
            var deferred = $q.defer();
            var url = config.apiURL +  'workflows/' + workflowId + '/comment-threads';

            $http.post(url, Object.assign({message: message, type: type}, questionLocation))
                .then(function (response) {
                    return deferred.resolve(response.data);
                }).catch(function (err) {
                    return deferred.reject(err.data);
                });

            return deferred.promise;
        }

        function addCommentOnExistingThread(workflowId, threadId, message) {
            var deferred = $q.defer();
            var url = config.apiURL + 'workflows/' + workflowId + '/comment-threads/' + threadId;

            $http.put(url, {message: message})
                .then(function (response) {
                    return deferred.resolve(response.data);
                }).catch(function (err) {
                    return deferred.reject(err.data);
                });

            return deferred.promise;
        }

        function closeThread(thread, workflow) {
            var deferred = $q.defer();
            var url = config.apiURL + 'workflows/' + workflow.uuid + '/comment-threads/' + thread.uuid + '/status';

            $http.put(url)
                .then(function (response) {
                    return deferred.resolve(response.data);
                }).catch(function (err) {
                    return deferred.reject(err.data);
                });

            return deferred.promise;
        }
    }
})();
