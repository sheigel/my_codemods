describe('WorkflowsController', function () {
    var controller;
    var workflows = [];
    var scope;
    var workflowDataMock = {
        uuid: '8840b424-5702-4aa4-a93b-5ea5cbfdf1cd'
    };
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

    var companyInfo = {
        _id: '5746b645050e711c1495f6a3',
        contacts: [
            {
                firstName: 'Jinx',
                lastName: 'Jinxulin',
                email: 'jinx@jinx.com',
                phone: '074638432'
            }
        ],
        name: 'jixn',
        domain: 'jinx',
        config: {
            targetDate: true,
            dateFormat: 'DD/MMM/YYYY',
            organizations: [
                {
                    name: 'org1',
                    sites: [
                        {
                            name: 'siteName, SN',
                            systems: [
                                {
                                    name: 'RPD',
                                    id: 736522
                                },
                                {
                                    name: 'ERP',
                                    id: 876532
                                }
                            ]
                        },
                        {
                            name: 'siteName1, SN1',
                            systems: [
                                {
                                    name: 'IES',
                                    id: 876542
                                }
                            ]
                        }
                    ]
                },
                {
                    name: 'org2',
                    sites: [
                        {
                            name: 'siteName2, SN'
                        },
                        {
                            name: 'siteName3'
                        }
                    ]
                }
            ]
        },
        licenses: {
            admin: 3,
            editor: 2,
            viewer: 2
        },
        logo: 'https://btr-documents.s3.amazonaws.com/logos%2F49b18b2f-134e-4bf5-9c93-71c656bf9c25.jpg',
        published: true,
        createdAt: '2016-05-26T08:39:33.929+0000',
        updatedAt: '2016-05-31T07:53:47.054+0000'
    };

    beforeEach(function () {
        bard.appModule('app.workflows');
        bard.inject('$controller', '$q', '$rootScope', '$uibModal', '$state', 'clientService', 'userService', 'workflowsService');

        scope = $rootScope.$new();

        bard.mockService(workflowsService, {
            createWorkflow: $q.when(workflowDataMock),
            getWorkflows: $q.when(workflows),
            getFilteredWorkflows: $q.when(workflows)
        });

        bard.mockService(userService, {
            getUserProfile: $q.when(user)
        });

        bard.mockService(clientService, {
            getCompanyInfo: $q.when(companyInfo)
        });

        controller = $controller('WorkflowsController', {
            clientConfig: {
                targetDate: true,
                dateFormat: 'll'
            },
            $scope: scope
        });
        $rootScope.$apply();
    });

    it('should be created successfully', function () {
        expect(controller).to.be.ok;
    });

    it('activate(): should populate the workflows array', function () {
        expect(controller.workflows).to.exist;
    });

    it('getStateClassName(): should return the workflow\'s state formatted', function () {
        var workflow = {
            state: 'In Review'
        };
        var result = controller.getStateClassName(workflow);
        expect(result).to.equal('in-review');
    });
})
;
