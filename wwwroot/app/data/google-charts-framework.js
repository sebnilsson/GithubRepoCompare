export class GoogleChartsFramework {
    constructor() {
        if (typeof(google) === 'undefined' || typeof(google.charts) === 'undefined') {
            throw new Error('Google Charts not loaded. \'google.charts\' is not defined.');
        }

        this.loadPromise = new Promise(function(resolve) {
            google.charts.setOnLoadCallback(() => resolve());
        });

        google.charts.load('current', { packages: [/*'line',*/ 'corechart'] });
    }
    load() {
        return this.loadPromise;
    }
}