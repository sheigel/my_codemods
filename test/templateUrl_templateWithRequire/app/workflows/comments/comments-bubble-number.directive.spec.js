describe('commentsBubbleNumber', function () {
    var element;
    var scope;
    var directiveScope;

    beforeEach(function () {
        bard.appModule('app.workflows');
        bard.inject('$rootScope', '$compile', '$q');

        scope = $rootScope.$new();

        element = '<comments-bubble-number question="question" question-group="questionGroups" sections-group="sectionsGroup"></comments-bubble-number>';
        initializeDirective();
    });

    function initializeDirective() {
        element = $compile(element)(scope);
        scope.$digest();
        directiveScope = element.isolateScope();
    }
    
    it('should return 0 threads', function() {
        var result = directiveScope.vm.getThreadsCount();
        expect(result).to.equal(0);
    });

    it('should return the number of threads on a question', function() {
        directiveScope.vm.question = { commentThreads: [{message: 'asdf'}]};
        var threadsPerQuestion =  directiveScope.vm.getThreadsCount();
        expect(threadsPerQuestion).to.equal(directiveScope.vm.question.commentThreads.length);
    });

    it('should return the number of threads on a questionGroup', function() {
        directiveScope.vm.questionGroups = { questions: [{commentThreads: [{message: 'asdf'}, {message: 'qwerty'}] }, {commentThreads: [{message: 'asdf'}, {message: 'qwerty'}] }] };
        var threadsPerQuestionGroup =  directiveScope.vm.getThreadsCount();
        expect(threadsPerQuestionGroup).to.equal(4);
    });

    it('should return the number of threads on a sectionsGroup', function() {
        directiveScope.vm.sectionsGroup = [{commentThreads: [{message: 'qwerty'}] }, {commentThreads: [{message: 'asdf'}, {message: 'qwerty'}]}] ;
        var threadsPerQuestionGroup =  directiveScope.vm.getThreadsCount();
        expect(threadsPerQuestionGroup).to.equal(3);
    });
});