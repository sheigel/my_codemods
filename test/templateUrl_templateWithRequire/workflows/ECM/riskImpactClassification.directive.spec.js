describe('riskImpactClassification', function () {

    var element;
    var scope;
    var directiveScope;
    var impactClasses = [
        {
            name: 'High',
            recommendation: 'Run, Forest, run!',
            expanded: true,
            changeDescriptions: []
        },
        {
            name: 'Medium',
            recommendation: 'Not cool bro.',
            expanded: false,
            changeDescriptions: []
        },
        {
            name: 'Low',
            recommendation: 'You should pay more attention',
            expanded: false,
            changeDescriptions: []
        }
    ];
    var workflow = {
        content: {
            changeDescriptions: [{
                summary: [
                    {
                        limit: {
                            min: 0,
                            max: 22
                        },
                        score: 15,
                        range: {
                            name: 'High',
                            from: 15,
                            to: 22
                        }
                    }
                ],
                documents: [],
                text: 'first',
                assessment: {
                    uuid: '245989ec-7ada-4312-a67a-c0d31c848984',
                    template: {
                        id: '580f42510225b7ae263cee8b',
                        name: 'new ECM templ for Hogs',
                        description: 'descr',
                        module: '57ab1273b3215f2c3221a65d',
                        category: 'Infrastructure'
                    },
                    questions: [
                        {
                            text: 'Does the system directly affect or directly support a regulated process, a regulatory decision, or directly affect the efficacy and quality of a drug product?',
                            type: 'yes/no',
                            answers: [
                                {
                                    text: 'yes',
                                    score: 5,
                                    comment: '0',
                                    visibleJustification: true
                                },
                                {
                                    text: 'no',
                                    score: 4,
                                    comment: '0',
                                    visibleJustification: true
                                }
                            ],
                            collections: null,
                            questionId: 'bb5c512e-5db8-4cf8-a99d-bc3e0eed5572',
                            questionGroup: {
                                id: '578cb6acf531debd093ade2f',
                                name: 'GxP Software Criticality Assessment Questions',
                                type: 'sub'
                            }
                        }
                    ]
                }
            }]
        }
    };

    beforeEach(function () {
        angular.mock.module('app.workflows', function ($provide) {
            $provide.constant('impactClasses', impactClasses);
        });
        bard.inject('$rootScope', '$compile', '$q');

        scope = $rootScope.$new();
        scope.workflow = workflow;
        element = '<risk-impact-classification workflow="workflow"></risk-impact-classification>';
        initializeDirective();
    });

    function initializeDirective() {
        element = $compile(element)(scope);
        scope.$digest();
        directiveScope = element.isolateScope();
    }

    it('should initialize variables', function () {
        directiveScope.vm.impactClasses[0].changeDescriptions = [];
        expect(angular.copy(directiveScope.vm.impactClasses)).to.deep.equal(impactClasses);
    });

    it('should assign CDs to their category', function () {
        directiveScope.vm.assignChangeDescriptions();
        expect(directiveScope.vm.impactClasses[0].changeDescriptions).to.have.lengthOf(1);
        expect(directiveScope.vm.impactClasses[1].changeDescriptions).to.have.lengthOf(0);
        expect(directiveScope.vm.impactClasses[2].changeDescriptions).to.have.lengthOf(0);
    });
});