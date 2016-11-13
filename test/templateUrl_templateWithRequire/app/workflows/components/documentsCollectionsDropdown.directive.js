(function () {
    'use strict';

    angular.module('app.workflows')
        .directive('documentsCollectionsDropdown', DocumentsCollectionsDropdownDirective);

    /* @ngInject */
    function DocumentsCollectionsDropdownDirective() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                collections: '=',
                permissions: '=',
                isReadonly: '=',
            },
            templateUrl: 'app/workflows/components/documentsCollectionsDropdown.html',
            controller: DocumentsCollectionsDropdownDirectiveController,
            controllerAs: 'vm',
            bindToController: true
        };

        /* @ngInject */
        function DocumentsCollectionsDropdownDirectiveController(toastr) {
            var vm = Object.assign(this, {
                selectCollection,
                selectedCollectionsNames
            });

            function selectedCollectionsNames() {
                return _.chain(vm.collections)
                    .filter( (col) => col.selected)
                    .map('name')
                    .join(', ')
                    .value();
            }

            function selectCollection(collection, event) {
                if (!vm.permissions.isOwner) {
                    toastr.error('Only the workflow owner can answer questions');
                    return;
                }
                collection.selected = !collection.selected;
                event.stopPropagation();
            }
        }
    }
})();
