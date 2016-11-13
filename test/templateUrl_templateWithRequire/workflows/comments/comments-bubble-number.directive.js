(function () {
    'use strict';

    angular.module('app.workflows')
        .directive('commentsBubbleNumber', commentsBubbleNumberDirective);

    /* @ngInject */
    function commentsBubbleNumberDirective() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                question: '=',
                questionGroups: '=',
                sectionsGroup: '='
            },
            controllerAs: 'vm',
            bindToController: true,
            template: `
<span>
    <span class="icon-icc_comments comments-bubble comments-bubble__question"
                                              ng-if="vm.getThreadsCount() > 0">
    <span class="bubble-number">{{vm.getThreadsCount()}}</span>
</span>
`,
            controller: commentsBubbleNumberDirectiveController
        };

        function commentsBubbleNumberDirectiveController() {
            const vm = Object.assign(this, {
                getThreadsCount
            });

            function getThreadsCount() {
                let questionsFromGroups = _.flatMap([].concat(vm.questionGroups || []), 'questions');
                let sectionsGroup = [].concat(vm.sectionsGroup || []);
                let questions = [vm.question, ...questionsFromGroups, ...sectionsGroup];

                return _.chain(questions)
                    .flatMap('commentThreads')
                    .compact()
                    .size()
                    .value();
            }
        }
    }
})();
