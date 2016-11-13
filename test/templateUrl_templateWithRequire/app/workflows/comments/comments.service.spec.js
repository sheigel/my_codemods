'use strict';

describe('Service: commentsService', function() {
    var commentsServiceMock;

    beforeEach(function() {
        bard.appModule('AngularAmChart');
        bard.appModule('app.workflows');
        bard.inject('$injector', '$rootScope', 'commentsService');
        commentsServiceMock = commentsService;
    });

    it('should confirm that the service is defined', function() {
        expect(commentsServiceMock).to.be.ok;
    });

    it('should confirm the functions\'s existence ', function() {
        expect(commentsServiceMock.createNewThread).to.be.a('function');
        expect(commentsServiceMock.addCommentOnExistingThread).to.be.a('function');
        expect(commentsServiceMock.closeThread).to.be.a('function');
    });

});
