/**
 * LOGCRAFT
 * Powerful and customizable logging library.
 * 
 * By Sam Wilcox <wilcox.sam@gmail.com>
 * 
 * This library is released under the GNU v3.0 license.
 * For further license details, see the included LICENSE file.
 */

const InsightTypes = require('./types/insight-types');
const InsightFrequencyTypes = require('./types/insight-frequency-types');
const InsightDestinations = require('./types/insight-destinations');
const InsightAggregationTypes = require('./types/insight-aggregation-types');
const LogLevels = require('./types/log-levels');
const Data = require('./data');

/**
 * LogCraft class for tracking insights.
 */
class InsightsManager {
    /**
     * Constructor that sets up InsightsManager.
     * 
     * @param {Object} [config={}] - The insight configurations. 
     */
    constructor(config = {}) {
        this.insightsEnabled = config.insightsEnabled ?? false;
        this.insightFrequencyType = config.InsightFrequencyType ?? InsightFrequencyTypes.EVERY_UNIT;
        this.insightFrequency = config.insightFrequency ?? 'every 7 days';
        this.insightTypes = config.InsightTypes ?? [];
        this.insightRetentionPeriod = config.insightRetentionPeriod ?? 0;
        this.insightThresholds = config.insightThresholds ?? {};
        this.insightAlerting = config.insightAlerting ?? false;
        this.insightAggregations = config.insightAggregations ?? [];
        this.insightDestination = config.insightDestination ?? [InsightDestinations.FILE];
        
        this.insightsData = {};
        this.logCount = 0;
    }

    /**
     * Records a log event for insights tracking.
     * 
     * @param {Symbol} level - The log level (e.g., LogLevels.ERROR, LogLevels.WARNING).
     * @param {number} [responseTime=null] - Optional response time for tracking. 
     */
    trackLogs(level, responseTime = null) {
        if (!this.insightsEnabled) return;

        if (!Object.values(LogLevels).includes(level)) {
            console.warn(`[LOGCRAFT] Invalid log level: ${level.toString()}`);
            return;
        }

        if (this.insightTypes.includes(InsightTypes.LOG_LEVELS)) {
            this.insightsData[level] = (this.insightsData[level] || 0) + 1;
        }

        if (responseTime !== null && this.insightTypes.includes(InsightTypes.RESPONSE_TIMES)) {
            this.aggregateInsight('responseTimes', responseTime);
        }

        if (level === LogLevels.ERROR && this.insightTypes.includes(InsightTypes.ERROR_RATE)) {
            this.aggregateInsight('errorRate', 1);
        }

        if (level === LogLevels.WARN && this.insightTypes.includes(InsightTypes.WARNING_RATE)) {
            this.aggregateInsight('warningRate', 1);
        }

        this.logCount++;
        this.checkThresholds(this.insightsData);
    }

    /**
     * Aggregates insights based on the aggregation type.
     * 
     * @param {string} type - The type of insight to aggregate (e.g., 'errorRate', 'warningRate').
     * @param {number} value - The value to aggregate (e.g., 1 for each log of error). 
     */
    aggregateInsight(type, value) {
        if (!this.insightsData[type]) {
            this.insightsData[type] = [];
        }

        this.insightsData[type].push(value);

        const aggregationResults = {};

        this.insightAggregations.forEach(aggregationType => {
            switch (aggregationType) {
                case InsightAggregationTypes.AVERAGE:
                aggregationResults.average = this.calculateAverage(this.insightsData[type]);
                break;
            case InsightAggregationTypes.SUM:
                aggregationResults.sum = this.calculateSum(this.insightsData[type]);
                break;
            case InsightAggregationTypes.COUNT:
                aggregationResults.count = this.calculateCount(this.insightsData[type]);
                break;
            case InsightAggregationTypes.MIN:
                aggregationResults.min = this.calculateMin(this.insightsData[type]);
                break;
            case InsightAggregationTypes.MAX:
                aggregationResults.max = this.calculateMax(this.insightsData[type]);
                break;
            case InsightAggregationTypes.MEDIAN:
                aggregationResults.median = this.calculateMedian(this.insightsData[type]);
                break;
            case InsightAggregationTypes.MODE:
                aggregationResults.mode = this.calculateMode(this.insightsData[type]);
                break;
            case InsightAggregationTypes.STANDARD_DEVIATION:
                aggregationResults.standardDeviation = this.calculateStandardDeviation(this.insightsData[type]);
                break;
            case InsightAggregationTypes.PERCENTILE:
                aggregationResults.percentile = this.calculatePercentile(this.insightsData[type]);
                break;
            case InsightAggregationTypes.RANGE:
                aggregationResults.range = this.calculateRange(this.insightsData[type]);
                break;
            case InsightAggregationTypes.ROLLING_WINDOW:
                aggregationResults.rollingWindow = this.calculateRollingWindow(this.insightsData[type]);
                break;
            case InsightAggregationTypes.VARIANCE:
                aggregationResults.variance = this.calculateVariance(this.insightsData[type]);
                break;
            case InsightAggregationTypes.SUM_OF_SQUARES:
                aggregationResults.sumOfSquares = this.calculateSumOfSquares(this.insightsData[type]);
                break;
            default:
                console.warn(`[LOGCRAFT] Aggregation type not handled: ${aggregationType.toString()}`);
                break;
            }
        });

        return aggregationResults;
    }

