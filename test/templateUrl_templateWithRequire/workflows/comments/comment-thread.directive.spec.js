describe('commentThread', function () {
    var element;
    var scope;
    var directiveScope;
    var user = {id: '56aa22ee7541ffd1149d09d5'};
    var thread = {
        comments: [{
            user: {
                id: '56aa22ee7541ffd1149d09d5'
            }
        }],
        isClosed: false
    };

    beforeEach(function () {
        bard.appModule('app.workflows');
        bard.inject('$rootScope', '$compile', '$q', '$location', 'userService', 'commentsService');

        bard.mockService(userService, {
            getUserProfile: $q.when(user)
        });

        bard.mockService(commentsService, {
            closeThread: $q.when(thread)
        });

        scope = $rootScope.$new();
        scope.assessment = {};
        scope.thread = thread;
        scope.question = {};
        element = '<comment-thread assessment="assessment" type="\'question\'" thread="thread" question="question"' +
            '></comment-thread>';
        initializeDirective();
    });

    function initializeDirective() {
        element = $compile(element)(scope);
        scope.$digest();
        directiveScope = element.isolateScope();
    }

    it('addComment(): should be a function', function () {
        expect(directiveScope.addComment).to.be.a('function');
    });

    it('addComment(): should be a function', function () {
        expect(directiveScope.closeThread).to.be.a('function');
    });

    it('disabledComments: should confirm if the user has the right to comment', function() {
        expect(directiveScope.disabledComments).to.exist;
    });

    it('isSummary: should check if user is on summary view', function() {
        $location.path('assessments/623a8e93-3d02-44ca-b0a9-409d57c46f3a/fill');
        initializeDirective();
        expect(directiveScope.isSummary).to.equal(false);
    });
});
