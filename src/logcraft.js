/**
 * LOGCRAFT
 * Powerful and customizable logging library.
 * 
 * By Sam Wilcox <wilcox.sam@gmail.com>
 * 
 * This library is released under the GNU v3.0 license.
 * For further license details, see the included LICENSE file.
 */

const fs = require('fs');
const path = require('path');
const UtilHelper = require('./util');
const LogLevels = require('./types/log-levels');
const InsightFrequencyTypes = require('./types/insight-frequency-types');
const InsightTypes = require('./types/insight-types');
const LogFormats = require('./types/log-formats');
const InsightAggregationTypes = require('./types/insight-aggregation-types');
const InsightsManager = require('./insights-manager');
const Data = require('./data');
const config = require('./config/defaults');

/**
 * LogCraft - A customizable and powerful logging library for Node.js.
 * 
 * Features:
 * - Customizable log levels to control what gets logged.
 * - Optiona color-coded console output for better readability.
 * - Support for writing logs to files.
 * - Integerates with third-party logging services.
 * - Lightweight and extendable design.
 */
class LogCraft {
    /**
     * Constructor for the LogCraft logger.
     * 
     * @param {Object} options - Configuration options for the logger.
     * @param {string} [options.logLevel=config.file.logLevel] - Miniumum log level to log (e.g., 'debug', 'info', 'warn', 'error).
     * @param {boolean} [options.logToConsole=config.logToConsole] - True to log to the console, false not to.
     * @param {string} [options.logDir=config.file.logDir] - The directory to where the logs are to be stored.
     * @param {string} [options.logFileName=config.file.logFileName] - The file name for the log file(s).
     * @param {boolean} [options.enableColors=config.enableColors] - Enable or disable color-coded console output.
     * @param {boolean} [options.logRotation=config.file.logRotation] - Enable or disable log rotation.
     * @param {number} [options.maxLogFileSize=config.file.maxLogFileSize] - The max file size for a log file in MB (megabytes).
     * @param {number} [options.logRotationCount=config.file.logRotationCount] - The total logs to keep stored.
     * @param {LogFormats} [options.logFormat=config.file.logFormat] - The log format type for the logs.
     * @param {boolean} [options.thirdPartyServiceEnabled=config.thirdPartyService.enabled] - True to enable third-party service, false to disable.
     * @param {string} [options.thirdPartyServiceUrl=config.thirdPartyService.url] - URL of the third-party service's logging endpoint.
     * @param {string} [options.thirdPartyServiceApiKey=config.thirdPartyService.apiKey] - API for authenticating with the third-party service.
     * @param {boolean} [options.insightsEnabled=config.insightsEnabled] - True to enable insights, false to disable insights.
     * @param {InsightFrequencyTypes} [options.insightFrequencyType=config.insightFrequencyType] - The frequency type.
     * @param {string|number} [options.insightFrequency=config.insightFrequency] - The frequency of when to generate insights - this depends on what insightFrequencyType
     *                                                                             is set to. Below are the supported frequencies:
     *                                                                             - InsightFrequencyType.EVERY_UNIT example: every 2 days
     *                                                                             - InsightFrequencyType.PERIODICALLY example: weekly
     *                                                                             - InsightFrequencyType.AFTER_TOTAL_LOGS example: 1000
     * @param {Array} [options.insightTypes=config.insightTypes] - The insight types to track:
     *                                                             - InsightTypes.ERROR_RATE: Get insights by error rate.
     *                                                             - InsightTypes.LOG_LEVELS: Get insights by log levels.
     *                                                             - InsightTypes.RESPONSE_TIMES: Get insights by response times.
     * @param {number} [options.insightRetentionPeriod=config.insightRetentionPeriod] - The period in days to keep insight logs. Use 0 to keep logs indefinitely.
     * @param {float} [options.insightThresholdsErrorRate=config.insightThresholds.errorRate] - The error rate threshold for an alert to be generated, in percentages. Example: 0.05 => 5%.
     * @param {float} [options.insightThresholdsWarningRate=config.insightThresholds.warningRate] - The warning rate threshold for an alert to be generated, in percentages. Example: 0.05 => 5%.
     * @param {boolean} [options.insightAlerting=config.insightAlerting] - True to enable alerts for the given thresholds, false to disable alerts.
     * @param {Array} [options.insightAggregations=config.insightAggregations] - An array of the insight aggregations types to enable.
     * @param {Array} [options.insightDestination=config.insightDestination] - An array with the destination type(s) to use.
     * @param {boolean} [options.debug=config.debug] - True to enable debug mode, false to disable debug mode.
     * @param {boolean} [options.analyticsServiceEnabled=config.analyticsService.enabled] - True to enable sending data to an analytics service, false not to.
     * @param {string} [options.analyticsServiceUrl=config.analyticsService.url] - The URL address to the analytics service API endpoint.
     * @param {string} [options.analyticsServiceApiKey=config.analyticsService.apiKey] - The API key to authenticate with for the analytics service.
     * @param {string} [options.hostname=config.hostname] - The hostname if you are using the SYSLOG log format.
     * @param {function} [options.appendLogFunction=UtilHelper.appendJsonLog] - The append to log function to use (this exists for testing purposes).
     */
    constructor(options = {}) {
        this.builtOptions = UtilHelper.buildLogCraftProperties(options);
        this.reinitialize();
    }

