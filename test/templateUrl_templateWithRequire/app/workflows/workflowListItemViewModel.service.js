(function () {
    'use strict';

    angular
        .module('app.workflows')
        .factory('WorkflowListItemViewModel', WorkflowListItemViewModelFactory);

    /* @ngInject */
    function WorkflowListItemViewModelFactory(QuestionGroup, globalDataService, tableHierarchyService) {
        return function (assessment) {
            this.uuid = assessment.uuid;
            this.name = assessment.name;
            this.state = assessment.state;
            this.startDate = assessment.startDate;
            this.targetDate = assessment.targetDate;
            this.description = assessment.description;
            this.summary = assessment.summary;
            this.owner = assessment.owner;
            this.editableCopyId = assessment.editableCopyId;
            this.isCopy = assessment.isCopy;
            this.copyParentId = assessment.copyParentId;
            this.template = assessment.template;
            this.questionGroups = createQuestionGroups();
            this.generalComments = mapCommentsData(assessment.generalComments);

            function createQuestionGroups() {
                var questionGroups = [];

                (assessment.content.questions || []).forEach(addQuestionToGroup);

                return questionGroups;

                function addQuestionToGroup(question) {
                    var questionGroup = findQuestionGroup();

                    if (!questionGroup) {
                        questionGroup = new QuestionGroup(question.questionGroup, tableHierarchyService.isBaseQuestion(assessment.content, question));
                        questionGroups.push(questionGroup);
                    }
                    questionGroup.addQuestion(question);

                    function findQuestionGroup() {
                        return _.find(questionGroups, {id: question.questionGroup.id});
                    }
                }
            }

            function mapCommentsData(threadData) {
                var thread = threadData;
                if (thread) {
                    _.forEach(thread.comments, comment => comment.date = globalDataService.formatClientDate(comment.date));
                } else {
                    thread = {
                        comments: []
                    };
                }
                return thread;
            }

            this.isAssessmentComplete = () => {
                return this.questionGroups
                    .filter(questionGroup => questionGroup.isTriggered)
                    .every(questionGroup => {
                        return questionGroup.questions.every(question => question.isAnswered() && !question.missingMandatoryJustification());
                    });
            };

            this.hasSummary = () => assessment.summary !== null;



            this.assignTriggeredQuestionGroups = (question, answer) => {
                question.clearAssignedQuestionGroup();
                question.assignQuestionGroup(answer.triggersGroups, this.questionGroups);
            };

            this.updateIsTriggeredStatusForQuestionGroups = () => {
                _.chain(this.questionGroups)
                    .map('questions')
                    .flatten()
                    .forEach(question => {
                        this.updateTriggeredQuestionGroupsForQuestion(question);
                    });
            };

            this.updateTriggeredQuestionGroupsForQuestion = (question) => {
                if (question.isAnswered()) {
                    question.answers.forEach((answer) => {
                        if (answer.chosen && question.answerCanTriggerAQuestionGroup(answer)) {
                            question.assignQuestionGroup(answer.triggersGroups, this.questionGroups);
                        }
                    });
                }
            };

            this.questionGroupCompletionPercentage = questionGroup => {
                var answeredQuestionsCount = 0;
                var questionsCount = questionGroup.questions.length;

                questionGroup.questions.forEach(question => {
                    if (question.isAnswered() && !question.missingMandatoryJustification()) {
                        answeredQuestionsCount++;
                    }

                    if (question.triggeredQuestionGroups) {
                        question.triggeredQuestionGroups.forEach(triggeredQuestionGroup => {
                            questionsCount += triggeredQuestionGroup.questions.length;
                            triggeredQuestionGroup.questions.forEach(question => {
                                if (question.isAnswered() && !question.missingMandatoryJustification()) {
                                    answeredQuestionsCount++;
                                }
                            });
                        });
                    }
                });

                return answeredQuestionsCount / questionsCount * 100;
            };

            this.addComment = (comment) => {
                this.generalComments.comments.push(comment);
            };

            this.toDTO = () => {
                var assessment = {
                    questions: [],
                    uuid: this.uuid,
                    isCopy: this.isCopy,
                    copyParentId: this.copyParentId,
                    editableCopyId: this.editableCopyId
                };

                this.questionGroups.forEach(questionGroup => {
                    var questions = questionGroup.mapQuestions();

                    assessment.questions = assessment.questions.concat(questions);
                });

                return assessment;
            };
        };
    }
})();
