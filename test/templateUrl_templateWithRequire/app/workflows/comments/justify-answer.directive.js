(function () {
    'use strict';

    angular.module('app.workflows')
        .directive('justifyAnswer', justifyAnswerDirective);

    /* @ngInject */
    function justifyAnswerDirective() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                answer: '=',
                onSubmit: '='
            },
            templateUrl: 'app/workflows/comments/justify-answer.html',
            link: justifyAnswerDirectiveLink
        };

        /* @ngInject */
        function justifyAnswerDirectiveLink(scope, element, attrs) {
            scope.justifyAnswer = justifyAnswer;
            scope.alertMissingJustification = alertMissingJustification;
            scope.missingJustification = false;

            getCommentType();

            function getCommentType() {
                if (scope.answer.comment === '1') {
                    scope.placeholderMessage = 'You may enter a reason for your answer if you consider it necessary';
                } else {
                    scope.placeholderMessage = 'Please provide a reason for your answer';
                }
            }

            function justifyAnswer(answer, message) {
                if (/^\s*$/.test(message)) {
                    toastr.error('Please enter a text for your message');
                    return;
                }

                scope.onSubmit(answer, message);
            }

            function alertMissingJustification(answer, invalidContent) {
                if (answer.comment === '2' && invalidContent) {
                    scope.missingJustification = true;
                    angular.element(element.find('textarea')).focus();
                    toastr.error('The justification for this answer is required');
                } else {
                    scope.missingJustification = false;
                }
            }

        }
    }
})();
