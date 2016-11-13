(function () {
    'use strict';

    angular.module('app.workflows')
        .directive('riskImpactClassification', riskImpactClassificationDirective);

    /* @ngInject */
    function riskImpactClassificationDirective() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                workflow: '='
            },
            templateUrl: 'app/workflows/ECM/riskImpactClassification.html',
            controller: riskImpactClassificationDirectiveController,
            controllerAs: 'vm',
            bindToController: true
        };

        /* @ngInject */
        function riskImpactClassificationDirectiveController(impactClasses) {
            var vm = Object.assign(this, {
                impactClasses: _.cloneDeep(impactClasses),
                assignChangeDescriptions
            });

            const rangePredicates = {
                High: (range, limit) => range.to === limit.max,
                Medium: (range, limit) => range.from !== 0 && range.to !== limit.max,
                Low: (range) => range.from === 0
            };

            function findChangeDescriptionsBy(changeDescriptionPredicate) {
                return _.chain(vm.workflow.content.changeDescriptions)
                    .map((cd, index) => {
                        if (cd.summary &&
                            changeDescriptionPredicate(cd.summary[0].range, cd.summary[0].limit)) {
                            return {
                                index,
                                changeDescription: vm.workflow.content.changeDescriptions[index]
                            }
                        }
                        else {
                            return null;
                        }
                    })
                    .compact()
                    .value();
            }

            function assignChangeDescriptions() {
                return _.map(vm.impactClasses, impactClass => {
                    const assignedChangeDescriptions = findChangeDescriptionsBy(rangePredicates[impactClass.name]);
                    _.chain(assignedChangeDescriptions)
                        .differenceBy(impactClass.changeDescriptions, cd=>cd.index)
                        .flatMap(cd =>({
                            index: cd.index,
                            description: _.cloneDeep(cd.changeDescription)
                        }))
                        .forEach(cd=>{
                            impactClass.changeDescriptions.push(cd);
                        })
                        .value();
                    return impactClass;
                });
            }
        }
    }
})();
