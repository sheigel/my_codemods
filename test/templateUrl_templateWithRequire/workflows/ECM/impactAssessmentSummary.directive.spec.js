// xdescribe('impactAssessmentSummary', function () {
//     var element;
//     var scope;
//     var directiveScope;
//     var workflow = {
//         content: {
//             changeDescriptions: [{
//                 summary: [
//                     {
//                         limit: {
//                             min: 0,
//                             max: 22
//                         },
//                         score: 15,
//                         range: {
//                             name: 'High',
//                             from: 15,
//                             to: 22
//                         }
//                     }
//                 ],
//                 documents: [],
//                 text: 'first',
//                 assessment: {
//                     uuid: '245989ec-7ada-4312-a67a-c0d31c848984',
//                     template: {
//                         id: '580f42510225b7ae263cee8b',
//                         name: 'new ECM templ for Hogs',
//                         description: 'descr',
//                         module: '57ab1273b3215f2c3221a65d',
//                         category: 'Infrastructure'
//                     },
//                     questions: [
//                         {
//                             text: 'Does the system directly affect or directly support a regulated process, a regulatory decision, or directly affect the efficacy and quality of a drug product?',
//                             type: 'yes/no',
//                             answers: [
//                                 {
//                                     text: 'yes',
//                                     score: 5,
//                                     comment: '0',
//                                     visibleJustification: true
//                                 },
//                                 {
//                                     text: 'no',
//                                     score: 4,
//                                     comment: '0',
//                                     visibleJustification: true
//                                 }
//                             ],
//                             collections: null,
//                             questionId: 'bb5c512e-5db8-4cf8-a99d-bc3e0eed5572',
//                             questionGroup: {
//                                 id: '578cb6acf531debd093ade2f',
//                                 name: 'GxP Software Criticality Assessment Questions',
//                                 type: 'sub'
//                             }
//                         }
//                     ]
//                 }
//             }]
//         }
//     };
//
//     beforeEach(function () {
//         angular.mock.module('app.workflows');
//         bard.inject('$rootScope', '$compile', '$q', 'globalDataService', 'sendForService', '$uibModal', 'workflowsService',
//             'fileUploadService');
//
//         bard.mockService('sendForService', {
//             openSendForModal: $q.when({}),
//             openReviewApproveModal: $q.when({})
//         });
//         bard.mockService('globalDataService', {
//             getFileType: $q.when({})
//         });
//
//         scope = $rootScope.$new();
//         var vm = $controller('impactAssessmentSummaryDirectiveController', {$scope: scope});
//         vm.workflow = workflow;
//         vm.section = {
//             name: 'Impact Assessment Summary',
//             identifier: 'impactAssessmentSummary',
//             isTriggered: true
//         };
//         vm.permissions = {
//             isOwner: true
//         };
//         vm.user = {
//             id: '12345678790121'
//         };
//         vm.loading = false;
//         vm.logs = [];
//         vm.tasks = [];
//         vm.togglePostImpactSections = function () {
//         };
//
//         element = '<impact-assessment-summary workflow="vm.workflow" section="vm.section" index="3"' +
//         ' permissions="vm.permissions" user="vm.user" loading="vm.loading" logs="vm.logs"' +
//         ' tasks="vm.tasks" toggle-sections="vm.togglePostImpactSections"></impact-assessment-summary>';
//         initializeDirective();
//     });
//
//     function initializeDirective() {
//         element = $compile(element)(scope);
//         scope.$digest();
//         directiveScope = element.isolateScope();
//     }
// })();
