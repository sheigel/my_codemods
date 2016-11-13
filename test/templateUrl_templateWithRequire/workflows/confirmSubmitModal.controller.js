(function () {
    'use strict';

    angular
        .module('app.workflows')
        .controller('ConfirmSubmitModalController', ConfirmSubmitModalController);

    /* @ngInject */
    function ConfirmSubmitModalController($uibModalInstance, blockBackdropService, reviewStatus) {
        var vm = this;

        vm.reviewStatus = reviewStatus;
        vm.submitAssessment = submitAssessment;
        vm.closeModal = closeModal;

        function submitAssessment() {
            blockBackdropService.modalIsOpened = false;
            $uibModalInstance.close();
        }

        function closeModal() {
            blockBackdropService.modalIsOpened = false;
            $uibModalInstance.dismiss('close');
        }

    }
})();
