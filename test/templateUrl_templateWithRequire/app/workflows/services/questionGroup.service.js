(function () {
    'use strict';

    angular
        .module('app.workflows')
        .factory('QuestionGroup', questionGroupFactory);

    function questionGroupFactory(Question) {
        class QuestionGroup {
            constructor(questionGroup, isTriggered) {
                var groupId = questionGroup.id;
                var groupName = questionGroup.name;
                var groupType = questionGroup.type;

                this.id = groupId;
                this.type = groupType;
                this.name = groupName;
                this.isExpanded = false;
                this.isTriggered = isTriggered;
                this.questions = [];
            }

            addQuestion(question) {
                this.questions.push(new Question(question.questionId, question.text, question.type, question.collections, question.answers, question.commentThreads));
            }

            mapQuestions() {
                return _.map(this.questions, question=> {
                    var mappedQuestion = question.mapQuestion();

                    mappedQuestion.questionGroup = {
                        id: this.id,
                        name: this.name,
                        type: this.type
                    };
                    return mappedQuestion
                });
            };
        }

        return QuestionGroup;
    }
})();
