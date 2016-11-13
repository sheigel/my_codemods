(function () {
    'use strict';

    angular
        .module('app.workflows')
        .controller('CreateWorkflowModalController', CreateWorkflowModalController);

    /* @ngInject */
    function CreateWorkflowModalController($uibModalInstance, templates, clientService, globalDataService) {
        Object.assign(this, {
            selectedModule: null,
            selectedCategory: null,
            selectedSystem: null,
            targetDate: null,
            minDate: new Date(),
            getModules: ()=>
                _.chain(templates)
                    .map('module')
                    .uniqBy('name')
                    .value(),
            getCategories: ()=>
                _.chain(templates)
                    .filter({module: this.selectedModule})
                    .flatMap('categories')
                    .uniq()
                    .value(),
            getSystems: ()=>
                _.chain(this.companyConfig.organizations)
                    .flatMap('sites')
                    .flatMap('systems')
                    .compact()
                    .value(),
            assignModule: module => {
                this.selectedModule = module;
                delete this.selectedCategory;
            },
            assignCategory: category =>
                this.selectedCategory = category,
            assignSystem: system =>
                this.selectedSystem = system,
            canCreate: ()=> {
                return this.selectedModule && this.selectedCategory && this.selectedSystem;
            },
            closeModal: ()=>
                $uibModalInstance.dismiss('close'),
            save: ()=> {
                if (this.canCreate()) {
                    $uibModalInstance.close({
                        moduleId: this.selectedModule.id,
                        moduleAbbreviation: this.selectedModule.abbreviation,
                        category: this.selectedCategory,
                        system: this.selectedSystem,
                        targetDate: globalDataService.getSystemDate(this.targetDate)
                    });
                }
            }
        });

        clientService.getCompanyInfo()
            .then((info)=> {
                this.companyConfig = info.config;
            })
            .catch(toastr.error);

    }
})();
