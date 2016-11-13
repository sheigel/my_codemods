describe('commentsContainer', function () {
    var element;
    var scope;
    var directiveScope;
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
    var user = {id: '56aa22ee7541ffd1149d09d5'};

    beforeEach(function () {
        bard.appModule('app.workflows');
        bard.inject('$rootScope', '$compile', '$q', 'userService');

        bard.mockService(userService, {
            getUserProfile: $q.when(user)
        });

        scope = $rootScope.$new();
        scope.threads = [];
        scope.workflow = workflow;
        scope.questionID = '123456789110';
        scope.assessmentIsReadOnly = () => false;
        scope.permissions = {allowed: true, isOwner: true};

        element = '<comments-container threads="threads" workflow="vm.workflow" type="\'question\'"' +
            ' section="\'implementation\'" index="0" question-id="questionID"' +
            ' permissions="permissions" item="\'section\'" is-readonly="assessmentIsReadOnly()"></comments-container>';

        initializeDirective();
    });

    function initializeDirective() {
        element = $compile(element)(scope);
        scope.$digest();
        directiveScope = element.isolateScope();
    }

    it('should create a new thread when toggle', function () {
        var startNewThreadSpy = sinon.spy(directiveScope.vm, 'startNewThread');
        directiveScope.vm.toggleComments();
        expect(startNewThreadSpy).to.have.been.called;
        expect(directiveScope.vm.threads).to.eql([{
            comments: []
        }]);
    });

    it('should toggle the comments section', function () {
        expect(directiveScope.vm.visibleComments).to.not.be.ok;
        directiveScope.vm.toggleComments();
        expect(directiveScope.vm.visibleComments).to.be.ok;
    });

    xit('should not allow 2 empty threads in array', function () {
        directiveScope.vm.threads = [{comments: []}];
        expect(function() {
            directiveScope.vm.startNewThread();
        }).to.throw(new Error('There\'s already an empty thread started'));
    });
});