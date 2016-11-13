(function () {
    'use strict';

    angular
        .module('app.workflows')
        .controller('ReviewApproveModalController', ReviewApproveModalController);

    /* @ngInject */
    function ReviewApproveModalController($uibModalInstance, blockBackdropService, action, taskDetails, userService) {
        var vm = this;
        vm.action = action;
        vm.taskDetails = taskDetails;
        vm.closeModal = closeModal;
        vm.done = done;
        vm.password = '';
        vm.comments = {
            text: ''
        };

        function done() {
            if (vm.action === 'reject' && (/^\s*$/.test(vm.comments.text))) {
                toastr.error('Comments are mandatory for this action');
                return;
            }

            var modalData = {
                comments: vm.comments.text,
                userId: vm.taskDetails.user.id,
                subjectId: vm.taskDetails.workflow.uuid,
                action: vm.action,
                type: vm.taskDetails.type,
                section: vm.taskDetails.section
            };

            if (vm.action === 'approve' || vm.action === 'reject') {
                checkPassword(modalData);
            } else {
                sendData(modalData);
            }
        }

        function sendData(modalData) {
            blockBackdropService.modalIsOpened = false;
            $uibModalInstance.close(modalData);
        }

        function checkPassword(modalData) {
            userService.validatePassword(vm.password)
                .then(() => {
                    sendData(modalData);
                    vm.comments = {};
                })
                .catch(err => toastr.error(err.message));
        }

        function closeModal() {
            blockBackdropService.modalIsOpened = false;
            $uibModalInstance.dismiss('close');
        }
    }
})();
