'use strict';

describe('Factory: RBPSummaryView', function () {
    var RBPSummaryFactory;
    var assessmentData = {
        content: {
            questions: []
        },
        summary: {
            outputs: [
                {
                    limit: {
                        min: 6,
                        max: 9
                    },
                    score: 10,
                    range: {
                        name: 'Medium',
                        from: 7,
                        to: 8
                    },
                    documentCollection: [
                        {
                            name: 'Subtable with sparkles',
                            docs: []
                        }
                    ],
                    vaf: {
                        period: 'Every 2 years'
                    }
                }
            ]
        }
    };
    var RBPSummaryView;
    var assessmentView = {
        uuid: 'd878f33c-4bc8-4d8b-970c-a569707d93d4',
        addComment: function (comment) {
        },
        assignTriggeredQuestionGroups: function () {
        },
        completionPercentage: function () {
        },
        description: 'description',
        generalComments: {},
        isAssessmentComplete: true,
        name: 'MNM_RBS_08APR2016_v2',
        owner: '56aa238b7541ffd1149d09d7',
        questionGroupCompletionPercentage: function (questionGroup) {
        },
        questionGroups: [],
        startDate: '2016-04-08T13:43:37.082Z',
        state: 'started',
        targetDate: null,
        toDTO: function () {
        },
        updateState: function (state) {
        },
        updateTriggeredQuestionGroupsForQuestion: function (question) {
        }
    };

    beforeEach(function () {
        bard.appModule('AngularAmChart');
        bard.appModule('app.workflows');
        bard.inject('$injector', '$rootScope');

        RBPSummaryFactory = $injector.get('RBPSummaryView');
        RBPSummaryView = new RBPSummaryFactory(assessmentView, assessmentData);
    });

    it('should confirm that variable\'s existence', function () {
        expect(RBPSummaryView).to.exist;
        expect(RBPSummaryView.getVaf).to.be.a('function');
        expect(RBPSummaryView.hasDocuments).to.be.a('function');
        expect(RBPSummaryView.getDataChart).to.be.a('function');
    });

    it('hasVaf(): should confirm if assessment has Vendor Audit Frequency', function () {
        var RBPSummaryView = new RBPSummaryFactory(assessmentView, assessmentData);
        var vaf = RBPSummaryView.getVaf();
        expect(vaf).to.equal(assessmentData.summary.outputs[0].vaf);
    });
});