    /**
     * Calculates the average of a data set.
     * 
     * @param {Array} data - The data to calculate the average of.
     * @returns {number} The calculated average. 
     */
    calculateAverage(data) {
        const sum = data.reduce((acc, value) => acc + value, 0);
        return sum / data.length;
    }

    /**
     * Calculates the sum of a data set.
     * 
     * @param {Array} data - The data to calculate the sum of.
     * @returns {number} The calculate sum. 
     */
    calculateSum(data) {
        return data.reduce((acc, value) => acc + value, 0);
    }

    /**
     * Calculates the count of a data set.
     * 
     * @param {Array} data - The data to calculate the count of.
     * @returns {number} The count of the data. 
     */
    calculateCount(data) {
        return data.length;
    }

    /**
     * Calculates the minimum value of a data set.
     * 
     * @param {Array} data - The data to calculate the minimum of.
     * @returns {number} The calculated minimum value. 
     */
    calculateMin(data) {
        return Math.min(...data);
    }

    /**
     * Calculates the maximum value of a data set.
     * 
     * @param {Array} data - The data to calculate the maximum of.
     * @returns {number} The calculated maximum value. 
     */
    calculateMax(data) {
        return Math.max(...data);
    }

    /**
     * Calculates the median value of a data set.
     * 
     * @param {Array} data - The data to calculate the median of.
     * @returns {number} The calculated median value.
     */
    calculateMedian(data) {
        data.sort((a, b) => a - b);
        const mid = Math.floor(data.length / 2);
        return data.length % 2 === 0 ? (data[mid - 1] + data[mid]) / 2 : data[mid];
    }

    /**
     * Calculates the mode (most frequent value) of a data set.
     * 
     * @param {Array} data - The data of calculate the mode of.
     * @returns {number} The calculated mode of the data. 
     */
    calculateMode(data) {
        const frequency = {};
        let maxFreq = 0;
        let mode = [];

        for (const num of data) {
            frequency[num] = (frequency[num] || 0) + 1;

            if (frequency[num] > maxFreq) {
                maxFreq = frequency[num];
                mode = [num];
            } else if (frequency[num] === maxFreq) {
                mode.push(num);
            }
        }

        return mode;
    }

    /**
     * Calculates the standard deviation of a data set.
     * 
     * @param {Array} data - The data to calculate the standard deviation of.
     * @returns {number} The calculated standard deviation. 
     */
    calculateStandardDeviation(data) {
        const mean = this.calculateAverage(data);
        const squaredDiffs = data.map(value => Math.pow(value - mean, 2));
        const avgSquaredDiff = this.calculateAverage(squaredDiffs);
        return Math.sqrt(avgSquaredDiff);
    }

    /**
     * Calculates the nth percentile of a data set.
     * 
     * @param {Array} data - The data to calculate the percentile for. 
     * @param {number} percentile - The desired percentile (0-100).
     * @returns {number} The calculated percentile value. 
     */
    calculatePercentile(data, percentile = 90) {
        data.sort((a, b) => a - b);
        const index = Math.floor((percentile / 100) * data.length);
        return data[index];
    }

    /**
     * Calculates the range (max - min) of a data set.
     * 
     * @param {Array} data - The data to calculate the range of.
     * @returns {number} The calculated range. 
     */
    calculateRange(data) {
        return Math.max(...data) - Math.min(...data);
    }

    /**
     * Calculates the rolling window for a data set.
     * 
     * @param {Array} data - The data to calculate the rolling window of. 
     * @param {number} windowSize - The size of the rolling window.
     * @returns {Array} An array of rolling window values. 
     */
    calculateRollingWindow(data, windowSize = 2) {
        const result = [];

        for (let i = 0; i < data.length - windowSize + 1; i++) {
            result.push(data.slice(i, i + windowSize));
        }

        return result;
    }

