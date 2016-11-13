(function () {
    'use strict';

    angular
        .module('app.workflows')
        .factory('AssessmentView', AssessmentViewFactory);

    /* @ngInject */
    function AssessmentViewFactory(QuestionGroup, tableHierarchyService) {

        return function (assessment) {
            var questionGroups = createQuestionGroups();

            var questions = _.chain(questionGroups)
                .flatMap('questions')
                .value();

            questions.forEach(question => {
                updateTriggeredQuestionGroupsForQuestion(question);
            });

            function createQuestionGroups() {
                var questionGroups = [];

                (assessment.questions || []).forEach(addQuestionToGroup);

                return questionGroups;

                function addQuestionToGroup(question) {
                    var questionGroup = findQuestionGroup();

                    if (!questionGroup) {
                        questionGroup = new QuestionGroup(question.questionGroup, tableHierarchyService.isBaseQuestion(assessment, question));
                        questionGroups.push(questionGroup);
                    }
                    questionGroup.addQuestion(question);

                    function findQuestionGroup() {
                        return _.find(questionGroups, {id: question.questionGroup.id});
                    }
                }
            }

            function updateTriggeredQuestionGroupsForQuestion(question) {
                if (question.isAnswered()) {
                    question.answers.forEach((answer) => {
                        if (answer.chosen && question.answerCanTriggerAQuestionGroup(answer)) {
                            question.assignQuestionGroup(answer.triggersGroups, questionGroups);
                        }
                    });
                }
            }

            this.uuid = assessment.uuid;
            this.description = assessment.description;
            this.template = assessment.template;
            this.questionGroups = questionGroups;

            this.isAssessmentComplete = () => {
                return this.questionGroups
                    .filter(questionGroup => questionGroup.isTriggered)
                    .every(questionGroup => {
                        return questionGroup.questions.every(question => question.isAnswered() && !question.missingMandatoryJustification());
                    });
            };

            this.hasSummary = () => assessment.summary !== null;

            this.completionPercentage = function () {
                var questionStats = this.questionGroups
                    .filter(questionGroup => questionGroup.isTriggered)
                    .reduce((result, questionGroup) => {
                        result.total += questionGroup.questions.length;
                        result.answered += questionGroup.questions
                            .reduce((answeredCount, question) => question.isAnswered() ? answeredCount + 1 : answeredCount, 0);

                        return result;
                    }, {total: 0, answered: 0});

                if (questionStats.total === 0) {
                    return 0;
                }

                return (questionStats.answered / questionStats.total * 100).toFixed();
            };

            this.assignTriggeredQuestionGroups = (question, answer) => {
                question.clearAssignedQuestionGroup();
                question.assignQuestionGroup(answer.triggersGroups, this.questionGroups);
            };

            this.updateTriggeredQuestionGroupsForQuestion = updateTriggeredQuestionGroupsForQuestion;

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

            this.toDTO = () => {
                var assessment = {
                    questions: [],
                    uuid: this.uuid
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
