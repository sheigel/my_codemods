(function () {
    'use strict';

    angular
        .module('app.workflows')
        .controller('EditWorkflowModalController', EditWorkflowModalController);

    /* @ngInject */
    function EditWorkflowModalController($uibModalInstance, blockBackdropService, assessment) {
        var vm = this;

        vm.assessment = assessment;
        vm.confirm = confirm;
        vm.closeModal = closeModal;

        function confirm() {
            blockBackdropService.modalIsOpened = false;
            $uibModalInstance.close(vm.assessment);
        }

        function closeModal() {
            blockBackdropService.modalIsOpened = false;
            $uibModalInstance.dismiss('close');
        }
    }
})();
