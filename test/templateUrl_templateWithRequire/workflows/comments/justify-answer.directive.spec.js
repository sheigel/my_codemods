describe('justifyAnswerDirective', function () {
    var element;
    var scope;
    var directiveScope;

    beforeEach(function () {
        bard.appModule('app.workflows');
        bard.inject('$rootScope', '$compile', '$q', 'rbpWorkflowService');

        bard.mockService(rbpWorkflowService, {
            saveWorkflow: $q.when({})
        });

        scope = $rootScope.$new();
        scope.answer = {
            comment: '2'
        };
        scope.onSubmit = function(answer, justification){
           answer.justification = justification;
        };

        element = '<justify-answer answer="answer" on-submit="onSubmit"></justify-answer>';
        initializeDirective();
    });

    function initializeDirective() {
        element = $compile(element)(scope);
        scope.$digest();
        directiveScope = element.isolateScope();
    }

    it('justifyAnswer(): should be a function', function () {
        expect(directiveScope.justifyAnswer).to.be.a('function');
    });

    it('alertMissingJustification(): should be a function', function () {
        expect(directiveScope.alertMissingJustification).to.be.a('function');
    });

    it('missingJustification(): should be initially false', function () {
        expect(directiveScope.missingJustification).to.equal(false);
    });

    it('getCommentType(): should set the proper placeholder', function () {
        var expectedString = 'Please provide a reason for your answer';
        expect(directiveScope.placeholderMessage).to.equal(expectedString);
    });

    it('justifyAnswer(): should save the justification given', function () {
        var message = 'Hello..is it me you\'re lookin for?';
        directiveScope.justifyAnswer(directiveScope.answer, message);
        expect(directiveScope.answer.justification).to.equal(message);
    });

    it('alertMissingJustification(): should alert over missingJustification', function () {
        var invalidContent = true;
        directiveScope.alertMissingJustification(directiveScope.answer, invalidContent);
        expect(directiveScope.missingJustification).to.equal(true);
    });
});
