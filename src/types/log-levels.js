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
 * LogCraft various log levels.
 */
const LogLevels = Object.freeze({
    DEBUG: Symbol.for('debug'),
    INFO: Symbol.for('info'),
    WARN: Symbol.for('warn'),
    ERROR: Symbol.for('error'),
});

module.exports = LogLevels;