    /**
     * Reinitializes this class.
     */
    reinitialize() {
        const newObject = this.builtOptions;
        Object.keys(this).forEach(key => delete this[key]);
        Object.assign(this, newObject);
    }

    /**
     * Log a new message.
     * 
     * @param {string} message - The message to log.
     * @param {LogLevels} [level=LogLevels.INFO] - The level at which to log this message. 
     */
    log(message, level = LogLevels.INFO) {
        if (this.levels[level] < this.levels[this.logLevel]) return;

        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level.description.toUpperCase()}]: ${message}`;

        if (this.logToConsole) {
            if (this.enableColors) {
                console.log(this.colorize(level, logMessage));
            } else {
                console.log(logMessage);
            }
        }

        const logEntry = { level, message, timestamp };
        const formattedLog = UtilHelper.formatLogData({ level, timestamp, message, hostname: this.hostname }, this.logFormat);

        if (this.logFormat === LogFormats.JSON) {
            this.appendLogFunction({ timestamp, level, message }, this.logFile);
        } else {
            UtilHelper.logToFile(formattedLog, this.logFile);
        }

        if (this.thirdPartyService.enabled) {
            UtilHelper.sendToThirdPartyLoggingService(level, message, logMessage, this.thirdPartyService, this.debugEnabled).then(() => null);
        }

        if (this.insightsManager.insightsEnabled && this.InsightManager.shouldGenerateInsights()) {
            this.insightsManager.trackLogs(logEntry);
            const insights = this.insightsManager.getInsights();
            UtilHelper.sendToThirdPartyAnalyticsService(insights, this.analyticsService, this.debugEnabled);
        }
    }

    /**
     * Logs a debug message.
     * 
     * @param {string} message - The debug message to log.
     */
    debug(message) {
        this.log(message, LogLevels.DEBUG);
    }

    /**
     * Logs an info message.
     * 
     * @param {string} message - The info message to log.
     */
    info(message) {
        this.log(message, LogLevels.INFO);
    }

    /**
     * Logs a warning message.
     * 
     * @param {string} message - The warning message to log.
     */
    warn(message) {
        this.log(message, LogLevels.WARN);
    }

    /**
     * Logs an error message.
     * 
     * @param {string} message - The error message to log.
     */
    error(message) {
        this.log(message, LogLevels.ERROR);
    }

    /**
     * Colorizes the console log output.
     * 
     * @param {LogLevels} level - The log level.     
     * @param {string} message - The log message. 
     */
    colorize(level, message) { 
        const chalk = require('chalk');

        switch (level) {
            case LogLevels.DEBUG:
                return chalk.blue(message);
            case LogLevels.INFO:
                return chalk.green(message);
            case LogLevels.WARN:
                return chalk.yellow(message);
            case LogLevels.ERROR:
                return chalk.red(message);
            default:
                return message;
        }
    }
}

module.exports = LogCraft;