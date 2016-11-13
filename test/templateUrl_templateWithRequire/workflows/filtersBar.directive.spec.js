describe('filtersBar', function () {
    var element;
    var scope;
    var directiveScope;
    var user = {
        _id: '56f9146dc8a2ccb401623e3b',
        id: null,
        clientId: '56aa238b7541ffd1149d09d6',
        email: 'fred.weasley@hp.com',
        lastName: 'Weasley',
        firstName: 'Fred',
        phoneNumber: null,
        profilePicture: null,
        status: 'inactive',
        role: 'editor',
        password: '$2a$10$uyXe5ryBSbXcfWunJXuCUO2THcRG35LbMqSKOlkLfUYKG3aXGfFtG',
        createdAt: '2016-03-28T11:24:29.275Z',
        updatedAt: '2016-03-28T11:24:29.275Z',
        department: 'Supply Chain',
        lastLogin: null,
        showAcronyms: true,
        organization: null,
        site: null
    };
    var modules = {};
    var systems = ['RBS', 'ERP'];

    beforeEach(function () {
        bard.appModule('app.workflows');
        bard.inject('$rootScope', '$compile', '$q', '$state', '$localStorage', 'workflowsService',
            'clientService', 'userService');

        bard.mockService(userService, {
            getUserProfile: $q.when(user)
        });

        bard.mockService(clientService, {
            getSystemNames: $q.when(systems)
        });

        scope = $rootScope.$new();
        scope.filtersExpanded = true;
        var deferred = $q.defer();
        scope.clientModules = deferred.promise;
        scope.clientModules.then(function (data) {
            scope.modules = data;
        });
        deferred.resolve(modules);
        scope.workflows = [];
        scope.loadMoreWorkflows = function () {
        };
        scope.filters = {};
        scope.systems = systems;
        element = '<filters-bar expanded="filtersExpanded" modules="clientModules" workflows="workflows" filters="filters" load-workflows="loadMoreWorkflows" systems="systems"></filters-bar>';
        initializeDirective();
    });

    function initializeDirective() {
        element = $compile(element)(scope);
        scope.$digest();
        directiveScope = element.isolateScope();
    }

    it('activate(): should initialize some variables', function () {
        var states = ['Started', 'In Review', 'Reviewed', 'In Approval', 'Approved'];
        expect(directiveScope.vm.expanded).to.equal(true);
        expect(directiveScope.vm.modules).to.be.ok;
        expect(directiveScope.vm.filters).to.be.ok;
        expect(directiveScope.vm.systems).to.eql(systems);
    });

    it('toggleBar(): should open/close the filters bar', function () {
        directiveScope.vm.toggleBar();
        expect(directiveScope.vm.expanded).to.equal(false);
    });

    it('inputChanged(): should reset the initiator field if string is empty', function () {
        directiveScope.vm.inputChanged('abcd');
        expect(directiveScope.vm.filters.initiator).to.equal(null);
    });

    xit('goToWorkflow(): should redirect user to the selected workflow', function () {
        var workflow = {
            originalObject: {
                id: '56f9146dc8a2ccb401623e3a'
            }
        };
        var $state = {
            go: function (state, params) {
            }
        };
        var stateSpy = sinon.spy($state, 'go');

        directiveScope.vm.goToWorkflow(workflow);
        expect(stateSpy).to.have.been.called();
    });

    it('selectInitiatorFilter(): should select the initiator to filter by', function () {
        user.originalObject = {
            id: '56f9146dc8a2ccb401623e3b'
        };
        directiveScope.vm.selectInitiatorFilter(user);
        expect(directiveScope.vm.filters.initiator).to.equal(user.originalObject);
    });

    it('selectModuleFilter(): should select the type', function () {
        var expectedValue = {
            name: 'Test name'
        };
        directiveScope.vm.selectModuleFilter(expectedValue);
        expect(directiveScope.vm.filters.module).to.equal(expectedValue);
    });

    it('selectSystemFilter(): should select the system', function () {
        var expectedValue = 'Some system';
        directiveScope.vm.selectSystemFilter(expectedValue);
        expect(directiveScope.vm.filters.system).to.equal(expectedValue);
    });

    it('selectStateFilter(): should select the state', function () {
        var expectedValue = 'In Approval';
        directiveScope.vm.selectStateFilter(expectedValue);
        expect(directiveScope.vm.filters.state).to.equal(expectedValue);
    });

    it('toggleMyWorkflows(): should select/deselect \'initiated by me\' option', function () {
        directiveScope.vm.toggleMyWorkflows();
        expect(directiveScope.vm.myWorkflowsFilterActive).to.equal(true);
    });

    it('toggleRememberSettings(): should select/deselect \'remember my settings\' option', function () {
        directiveScope.vm.toggleRememberSettings();
        expect(directiveScope.vm.rememberOptionActive).to.equal(true);
    });

    it('resetFilter(): should set the filter to null', function () {
        directiveScope.vm.resetFilter('type');
        expect(directiveScope.vm.filters.type).to.equal(null);
    });
});
