'use strict';

describe('Controller: ReviewApproveModalController', function () {
    var controller;
    var scope;
    var $uibModalInstance = {
        close: function () {
        }, dismiss: function () {
        }
    };
    var taskDetails = {
        workflow: {
            uuid: '978d3fc2-488c-48dc-9b13-47b35736b4ac',
            owner: '56aa238b7541ffd1149d09d7'
        },
        user: {email: 'me@mail.com'},
        type: 'section',
        section: 'initiation'
    };

    beforeEach(function () {
        bard.appModule('AngularAmChart');
        bard.appModule('app.workflows');
        bard.inject('$controller', '$q', '$rootScope', 'blockBackdropService');

        scope = $rootScope.$new();

        controller = $controller('ReviewApproveModalController', {
            $uibModalInstance: $uibModalInstance,
            action: 'review',
            taskDetails: taskDetails,
            response: 'review'
        });

        bard.mockService(blockBackdropService, {
            modalIsOpened: $q.when(true)
        });

        $rootScope.$apply();
    });

    it('should confirm variables\' existence', function () {
        expect(controller.action).to.equal('review');
        expect(controller.closeModal).to.be.a('function');
        expect(controller.done).to.be.a('function');
    });

    it('review(): should finalize the review workflow', function() {
        controller.done();
        expect(blockBackdropService.modalIsOpened).to.equal(false);
    });

    it('closeModal(): should close the modal', function() {
        controller.closeModal();
        expect(blockBackdropService.modalIsOpened).to.equal(false);
    });
});
