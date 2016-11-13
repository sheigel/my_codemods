(function () {
    'use strict';

    angular
        .module('app.workflows')
        .factory('Question', questionFactory);

    function questionFactory(globalDataService) {

        var Question = function (questionId, text, type, collections, answers, commentThreads) {
            this.questionId = questionId;
            this.text = text;
            this.type = type;
            this.collections = collections;
            this.answers = mapAnswers();
            this.triggeredQuestionGroups = null;
            this.commentThreads = mapThreadsData(commentThreads);

            function mapAnswers() {
                _.forEach(answers, function (answer) {
                    answer.visibleJustification = true;
                    if (answer.date) {
                        answer.date = new Date(answer.date);
                    }
                });
                return answers;
            }

            this.markAsChosen = function (answer) {
                if (this.type !== 'multiple-choice') {
                    answer.chosen = true;
                    this.answers.forEach(deselectOtherAnswers);
                } else {
                    answer.chosen = !answer.chosen;
                }

                function deselectOtherAnswers(answerItem) {
                    if (answerItem.text !== answer.text) {
                        answerItem.chosen = false;
                    }
                }
            };

            this.toggleJustification = function (answer) {
                answer.visibleJustification = !answer.visibleJustification;
            };

            this.isAnswered = function () {
                return this.answers.some(function (answer) {
                    return answer.chosen;
                })
                    && isYesNoDocumentsQuestionAnswered(this);
            };

            this.missingMandatoryJustification = function () {
                return _.find(this.answers, function (answer) {
                    return answer.chosen && answer.comment === '2' && !answer.justification;
                });
            };

            this.assignQuestionGroup = function (answerQuestionGroupIds, questionGroups) {
                var that = this;

                that.triggeredQuestionGroups = [];

                _.forEach(answerQuestionGroupIds, function (groupId) {
                    var group = findGroup(questionGroups, groupId);

                    if (group) {
                        group.isTriggered = true;
                        that.triggeredQuestionGroups.push(group);
                    }
                });

                function findGroup(questionGroups, groupId) {
                    return _.find(questionGroups, function (questionGroup) {
                        return questionGroup && (questionGroup.id === groupId);
                    });
                }
            };

            this.clearAssignedQuestionGroup = function () {
                _.forEach(this.triggeredQuestionGroups, function (triggeredGroup) {
                    var triggeredQuestionGroups = _.chain(triggeredGroup.questions)
                        .flatMap('triggeredQuestionGroups')
                        .compact()
                        .value();


                    if (!_.isEmpty(triggeredQuestionGroups)) {
                        var triggeredQuestionGroupQuestions = triggeredQuestionGroups[0].questions;
                        triggeredQuestionGroups[0].isTriggered = false;
                    }

                    var triggeredGroupQuestions = _.chain(triggeredGroup.questions)
                        .concat(triggeredQuestionGroupQuestions)
                        .compact()
                        .value();

                    _(triggeredGroupQuestions).flatMap('answers')
                        .forEach(a => {
                            a.chosen = false;
                            if (a.deviationReferences) {
                                a.deviationReferences = "";
                            }
                            return true;
                        });

                    triggeredGroup.isTriggered = false;
                });

                this.triggeredQuestionGroups = null;
            };

            this.answerCanTriggerAQuestionGroup = function (answer) {
                return _.isArray(answer.triggersGroups);
            };

            this.mapQuestion = function () {
                return {
                    questionId: this.questionId,
                    text: this.text,
                    type: this.type,
                    answers: this.answers,
                    collections: this.collections
                };
            };
        };
        function isAnsweredWithYes(question) {
            return _.some(question.answers, {text: 'yes', chosen: true});
        }

        function isYesNoDocumentsQuestionAnswered(question) {
            if (isAnsweredWithYes(question)) {
                if (question.type === 'yes/no collections') {
                    return _.chain(question.collections).filter({selected: true}).some().value();
                } else if (question.type === 'yes/no deviations') {
                    return _.find(question.answers, {text: 'yes'}).deviationReferences;
                }
            }
            return true;
        }

        function mapThreadsData(threadsData) {
            var threads = _.cloneDeep(threadsData) || [];

            _.forEach(threads, function (thread) {
                _.forEach(thread.comments, function (comment) {
                    comment.date = globalDataService.formatClientDate(comment.date);
                });
            });

            return threads;
        }

        return Question;
    }
})();
