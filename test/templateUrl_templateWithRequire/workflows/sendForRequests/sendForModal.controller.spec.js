'use strict';

xdescribe('Controller: SendForModalController', function () {
    var controller;
    var scope;
    var $uibModalInstance = {
        close: function () {
        }, dismiss: function () {
        }
    };

    var details = {};
    var user = {
        originalObject: {
            id: '56aa238b7541ffd1149d09d7'
        }
    };

    beforeEach(function () {
        bard.appModule('AngularAmChart');
        bard.appModule('app.workflows');
        bard.inject('$controller', '$q', '$rootScope', 'blockBackdropService', 'assessmentsService', 'sendForService', 'clientService');

        bard.mockService(assessmentsService, {
            getAssessmentDetails: $q.when(details)
        });

        scope = $rootScope.$new();

        controller = $controller('SendForModalController', {
            $uibModalInstance: $uibModalInstance,
            action: 'Review',
            companyUsers: [{email: 'me@mail.com'}, {email: 'otherMe@mail.com'}],
            owner: {fullName: 'Cookie Monster', id: '56aa238b7541ffd1149d09d7'},
            assessment: {
                uuid: '978d3fc2-488c-48dc-9b13-47b35736b4ac',
                owner: '56aa238b7541ffd1149d09d7'
            }
        });

        $rootScope.$apply();
    });

    it('variables should be defined', function () {
        expect(controller.companyUsers).to.exist;
        expect(controller.assessment).to.exist;
        expect(controller.owner).to.be.exist;
        expect(controller.minDate).to.be.exist;
        expect(controller.localData).to.eql([]);
        expect(controller.requestDetails).to.exist;
        expect(controller.closeModal).to.be.a('function');
        expect(controller.selectAssessmentOwner).to.be.a('function');
        expect(controller.send).to.be.a('function');
        expect(controller.toggleQaLast).to.be.a('function');
        expect(controller.addSeries).to.be.a('function');
        expect(controller.localSearch).to.be.a('function');
        expect(controller.addRecipientToNotify).to.be.a('function');
        expect(controller.removeRecipientToNotify).to.be.a('function');
        expect(controller.userIsAlreadySelected).to.be.a('function');
    });

    it('selectAssessmentOwner(): should change the owner', function () {
        controller.selectAssessmentOwner({
            fullName: 'Elmo Fuzz', originalObject: {
                id: '56aa238b7541ffd1149d09d3'
            }
        });
        expect(controller.assessment.owner).to.equal('56aa238b7541ffd1149d09d3');
    });

    it('addSeries(): should open a single empty series', function () {
        var expectedResult = [{recipients: []}];
        controller.addSeries();
        expect(controller.requestDetails.seriesCollection).to.deep.equal(expectedResult);
        controller.requestDetails.seriesCollection = [{recipients: ['56aa238b7541ffd1149d09d3']}];
        expectedResult = [{recipients: ['56aa238b7541ffd1149d09d3']}, {recipients: []}];
        controller.addSeries();
        expect(controller.requestDetails.seriesCollection).to.deep.equal(expectedResult);
    });

    it('toggleQaLast(): should toggle qaLast value', function () {
        controller.toggleQaLast();
        expect(controller.requestDetails.qaLast).to.equal(true);
    });

    it('addRecipientToNotify(): should add a new entry in the notifications array', function () {
        var user = {
            originalObject: 'mail.com'
        };
        controller.addRecipientToNotify(user);
        expect(controller.requestDetails.recipientsToNotify.recipients.length).to.equal(0);
        user.originalObject = 'mail@me.com';
        controller.addRecipientToNotify(user);
        expect(controller.requestDetails.recipientsToNotify.recipients.length).to.equal(1);
    });

    it('removeRecipientToNotify(): should remove a recipient from the array', function () {
        controller.requestDetails.recipientsToNotify.recipients = ['mail@me.com'];
        controller.removeRecipientToNotify('mail@me.com');
        expect(controller.requestDetails.recipientsToNotify.recipients.length).to.equal(0);
    });

    it('userIsAlreadySelected(): should find out if a person is already added in the request', function() {
        var result;
        controller.requestDetails.seriesCollection = [{recipients: [{originalObject: {id:'56aa238b7541ffd1149d09d7'}}]}];
        result = controller.userIsAlreadySelected(user);
        expect(result).to.equal(true);

        user.originalObject.id = '56aa238b7541ffd1149d09d3';
        result = controller.userIsAlreadySelected(user);
        expect(result).to.equal(false);
    });
});
