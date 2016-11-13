xdescribe('recipientsSeries', function () {
    var element;
    var scope;
    var directiveScope;

    beforeEach(function () {
        bard.appModule('app.workflows');
        bard.inject('$rootScope', '$compile', '$q', 'sendForService');

        scope = $rootScope.$new();
        scope.series = [];
        scope.seriesCollection = [[]];

        bard.mockService(sendForService, {
            searchUsersAndUserGroups: $q.when({}),
            openReviewApproveModal: $q.when({}),
            returnPermissions: $q.when({})
        });
        element = '<recipient-series series-item="series" series-collection="seriesCollection"></recipient-series>';
        initializeDirective();
    });

    function initializeDirective() {
        element = $compile(element)(scope);
        scope.$digest();
        directiveScope = element.isolateScope();
    }

    it('should define scope variables', function() {
        expect(directiveScope.addRecipient).to.be.a('function');
        expect(directiveScope.removeRecipient).to.be.a('function');
    });

    it('addRecipient(): should add a recipient to the array', function() {
        var user = {id: '1'};
        directiveScope.addRecipient(user);
        expect(directiveScope.seriesItem.recipients.length).to.equal(1);
    });

    it('removeRecipient(): should remove a recipient from the array', function() {
        directiveScope.seriesItem.recipients = ['1', '2'];
        directiveScope.removeRecipient('1');
        expect(directiveScope.seriesItem.recipients.length).to.equal(1);
    });
});
