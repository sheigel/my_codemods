(function () {
    'use strict';

    angular
        .module('app.workflows')
        .factory('RBPSummaryView', RBPSummaryViewFactory);

    /* @ngInject */
    function RBPSummaryViewFactory() {
        var RBPSummaryView = function (workflowView, workflowData) {
            this.workflow = workflowView;
            this.outputs = workflowData.summary.outputs;

            this.getScoreBarWidth = function (output) {
                return _.round(100 * output.score / output.limit.max);
            };

            this.getVaf = function () {
                var outputVaf = _.find(this.outputs, 'vaf');
                return outputVaf ? outputVaf.vaf : null;
            };

            this.hasDocuments = function () {
                return _.some(this.outputs, 'documentCollection') || false;
            };

            this.getDataChart = function () {
                var chartOptions = {
                    type: 'serial',
                    categoryField: 'category',
                    columnSpacing3D: 10,
                    mouseWheelScrollEnabled: false,
                    mouseWheelZoomEnabled: false,
                    startDuration: 0,
                    startEffect: 'easeOutSine',
                    categoryAxis: {
                        gridPosition: 'start'
                    },
                    trendLines: [],
                    guides: [],
                    valueAxes: [],
                    allLabels: [],
                    balloon: {},
                    legend: {
                        enabled: true,
                        useGraphSettings: true
                    },
                    titles: [],
                    graphs: [
                        {
                            balloonText: '[[title]] - [[category]]:[[value]]',
                            bullet: 'round',
                            fillAlphas: 0.75,
                            lineAlpha: 0,
                            type: 'smoothedLine',
                            id: 'OutputGraph-0',
                            title: 'Total Score',
                            valueField: 'output0'
                        }
                    ],
                    dataProvider: [
                        {
                            category: 'Min',
                            output0: this.outputs[0].limit.min
                        },
                        {
                            category: 'Score',
                            output0: this.outputs[0].score
                        },
                        {
                            category: 'Max',
                            output0: this.outputs[0].limit.max
                        }
                    ]
                };

                if (this.outputs.length > 1) {
                    _.forEach(this.outputs, function (output, index) {
                        var id = 'output' + index;

                        var graph = _.cloneDeep(chartOptions.graphs[0]);
                        graph.title = 'Output ' + index;
                        graph.id = 'OutputGraph-' + index;
                        graph.valueField = id;
                        graph.fillAlphas = graph.fillAlphas - 0.15;

                        chartOptions.graphs.push(graph);

                        chartOptions.dataProvider[0][id] = output.limit.min;
                        chartOptions.dataProvider[1][id] = output.score;
                        chartOptions.dataProvider[2][id] = output.limit.max;
                    });
                }

                return chartOptions;
            };

            this.getDataToExport = function () {
                var dataToExport = {};

                dataToExport.workflow = this.workflow;
                dataToExport.comments = this.comments;
                dataToExport.workflow.state = this.workflow.state;
                dataToExport.summary = {
                    vaf: this.getVaf(),
                    outputs: this.outputs,
                    dataChart: this.getDataChart(),
                    hasDocuments: this.hasDocuments()
                };

                return dataToExport;
            };
        };

        return RBPSummaryView;
    }
})();
