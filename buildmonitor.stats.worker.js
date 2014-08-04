(function (global) {
    global.addEventListener('message', function (event) {
        var stats = getSolutionAndProjectStats(event.data);
        global.postMessage(stats);
    });

    function getSolutionAndProjectStats(buildtimes) {
        var solutions = buildtimes,
            solutionsCollection = getItemsCollection(solutions, 'Solution', 'Name'),
            projects = buildtimes.reduce(function (a, b) {
                return a.concat(b.Projects);
            }, []),
            projectsCollection = getItemsCollection(projects, 'Project', 'Id');

        return {
            solutions: updateStats(solutionsCollection),
            projects: updateStats(projectsCollection)
        };
    }

    function getItemsCollection(entries, entryKey, itemIdKey) {
        var itemsMap = {},
            items = [];

        entries.forEach(function (entry) {
            var item = entry[entryKey],
                itemId;

            if (!item) {
                return;
            }

            itemId = item[itemIdKey];

            if (!itemsMap[itemId]) {
                itemsMap[itemId] = {
                    name: item.Name,
                    events: []
                };
                items.push(itemsMap[itemId]);
            }

            itemsMap[itemId].events.push({
                start: entry.Start,
                time: entry.Time
            });
        });

        return {
            items: items
        };
    }

    function updateStats(itemsCollection) {
        itemsCollection.items.forEach(function (item) {
            item.stats = getItemStats(item.events);
        });

        itemsCollection.stats = getItemsStats(itemsCollection.items);

        return itemsCollection;
    }

    function getItemStats(events) {
        var totalRun = 0,
            totalTime = 0,
            statsByDate = {};

        events.forEach(function (event) {
            var start = new Date(event.start),
                year = start.getFullYear(),
                month = start.getMonth() + 1;

            totalRun += 1;
            totalTime += event.time;

            if (!statsByDate[year]) {
                statsByDate[year] = {};
                for (var i = 1; i <= 12; i++) {
                    statsByDate[year][i] = {
                        totalTime: 0,
                        totalRun: 0
                    };
                }
            }

            statsByDate[year][month].totalTime += event.time;
            statsByDate[year][month].totalRun += 1;
        });

        return {
            totalRun: totalRun,
            totalTime: totalTime,
            averageTime: totalTime / totalRun,
            statsByDate: statsByDate
        };
    }

    function getItemsStats(items) {
        var totalRun = 0,
            totalTime = 0,
            statsByDate = {},
            i = 0;

        items.forEach(function (item) {
            totalRun += item.stats.totalRun;
            totalTime += item.stats.totalTime;

            Object.keys(item.stats.statsByDate).forEach(function (year) {
                if (!statsByDate[year]) {
                    statsByDate[year] = {};
                    for (i = 1; i <= 12; i++) {
                        statsByDate[year][i] = {
                            totalTime: 0,
                            totalRun: 0
                        };
                    }
                }

                for (i = 1; i <= 12; i++) {
                    statsByDate[year][i].totalTime += item.stats.statsByDate[year][i].totalTime;
                    statsByDate[year][i].totalRun += item.stats.statsByDate[year][i].totalRun;
                }
            });
        });

        return {
            totalRun: totalRun,
            totalTime: totalTime,
            averageTime: totalTime / totalRun,
            statsByDate: statsByDate
        };
    }
}(this));