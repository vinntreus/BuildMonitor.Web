(function (window) {
    var document = window.document,
        wrapperElement = document.getElementsByClassName('buildmonitor')[0],
        inputElement = wrapperElement.getElementsByTagName('textarea')[0],
        outputElement = wrapperElement.getElementsByClassName('stats')[0],
        chartElement = wrapperElement.getElementsByClassName('chart')[0],
        chartHeader = chartElement.getElementsByTagName('header')[0],
        chartCanvasElement = chartElement.getElementsByTagName('canvas')[0],
        worker;

    chartHeader.style.display = 'none';

    inputElement.addEventListener('input', function () {
        render(JSON.parse(this.value));
    });

    function render(buildtimes) {
        calculateStatsInWorker(buildtimes, function (result) {
            var stats = result.projects.stats,
                statsHtml = getStatsHtml(stats),
                lineChartData = getLineChartData(stats),
                canvasContext = chartCanvasElement.getContext('2d');

            new Chart(canvasContext).Line(lineChartData, {
                responsive: true,
                maintainAspectRatio: false,
                bezierCurve: false
            });
            chartHeader.style.display = 'block';

            outputElement.innerHTML = statsHtml;
        });
    }

    function calculateStatsInWorker(buildtimes, callback) {
        worker = worker || new Worker('buildmonitor.stats.worker.js');
        worker.addEventListener('message', function (event) {
            callback(event.data);
        });
        worker.postMessage(buildtimes);
    }

    function getStatsHtml(stats) {
        var html = [];

        html.push('<table>');
        html.push('<thead>');
        html.push('<tr>');
        html.push('<th>Date</th>');
        html.push('<th>Builds</th>');
        html.push('<th>Time</th>');
        html.push('</tr>');
        html.push('</thead>');


        html.push('<tbody>');

        Object.keys(stats.totalTimeByDate).forEach(function (year) {
            Object.keys(stats.totalTimeByDate[year]).forEach(function (month) {
                html.push('<tr>');
                html.push('<th>' + getDateDisplayName(month - 1, year) + '</th>');
                html.push('<td>' + 'N/A' + '</td>');
                html.push('<td>' + getTimeDisplayName(stats.totalTimeByDate[year][month]) + '</td>');
                html.push('</tr>');
            });
        });

        html.push('</tbody>');

        html.push('<tfoot>');
        html.push('<tr>');
        html.push('<th>Total</th>');
        html.push('<td>' + stats.totalRun + '</td>');
        html.push('<td>' + getTimeDisplayName(stats.totalTime) + '</td>');
        html.push('</tr>');
        html.push('</tfoot>');
        html.push('</table>');

        return html.join('');

        function getTimeDisplayName(milliseconds) {
            var seconds = milliseconds / 1000,
                minutes = seconds / 60,
                roundedMinutes = Math.round(minutes),
                roundedMinutesWithUnit = roundedMinutes + ' min';

            return !!milliseconds ? roundedMinutesWithUnit : '-';
        }

        function getDateDisplayName(month, year) {
            var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return monthNames[month] + '/' + year;
        }
    }

    function getLineChartData(stats) {
        var lineChartData = {
            labels: [],
            datasets: []
        },
            dataset = {
                label: 'Build times',
                fillColor: 'hsla(126, 45%, 66%, 0.2)',
                strokeColor: 'hsla(126, 45%, 66%, 1)',
                pointColor: 'hsla(126, 45%, 66%, 1)',
                pointStrokeColor: '#fff',
                pointHighlightFill: '#000',
                pointHighlightStroke: 'hsla(126, 45%, 66%, 1)',
                data: []
            },
            monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        Object.keys(stats.totalTimeByDate).forEach(function (year) {
            Object.keys(stats.totalTimeByDate[year]).forEach(function (month) {
                var milliseconds = stats.totalTimeByDate[year][month],
                    seconds = milliseconds / 1000,
                    minutes = seconds / 60,
                    roundedMinutes = Math.round(minutes),
                    label = monthNames[month - 1] + '/' + year;

                lineChartData.labels.push(label);
                dataset.data.push(roundedMinutes);
            });
        });

        lineChartData.datasets.push(dataset);

        return lineChartData;
    }
}(this));