    /**
     * Calculates the variance of a data set.
     * 
     * @param {Array} data - The data to calculate the variance of.
     * @returns {number} The calculated variance. 
     */
    calculateVariance(data) {
        const mean = this.calculateAverage(data);
        const squaredDiffs = data.map(value => Math.pow(value - mean, 2));
        return this.calculateAverage(squaredDiffs);
    }

    /**
     * Calculates the sum of squares of a data set.
     * 
     * @param {Array} data - The data to calculate the sum of squares of.
     * @returns {number} The sum of squares. 
     */
    calculateSumOfSquares(data) {
        return data.reduce((acc, value) => acc + Math.pow(value, 2), 0);
    }

    /**
     * Checks thresholds and triggers alerts if values exceed the configured thresholds.
     * 
     * @param {Object} insights - The generated insights data.
     */
    checkThresholds(insights) {
        for (const [type, threshold] of Object.entries(this.insightThresholds)) {
            if (insights[type]) {
                const average = insights[type].average || 0;

                if (type === 'errorRate' && average > threshold.errorRate) {
                    console.warn(`Error rate exceeded theeshold: ${average} > ${threshold.errorRate}`);
                }

                if (type === 'warningRate' && average > threshold.warningRate) {
                    console.warn(`Warning rate exceeded threshold: ${average} > ${threshold.warningRate}`);
                }
            }
        }
    }

    /**
     * Retreives the current insights data.
     * 
     * @returns {Object} The current insights data.
     */
    getInsights() {
        return this.insightsData;
    }

    /**
     * Determines if it's time to generate insights based on the set frequency.
     * 
     * @returns {boolean} True to generate insights, false not to.
     */
    shouldGenerateInsights() {
        const frequencyType = this.insightFrequencyType;
        const frequencyValue = this.insightFrequency;
        const currentDate = new Date();
        const lastGenerated = parseInt(Data.get('lastInsightGeneration'), 10) ? new Date(parseInt(Data.get('lastInsightGeneration'), 10)) : null;

        // The logic for InsightFrequencyTypes.EVERY_UNIT
        if (frequencyType === InsightFrequencyTypes.EVERY_UNIT) {
            const [amount, unit] = frequencyValue.split(' ');
            const frequencyAmount = parseInt(amount, 10);

            if (lastGenerated) {
                const timeDiff = currentDate - lastGenerated;
                let timeDiffInUnits = 0;

                switch (unit) {
                    case 'seconds':
                    timeDiffInUnits = timeDiff / 1000;
                    break;
                case 'minutes':
                    timeDiffInUnits = timeDiff / (1000 * 60);
                    break;
                case 'hours':
                    timeDiffInUnits = timeDiff / (1000 * 3600);
                    break;
                case 'days':
                    timeDiffInUnits = timeDiff / (1000 * 3600 * 24);
                    break;
                case 'weeks':
                    timeDiffInUnits = timeDiff / (1000 * 3600 * 24 * 7);
                    break;
                case 'months':
                    const currentMonth = currentDate.getMonth();
                    const lastMonth = lastGenerated.getMonth();
                    const yearDiff = currentDate.getFullYear() - lastGenerated.getFullYear();
                    timeDiffInUnits = (yearDiff * 12) + (currentMonth - lastMonth);
                    break;
                case 'years':
                    timeDiffInUnits = currentDate.getFullYear() - lastGenerated.getFullYear();
                    break;
                default:
                    console.error('[LOGCRAFT] Unsupported frequency unit:', unit);
                    return false;
                }

                if (timeDiffInUnits >= frequencyAmount) {
                    this.updateLastInsightGeneration(currentDate);
                    return true;
                }
            }
        } else if (frequencyType === InsightFrequencyTypes.PERIODICALLY) { // Logic for InsightFrequencyTypes.PERIODICALLY
            const period = frequencyValue.toLowerCase();
            const periodMappings = {
                daily: 1,
                weekly: 7,
                monthly: 30,
                yearly: 365,
            };

            const daysInPeriod = periodMappings[period];

            if (daysInPeriod) {
                const lastGeneratedDate = new Date(lastGenerated);
                const timeDiffInDays = (currentDate - lastGeneratedDate) / (1000 * 3600 * 24);

                if (timeDiffInDays >= daysInPeriod) {
                    this.updateLastInsightGeneration(currentDate);
                    return true;
                }
            }
        } else if (frequencyType === InsightFrequencyTypes.AFTER_TOTAL_LOGS) {
            const totalLogs = parseInt(Data.get('totalLogs'), 10) || 0;
            const requiredLogs = parseInt(frequencyValue, 10);

            if (totalLogs >= requiredLogs) {
                this.updateLastInsightGeneration(currentDate);
                return true;
            }
        }

        return false;
    }
}

module.exports = InsightsManager;