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
        html.push('<th>Total project builds</th>');
        html.push('<th>Total project build time</th>');
        html.push('<th>Average project build time</th>');
        html.push('</tr>');
        html.push('</thead>');


        html.push('<tbody>');

        Object.keys(stats.statsByDate).forEach(function (year) {
            Object.keys(stats.statsByDate[year]).forEach(function (month) {
                var totalRun = stats.statsByDate[year][month].totalRun,
                    totalTime = stats.statsByDate[year][month].totalTime,
                    averageTime = totalTime / totalRun;

                html.push('<tr>');
                html.push('<th>' + getDateDisplayName(month - 1, year) + '</th>');
                html.push('<td>' + totalRun + '</td>');
                html.push('<td>' + getTimeDisplayName(totalTime) + '</td>');
                html.push('<td>' + getTimeDisplayName(averageTime) + '</td>');
                html.push('</tr>');
            });
        });

        html.push('</tbody>');

        html.push('<tfoot>');
        html.push('<tr>');
        html.push('<th>Total</th>');
        html.push('<td>' + stats.totalRun + '</td>');
        html.push('<td>' + getTimeDisplayName(stats.totalTime) + '</td>');
        html.push('<td>' + getTimeDisplayName(stats.totalTime / stats.totalRun) + '</td>');
        html.push('</tr>');
        html.push('</tfoot>');
        html.push('</table>');

        return html.join('');

        function getTimeDisplayName(milliseconds) {
            var seconds = milliseconds / 1000,
                minutes = seconds / 60,
                roundedMinutes = Math.round(minutes),
                roundedMinutesWithUnit = roundedMinutes + ' min';

            if (!milliseconds) {
                return '-';
            } else if (seconds < 60) {
                return Math.round(seconds) + ' seconds';
            } else {
                return roundedMinutesWithUnit;
            }
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
            };

        Object.keys(stats.statsByDate).forEach(function (year) {
            Object.keys(stats.statsByDate[year]).forEach(function (month) {
                var milliseconds = stats.statsByDate[year][month].totalTime,
                    seconds = milliseconds / 1000,
                    minutes = seconds / 60,
                    roundedMinutes = Math.round(minutes),
                    label = getDateDisplayName(month - 1, year);

                lineChartData.labels.push(label);
                dataset.data.push(roundedMinutes);
            });
        });

        lineChartData.datasets.push(dataset);

        return lineChartData;
    }

    function getDateDisplayName(month, year) {
        var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return monthNames[month] + '/' + year;
    }
}(this));