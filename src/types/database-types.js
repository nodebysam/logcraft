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
 * LogCraft supported database types.
 */
const DatabaseTypes = Object.freeze({
    MONGODB: Symbol.for("mongodb"),
    MYSQL: Symbol.for("mysql'"),
    MSSQL: Symbol.for("mssql'"),
    POSTGRESQL: Symbol.for("postgreSQL"),
    SQLITE: Symbol.for("sqlite"),
});

module.exports = DatabaseTypes;