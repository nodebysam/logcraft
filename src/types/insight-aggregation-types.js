/**
 * LOGCRAFT
 * Powerful and customizable logging library.
 * 
 * By Sam Wilcox <wilcox.sam@gmail.com>
 * 
 * This library is released under the GNU v3.0 license.
 * For further license details, see the included LICENSE file.
 */

/**
 * LogCraft insight aggregation types.
 */
const InsightAggregationTypes = Object.freeze({
    AVERAGE: Symbol.for('average'),
    SUM: Symbol.for('sum'),
    COUNT: Symbol.for('count'),
    MIN: Symbol.for('min'),
    MAX: Symbol.for('max'),
    MEDIAN: Symbol.for('median'),
    MODE: Symbol.for('mode'),
    STANDARD_DEVIATION: Symbol.for('standardDeviation'),
    PERCENTILE: Symbol.for('percentile'),
    RANGE: Symbol.for('range'),
    ROLLING_WINDOW: Symbol.for('rollingWindow'),
    VARIANCE: Symbol.for('variance'),
    SUM_OF_SQUARES: Symbol.for('sumOfSquares'),
});

module.exports = InsightAggregationTypes;