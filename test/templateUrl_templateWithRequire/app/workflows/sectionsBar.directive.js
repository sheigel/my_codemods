(function () {
    'use strict';

    angular.module('app.workflows')
        .directive('sectionsBar', sectionBarDirective);

    /* @ngInject */
    function sectionBarDirective() {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: {
                'workflow': '=',
                'sectionsCollection': '=',
                'asideBarExpanded': '=',
                'stepsDetails': '=?'
            },
            templateUrl: 'app/workflows/sectionsBar.html',
            controller: sectionBarDirectiveController
        };

        /* @ngInject */
        function sectionBarDirectiveController($scope, $anchorScroll, $timeout) {

            $scope.toggleAsideBar = toggleAsideBar;
            $scope.isSectionComplete = isSectionComplete;
            $scope.expandSection = expandSection;
            $scope.getCharacterEquivalent = getCharacterEquivalent;

            function toggleAsideBar() {
                $scope.asideBarExpanded = !$scope.asideBarExpanded;
            }

            function isSectionComplete(section) {
                return section.questions ? $scope.workflow.content.assessment.questionGroupCompletionPercentage(section) === 100 : false;
            }

            function expandSection(section, index) {
                section.isExpanded = true;

                $timeout(function () {
                    $anchorScroll.yOffset = 155;
                    $anchorScroll('step' + index);
                }, 400);
            }
            
            function getCharacterEquivalent(number) {
                return String.fromCharCode(97 + number);
            }
        }
    }
})();
