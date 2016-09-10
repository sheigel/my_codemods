function MissingRequiredFieldError(message) {
    this.name = 'MissingRequiredFieldError';
    this.message = message;
    this.stack = new Error().stack;
}

MissingRequiredFieldError.prototype = Object.create(Error.prototype);
const uuid = require('node-uuid');
const moment = require('moment');

var Workflow = require(process.cwd() + '/src/modules/workflow/workflow').Workflow;

module.exports.createNewECMWorkflow = function createNewECMWorkflow(module, user, workflowData) {

    var startDate = new Date();
    var targetDate = workflowData.targetDate ? new Date(workflowData.targetDate) : null;

    var workflow = {
        uuid: uuid.v4(),
        name: computeName(module.abbreviation(), workflowData.system.abbreviation, startDate),
        owner: user.id(),
        state: 'started',
        system: workflowData.system,
        module: {
            id: module.id(),
            name: module.name(),
            abbreviation: module.abbreviation()
        },
        content: workflowData.content || {},
        summary: null,
        clientId: user.clientId(),
        category: workflowData.category,
        initiator: user.id(),
        startDate: startDate,
        targetDate: targetDate,
        isCopy: false,
        editableCopyId: null,
        copyParentId: null
    };

    validate(workflow);

    return new Workflow(workflow);
};

function validate(workflowData) {
    validateRequiredFields();

    function validateRequiredFields() {
        var requiredFields = ['uuid', 'owner', 'initiator', 'state', 'clientId', 'system', 'startDate', 'targetDate',
            'content', 'summary', 'name', 'module', 'category'];

        requiredFields.forEach(function verifyIfIsMissing(field) {
            if (isMissing(field)) {
                throw new MissingRequiredFieldError(field);
            }
        });

        function isMissing(path) {
            var property = _.property(path)(workflowData);

            return _.isUndefined(property);
        }
    }
}

function computeName(templateAbbreviation, systemName, startDate) {
    return (templateAbbreviation + '_' + (systemName ? systemName + '_' : '') + moment(startDate).format('DDMMMYYYY')).toUpperCase() + '_v';
}
