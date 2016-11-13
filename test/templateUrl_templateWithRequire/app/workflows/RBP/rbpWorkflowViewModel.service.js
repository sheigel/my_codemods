(function () {
    'use strict';

    angular
        .module('app.workflows')
        .factory('RBPWorkflowViewModel', RBPWorkflowViewModel);

    /* @ngInject */
    function RBPWorkflowViewModel(globalDataService, AssessmentView) {
        return function (workflowData) {
            this.uuid = workflowData.uuid;
            this.name = workflowData.name;
            this.state = workflowData.state;
            this.startDate = workflowData.startDate;
            this.targetDate = workflowData.targetDate;
            this.description = workflowData.description;
            this.content = {
                assessment: new AssessmentView(workflowData.content.assessment)
            };
            this.summary = workflowData.summary;
            this.owner = workflowData.owner;
            this.editableCopyId = workflowData.editableCopyId;
            this.isCopy = workflowData.isCopy;
            this.copyParentId = workflowData.copyParentId;
            this.system = workflowData.system;
            this.category = workflowData.category;
            this.module = workflowData.module;
            this.generalComments = mapCommentsData(workflowData.generalComments);

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

            this.hasSummary = () => workflowData.summary !== null;

            this.addComment = (comment) => {
                this.generalComments.comments.push(comment);
            };

            this.completionPercentage = () => this.content.assessment.completionPercentage();

            this.toDTO = () => {
                return {
                    uuid: this.uuid,
                    content: {
                        assessment: this.content.assessment.toDTO()
                    },
                    isCopy: this.isCopy,
                    copyParentId: this.copyParentId,
                    editableCopyId: this.editableCopyId
                };
            };
        };
    }
})();
