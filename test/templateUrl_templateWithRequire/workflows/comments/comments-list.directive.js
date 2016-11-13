(function () {
    'use strict';

    angular.module('app.workflows')
        .directive('commentsList', commentsListDirective);

    /* @ngInject */
    function commentsListDirective() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                comment: '='
            },
            template: `
     <div class="comment">
        <img class="comment__user-image" alt="{{comment.user.fullName}}" ng-src="{{comment.user.profilePictureURL || '/img/profile-default.png' }}">
        <div class="comment__user">
            <span class="comment__user-name">{{comment.user.fullName}}</span>
            <span class="comment__user-post-time">{{comment.date | formatClientDate}}</span>
            <span class="comment__user-content">{{comment.message}}</span>
        </div>
    </div>

                `,
            controller: commentThreadDirectiveController
        };

        /* @ngInject */
        function commentThreadDirectiveController($scope, commentsService, $location, userService) {
        }
    }
})();
