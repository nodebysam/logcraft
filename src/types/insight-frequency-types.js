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
 * LogCraft different insight frequency types.
 */
const InsightFrequencyTypes = Object.freeze({
    EVERY_UNIT: Symbol.for('everyUnit'),
    PERIODICALLY: Symbol.for('periodically'),
    AFTER_TOTAL_LOGS: Symbol.for('afterTotalLogs'),
});

module.exports = InsightFrequencyTypes;