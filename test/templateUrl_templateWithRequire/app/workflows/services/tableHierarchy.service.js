(function () {
    angular.module('app.workflows')
        .service('tableHierarchyService', TableHierarchyService);

    /* @ngInject */
    function TableHierarchyService() {
        function getDataOrganizedByQuestionGroups(questions) {
            var tables = _.chain(questions).map('questionGroup').uniqBy('id').value();

            questions.forEach(function (question) {
                var tableToAssignTo = _.find(tables, {id: question.questionGroup.id});

                tableToAssignTo.questions = tableToAssignTo.questions || [];
                tableToAssignTo.questions.push(question);
            });
            return tables;
        }

        let tablesAndTriggeredSubtables = _.memoize(
            ({questionGroups, questions}) => {
                if (!questionGroups && questions) {
                    return tablesAndTriggeredSubtables({questionGroups: getDataOrganizedByQuestionGroups(questions)});
                }
                var triggeredTables = _.chain(questionGroups)
                    .flatMap('questions')
                    .flatMap('answers')
                    .flatMap('triggersGroups')
                    .value();
                var baseTables = _.chain(questionGroups)
                    .differenceWith(triggeredTables, (arr, oth) => {
                        return arr.id === oth;
                    });
                return baseTables
                    .map(function (baseTable) {
                        return {
                            baseTable,
                            triggered: _.flatMap(baseTable.questions, function (q) {
                                return _.chain(q.answers)
                                    .flatMap('triggersGroups')
                                    .map(triggeredSubtableId => ({
                                        question: q,
                                        table: _.find(questionGroups, {id: triggeredSubtableId})
                                    }))
                                    .compact()
                                    .value();
                            })

                        };
                    })
                    .value();
            }
        );

        let triggeredQuestionGroups = _.memoize(
            (questions) => {
                return _.chain(questions)
                    .flatMap('answers')
                    .flatMap('triggersGroups')
                    .compact()
                    .uniq()
                    .value();
            });

        function isBaseQuestion(content, question) {
            var baseTablesAndTriggeredTables = tablesAndTriggeredSubtables(content);
            return _.chain(baseTablesAndTriggeredTables)
                .flatMap('baseTable')
                .flatMap('questions')
                .some({questionId: question.questionId})
                .value();
        }

        return {
            tablesAndTriggeredSubtables,
            triggeredQuestionGroups,
            isBaseQuestion
        };
    }
})();
