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
 * LogCraft different insight types.
 */
const InsightTypes = Object.freeze({
    ERROR_RATE: Symbol.for('errorRate'),
    LOG_LEVELS: Symbol.for('logLevels'),
    RESPONSE_TIMES: Symbol.for('responseTimes'),
    WARNING_RATE: Symbol.for('warningRate'),
});

module.exports = InsightTypes;