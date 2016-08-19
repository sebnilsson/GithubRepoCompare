export class ChartOptionUtility {
    static getForPieChart(title: string) {
        return {
            title: title,
            pieHole: 0.25,
            height: 200,
            chartArea: {
                width: '90%',
                height: '85%'
            }
        };
    }

    static getForLineChart() {
        return {
            curveType: 'function',
            legend: {
                position: 'bottom'
            },
            height: 400,
            chartArea: {
                width: '85%',
                height: '70%'
            },
            vAxis: {
                viewWindow: {
                    min: 0
                }
            }
        };
    }
}