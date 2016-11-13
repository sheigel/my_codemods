(function () {
    'use strict';

    angular
        .module('app.workflows')
        .service('workflowsDataService', WorkflowsDataService);

    /* @ngInject */
    function WorkflowsDataService() {

        return {
            getHoursOfTimeStamp,
            getDateOfTimeStamp,
            hasReviewTask,
            hasApproveTask,
            mapPermissionsData
        };

        function getHoursOfTimeStamp(timestamp, client) {
            return client ? moment(timestamp).format(client.config.timeFormat) : moment(timestamp).format('HH:mm');
        }

        function getDateOfTimeStamp(timestamp, client) {
            if (client) {
                var date = client.config.dateFormat;
                return (date === 'DD MMM YYYY' ? moment(timestamp).format().toUpperCase() : moment(timestamp).format(date));
            }
            return moment(timestamp).format('DD/MMM/YYYY').toUpperCase();
        }

        function hasReviewTask(hasTask, action) {
            return hasTask && action === 'review';
        }

        function hasApproveTask(hasTask, action) {
            return hasTask && action === 'approve';
        }

        function mapPermissionsData(permissions, user, type) {
            var mappedPermissions = {
                isOwner: permissions.isOwner,
                allowed: permissions.isOwner
            };
            if (permissions.task) {
                mappedPermissions.action = permissions.task.subject.action;
                mappedPermissions.iHaveTask = (permissions.task.assignee.id === user.id) &&
                    _.includes(type, permissions.task.subject.type) && permissions.task.visible && !permissions.task.completed;
                mappedPermissions.allowed = mappedPermissions.isOwner || permissions.task.subject.action;
            }
            return mappedPermissions;
        }
    }
})();
