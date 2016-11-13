(function () {
    'use strict';

    angular
        .module('app.workflows')
        .factory('ECMWorkflowViewModel', ECMWorkflowViewModel);

    /* @ngInject */
    function ECMWorkflowViewModel(globalDataService, AssessmentView, ecmPriorities) {
        return function (workflow) {
            this.uuid = workflow.uuid;
            this.name = workflow.name;
            this.state = workflow.state;
            this.startDate = workflow.startDate;
            this.targetDate = workflow.targetDate;
            this.description = workflow.description;
            this.summary = workflow.summary;
            this.owner = workflow.owner;
            this.editableCopyId = workflow.editableCopyId;
            this.isCopy = workflow.isCopy;
            this.copyParentId = workflow.copyParentId;
            this.system = workflow.system;
            this.category = workflow.category;
            this.module = workflow.module;
            this.content = workflow.content || {};
            this.generalComments = mapCommentsData(workflow.generalComments);
            this.content.changeDescriptions = workflow.content.changeDescriptions ?
                _.forEach(workflow.content.changeDescriptions, function (description) {
                    description.assessment = new AssessmentView(description.assessment);
                }) : [];

            this.content.initiation = workflow.content.initiation || {
                    priority: 'normal',
                    state: 'started',
                    index: 0,
                    editable: true
                };
            this.content.impactAssessment = buildImpactAssessmentSection();
            this.content.impactAssessmentSummary = buildImpactAssessmentSummarySection();
            this.content.implementation = buildImplementationSection();
            this.content.implementationVerification = buildImplementationVerificationSection();

            function determineSectionIndex(sectionName, initiationPriority) {
                var section = _.find(ecmPriorities[initiationPriority], s => s.identifier === sectionName);

                return section ? section.index : null;
            }

            function buildImpactAssessmentSection() {
                if (workflow.content.impactAssessment) {
                    workflow.content.impactAssessment.generalComments = mapCommentsData(workflow.content.impactAssessment.generalComments);
                    workflow.content.impactAssessment.index = determineSectionIndex("impactAssessment", workflow.content.initiation.priority || 'normal');
                    return workflow.content.impactAssessment;
                }

                return {
                    state: 'started',
                    index: 1,
                    editable: false,
                    generalComments: {
                        comments: []
                    }
                };
            }

            function buildImpactAssessmentSummarySection() {
                if (workflow.content.impactAssessmentSummary) {
                    workflow.content.impactAssessmentSummary.index = determineSectionIndex("impactAssessmentSummary", workflow.content.initiation.priority || 'normal');
                    return workflow.content.impactAssessmentSummary;
                }

                return {
                    state: 'started',
                    index: 2,
                    editable: false
                };
            }

            function buildImplementationSection() {
                var implementation = workflow.content.implementation;
                if (implementation) {

                    implementation.index = determineSectionIndex("implementation", workflow.content.initiation.priority || 'normal');
                    var sections = [implementation.approvedDeliverables, implementation.executedProtocols, implementation.summaryReports];

                    sections.forEach((section) => {
                        section.commentThreads = section.commentThreads ? section.commentThreads.map(mapCommentsData) : [];
                    });
                    return implementation;
                }

                return {
                    state: 'started',
                    index: 3,
                    editable: false,
                    approvedDeliverables: {fullName: 'Approved Deliverables', documents: [], commentThreads: []},
                    executedProtocols: {fullName: 'Executed Protocols/Test Scripts', documents: [], commentThreads: []},
                    summaryReports: {fullName: 'Summary Reports', documents: [], commentThreads: []}
                };
            }

            function buildImplementationVerificationSection() {
                var section = workflow.content.implementationVerification;
                if (section) {
                    section.index = determineSectionIndex("implementationVerification", workflow.content.initiation.priority || 'normal');
                    section.assessment = new AssessmentView(section.assessment);

                    section.generalComments = mapCommentsData(section.generalComments);
                    return section;
                }

                return {
                    state: 'started',
                    index: 4,
                    editable: false,
                    assessment: {}
                };
            }

            function mapCommentsData(threadData) {
                var thread = threadData;
                if (thread) {
                    _.forEach(thread.comments, (comment) => comment.date = globalDataService.formatClientDate(comment.date));
                } else {
                    thread = {
                        comments: []
                    };
                }
                return thread;
            }

            this.hasSummary = () => workflow.summary !== null;

            this.completionPercentage = function () {
                return 0;
            };

            this.addComment = (comment) => {
                this.generalComments.comments.push(comment);
            };

            this.toDTO = () => {
                return _.assign({}, this.content, {
                    changeDescriptions: _.map(this.content.changeDescriptions, cd => {
                        return _.assign({}, cd, {assessment: cd.assessment && cd.assessment.toDTO()});
                    }),
                    impactAssessment: {
                        state: this.content.impactAssessment.state,
                        index: this.content.impactAssessment.index,
                        editable: this.content.impactAssessment.editable
                    },
                    implementationVerification: {
                        ownerApproved: this.content.implementationVerification.ownerApproved,
                        state: this.content.implementationVerification.state,
                        index: this.content.implementationVerification.index,
                        editable: this.content.implementationVerification.editable,
                        assessment: this.content.implementationVerification.assessment.toDTO()
                    },
                    implementation: _.assign({}, this.content.implementation,
                        {
                            approvedDeliverables: {
                                fullName: this.content.implementation.approvedDeliverables.fullName,
                                documents: this.content.implementation.approvedDeliverables.documents
                            },
                            executedProtocols: {
                                fullName: this.content.implementation.executedProtocols.fullName,
                                documents: this.content.implementation.executedProtocols.documents
                            },
                            summaryReports: {
                                fullName: this.content.implementation.summaryReports.fullName,
                                documents: this.content.implementation.summaryReports.documents
                            }
                        }
                    )
                });
            };
        };
    }
})();
