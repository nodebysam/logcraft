/**
 * LOGCRAFT
 * Powerful and customizable logging library.
 * 
 * By Sam Wilcox <wilcox.sam@gmail.com>
 * 
 * This library is released under the GNU v3.0 license.
 * For further license details, see the included LICENSE file.
 */

const LogLevels = require('../types/log-levels');
const InsightFrequencyTypes = require('../types/insight-frequency-types');
const InsightTypes = require('../types/insight-types');
const InsightAggregationTypes = require('../types/insight-aggregation-types');
const InsightDestinations = require('../types/insight-destinations');
const DatabaseTypes = require('../types/database-types');
const LogFormats = require('../types/log-formats');

/**
 * LogCraft default configuration settings.
 * This file can be overridden using the logcraft.config.json file in your root directory.
 */
const defaultConfigs = {
    hostname: "localhost",
    logLevel: LogLevels.INFO,
    logToConsole: true,
    enableColors: true,
    insightsEnabled: false,
    insightFrequencyType: InsightFrequencyTypes.EVERY_UNIT,
    insightFrequency: "every 7 days",
    insightTypes: [InsightTypes.ERROR_RATE, InsightTypes.LOG_LEVELS, InsightTypes.RESPONSE_TIMES, InsightTypes.WARNING_RATE],
    insightRetentionPeriod: 30,
    insightThresholds: {
        errorRate: 0.05,
        warningRate: 0.05,
    },
    insightAlerting: true,
    insightAggregations: [InsightAggregationTypes.AVERAGE, InsightAggregationTypes.MAX],
    insightDestination: [InsightDestinations.FILE],
    debug: false,
    analyticsService: {
        enabled: false,
        url: "",
        apiKey: "",
    },
    database: {
        enabled: false,
        databaseType: DatabaseTypes.MYSQL,
        hostname: "localhost",
        port: 3306,
        user: "",
        password: "",
    },
    file: {
        logDir: "./logs",
        logFileName: "info.log",
        logFormat: LogFormats.JSON,
        logRotation: true,
        logRotationCount: 5,
        maxLogFileSize: 10,
    },
    thirdPartyService: {
        enabled: false,
        apiKey: "",
        url: "",
    },
};

module.exports = defaultConfigs;