(function () {
    'use strict';

    angular.module('app.workflows')
        .directive('impactAssessmentSummary', impactAssessmentSummaryDirective);

    /* @ngInject */
    function impactAssessmentSummaryDirective() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                workflow: '=',
                index: '=',
                section: '=',
                loading: '=',
                permissions: '=',
                logs: '=',
                tasks: '=',
                user: '=',
                toggleSections: '='
            },
            templateUrl: 'app/workflows/ECM/impactAssessmentSummary.html',
            controller: impactAssessmentSummaryDirectiveController,
            controllerAs: 'vm',
            bindToController: true
        };

        /* @ngInject */
        function impactAssessmentSummaryDirectiveController($rootScope, globalDataService, sendForService, $uibModal,
                                                            workflowsService, fileUploadService) {
            var vm = Object.assign(this, {
                completeImplementation: this.workflow.content.initiation.priority === 'emergency' && !this.workflow.content.postImpactImplementation,
                isNotApprovedButLocked,
                showStatement,
                toggleCompleteImplementation,
                getTaskDetails,
                hasTasks,
                uploadFiles,
                generateSummary,
                toggleDocumentCollection,
                openSendForModal: sendForService.openSendForModal,
                openReviewApproveModal: sendForService.openReviewApproveModal,
                getFileType: globalDataService.getFileType
            });

            $rootScope.$on('PriorityChanged', function (ev) {
                vm.workflow.content.impactAssessmentSummary.index = vm.index;
            });

            $rootScope.$on('hasDoneTask', function (ev, args) {
                vm.hasCompletedApproveTask = args.approveOption.approved || args.approveOption.rejected;
            });

            const allowedDocumentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'one'];
            const allowedDocumentMimeTypes = ['image'];

            function uploadFiles(files, invalidFiles) {
                if (!_.isArray(files)) {
                    return;
                }
                if (!_.isEmpty(invalidFiles)) {
                    return displayInvalidFilesErrors(invalidFiles);
                }

                warnAboutUnsupportedFiles(files);

                const supportedFiles = _.filter(files, isFileFormatSupported);

                const maxFilesCount = 10;
                if (_.size(supportedFiles) > maxFilesCount) {
                    toastr.error(`Attaching more than ${maxFilesCount} documents at a time is not supported.`, 'Too many documents!');
                    return;
                }

                _.forEach(supportedFiles, function (file) {
                    vm.loading = true;

                    if (fileHasAlreadyBeenUploaded(file.name)) {
                        vm.loading = false;
                        toastr.warning(file.name + ' has already been uploaded', 'Warning');
                        return false;
                    }
                    fileUploadService.uploadDocument(file)
                        .then(res => {
                            vm.loading = false;
                            res.selected = true;
                            vm.workflow.content.impactAssessmentSummary.documents = [...(vm.workflow.content.impactAssessmentSummary.documents  || []), res];
                        })
                        .catch(err => {
                            vm.loading = false;
                            toastr.error(err);
                        });
                });
            }

            function displayInvalidFilesErrors(invalidFiles) {
                let maxSizeInvalidFiles = _.chain(invalidFiles)
                    .filter({$error: 'maxSize'});
                const invalidFilesStringEnumeration = maxSizeInvalidFiles
                    .map("name")
                    .join(", ")
                    .value();
                const maxSize = maxSizeInvalidFiles.map("$errorParam").first().value();
                if (invalidFilesStringEnumeration) {
                    toastr.error(`Attaching files that are larger than ${maxSize} is not allowed.`, 'Documents are too large!');
                    return;
                }

                toastr.error('An unexpected error occurred, please try again!', 'Error');
            }

            function warnAboutUnsupportedFiles(files) {
                const unsupportedFiles = _.filter(files, _.negate(isFileFormatSupported));

                if (!_.isEmpty(unsupportedFiles)) {
                    const unsupportedExtensions = _.chain(unsupportedFiles).map(f => globalDataService.getFileExtension(f)).uniq().value();
                    toastr.warning(`Some files were not uploaded because their type is not supported: ${unsupportedExtensions.join(', ')}`)
                }
            }

            function isFileFormatSupported(file) {
                //Mime types have the format image/png or application/pdf. Because of the large number of image extensions we are using the mime type to identify in one go all the images by extracting the file's mime type (type/media type name[+suffix])
                const fileMimeType = file.type.split('/')[0];
                return _.includes(allowedDocumentExtensions, globalDataService.getFileExtension(file)) || _.includes(allowedDocumentMimeTypes, fileMimeType);
            }

            function fileHasAlreadyBeenUploaded(fileName) {
                return _.chain(vm.workflow.content.impactAssessmentSummary.documents)
                    .filter({
                        name: fileName
                    })
                    .some()
                    .value();
            }

            function isNotApprovedButLocked() {
                return !vm.workflow.content.impactAssessmentSummary.editable && vm.workflow.content.impactAssessmentSummary.state !== 'approved';
            }

            function showStatement() {
                var max = _.chain(vm.workflow.content.changeDescriptions)
                    .flatMap('summary')
                    .max('score')
                    .value();

                var mostCriticalChange = _.find(vm.workflow.content.changeDescriptions, function (description) {
                    return description.summary ? description.summary[0].score === max.score : null;
                });

                if (mostCriticalChange) {
                    var questions = _.chain(mostCriticalChange.assessment.questionGroups)
                        .flatMap('questions')
                        .value();

                    var lastQuestionAnswers = questions[questions.length - 1].answers;

                    return _.find(lastQuestionAnswers, function (answer) {
                        if (answer.text.toLowerCase() === 'yes') {
                            return answer.chosen;
                        }
                    });
                }

                return false;
            }

            function toggleCompleteImplementation() {
                vm.completeImplementation = !vm.completeImplementation;
                if (vm.completeImplementation) {
                    vm.workflow.content.postImpactImplementation = null;
                    vm.workflow.content.postImpactImplementationVerification = null;
                    vm.toggleSections('remove');
                } else {
                    vm.workflow.content.postImpactImplementation = {
                        state: 'started',
                        index: 5,
                        editable: false
                    };
                    vm.workflow.content.postImpactImplementationVerification = {
                        state: 'started',
                        index: 6,
                        editable: false
                    };
                    vm.toggleSections('add');
                }
            }

            function getTaskDetails() {
                return {
                    user: vm.user,
                    workflow: vm.workflow,
                    type: 'section',
                    section: 'impactAssessmentSummary'
                };
            }

            function hasTasks() {
                return !_.isEmpty(vm.tasks);
            }

            function generateSummary() {
                workflowsService.generateImpactAssessmentSummary(vm.workflow)
                    .then(res => vm.workflow.content.impactAssessmentSummary = res.content.impactAssessmentSummary)
                    .catch(err => console.log(err));
            }

            function toggleDocumentCollection(document) {
                if(vm.workflow.content.impactAssessmentSummary.editable) {
                    if (document.selected) {
                        openConfirmationWithPasswordModal(document);
                    } else {
                        document.selected = !document.selected;
                    }
                }
            }

            function openConfirmationWithPasswordModal(document) {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'app/components/confirmationWithPasswordModal.html',
                    controller: 'ConfirmationWithPasswordModalController as vm',
                    windowTopClass: 'modal custom-modal',
                    resolve: {
                        action: {
                            title: 'Deselect document',
                            message: 'deselect this document'
                        } ,
                        user: vm.user
                    },
                    backdrop: 'static',
                    keyboard: false
                });

                modalInstance.result.then(() => {
                    document.selected = !document.selected;
                    _.chain(vm.workflow.content.impactAssessmentSummary.documents)
                        .find(doc => doc.id === document.id)
                        .set('selected', false);
                }, function () {
                });
            }
        }
    }
})();
