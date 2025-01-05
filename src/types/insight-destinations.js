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
 * LogCraft insight destinations.
 */
const InsightDestinations = Object.freeze({
    ANALYTICS_SERVICE: Symbol.for('analyticsService'),
    FILE: Symbol.for('file'),
    DATABASE: Symbol.for('database'),
});

module.exports = InsightDestinations;