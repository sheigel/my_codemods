(function () {
    'use strict';

    angular.module('app.workflows')
        .directive('commentThread', commentThreadDirective);

    /* @ngInject */
    function commentThreadDirective() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                type: '=',
                thread: '=',
                workflow: '=',
                section: '=',
                questionId: '=',
                index: '=',
                allowed: '=',
                isOwner: '='
            },
            templateUrl: 'app/workflows/comments/comment-thread.html',
            controller: commentThreadDirectiveController
        };

        /* @ngInject */
        function commentThreadDirectiveController($scope, commentsService, $location, userService) {
            var userId;
            $scope.comment = {};
            $scope.disabledComments = false;
            $scope.isSummary = $location.path().indexOf('summary') !== -1;
            $scope.addComment = addComment;
            $scope.closeThread = closeThread;

            activate();

            function activate() {
                getUser();

                function getUser() {
                    userService.getUserProfile()
                        .then(function (userProfile) {
                            userId = userProfile.id;
                            $scope.disabledComments = disabledCommentsForUser(userId, $scope.thread);
                        }).catch(function (e) {
                        console.log(e);
                    });
                }
            }

            function disabledCommentsForUser(userId, thread) {
                if (thread && thread.type === 'question') {
                    return _.some(thread.comments, function (comment) {
                        return comment.user.id === userId;
                    });
                }
                return false;
            }

            function closeThread() {
                if (!$scope.thread.isClosed) {
                    commentsService.closeThread($scope.thread, $scope.workflow)
                        .then(function (thread) {
                            $scope.thread.isClosed = thread.isClosed;
                        })
                        .catch(function (res) {
                            toastr.error(res.message);
                        });
                }
            }

            function addComment(workflow, thread, section, index) {
                if (!$scope.comment.text || /^\s*$/.test($scope.comment.text)) {
                    toastr.error('Please enter a text for your message');
                    return;
                }

                if (thread.uuid) {
                    commentsService.addCommentOnExistingThread(workflow.uuid, thread.uuid, $scope.comment.text)
                        .then(onCommentAdded)
                        .catch(onError);
                } else {
                    commentsService.createNewThread(workflow.uuid, {
                        questionId: $scope.questionId,
                        index,
                        section
                    }, $scope.comment.text, $scope.type)
                        .then(onThreadCreated)
                        .catch(onError);
                }

                $scope.comment = {};

                function onCommentAdded(thread) {

                    _.forEach(thread.comments, function (comment) {
                        var found = _.find($scope.thread.comments, function (comm) {
                            return comm.id === comment.id;
                        });
                        if (!found) {
                            $scope.thread.comments.unshift(comment);
                            $scope.disabledComments = disabledCommentsForUser(userId, thread);
                            console.log($scope.disabledComments);
                        }
                    });
                }

                function onThreadCreated(res) {
                    $scope.disabledComments = disabledCommentsForUser(userId, res);
                    thread.uuid = res.uuid;
                    thread.workflowId = res.workflowId;
                    thread.comments = res.comments;
                    thread.questionId = res.questionId;
                    thread.isClosed = res.closed;
                }

                function onError(res) {
                    toastr.error(res.message);
                }
            }
        }
    }
})();
