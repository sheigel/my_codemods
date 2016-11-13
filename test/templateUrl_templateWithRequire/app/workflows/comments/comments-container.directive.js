(function () {
    'use strict';

    angular.module('app.workflows')
        .directive('commentsContainer', commentsContainerDirective);

    /* @ngInject */
    function commentsContainerDirective() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                threads: '=',
                type: '=',
                workflow: '=',
                section: '=',
                questionId: '=',
                index: '=',
                permissions: '=',
                isReadonly:'='
            },
            templateUrl: 'app/workflows/comments/comments-container.html',
            controller: commentsContainerDirectiveController,
            controllerAs: 'vm',
            bindToController: true
        };

        /* @ngInject */
        function commentsContainerDirectiveController() {
            const vm = Object.assign(this, {
                toggleComments,
                startNewThread,
                questionHasThreads
            });

            function toggleComments() {
                try {
                    vm.visibleComments = !vm.visibleComments;

                    if (vm.visibleComments && _.isEmpty(vm.threads) &&  vm.permissions.allowed) {
                        vm.startNewThread();
                    }
                } catch (err) {
                    toastr.error(err.message);
                }
            }

            function startNewThread() {
                try {
                    var hasEmptyThread = _.find(vm.threads, function (thread) {
                        return _.isEmpty(thread.comments);
                    });

                    if (hasEmptyThread) {
                        throw new Error('There\'s already an empty thread started');
                    }

                    var thread = {
                        comments: []
                    };

                    vm.threads.unshift(thread);
                } catch (err) {
                    toastr.error(err.message);
                }
            }

            function questionHasThreads() {
                return !_.isEmpty(vm.threads[0].comments);
            }
        }
    }
})();
