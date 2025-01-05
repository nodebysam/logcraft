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
 * LogCraft log formats.
 */
const LogFormats = Object.freeze({
    JSON: Symbol.for('json'),
    CSV: Symbol.for('csv'),
    PLAINTEXT: Symbol.for('plainText'),
    XML: Symbol.for('xml'),
    YAML: Symbol.for('yaml'),
    SYSLOG: Symbol.for('syslog'),
    LOGFMT: Symbol.for('logfmt'),
    MARKDOWN: Symbol.for('markdown'),
    HTML: Symbol.for('html'),
    BINARY: Symbol.for('binary'),
    NDJSON: Symbol.for('ndjson'),
});

module.exports = LogFormats;