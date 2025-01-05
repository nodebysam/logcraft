/**
 * LOGCRAFT
 * Powerful and customizable logging library.
 * 
 * By Sam Wilcox <wilcox.sam@gmail.com>
 * 
 * This library is released under the GNU v3.0 license.
 * For further license details, see the included LICENSE file.
 */

const LogFormats = require('./types/log-formats');
const LogLevels = require('./types/log-levels');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const config = require('./config/defaults');
const InsightFrequencyTypes = require('./types/insight-frequency-types');
const InsightTypes = require('./types/insight-types');
const InsightAggregationTypes = require('./types/insight-aggregation-types');
const InsightsManager = require('./insights-manager');

/**
 * LogCraft utility helpers.
 */
class UtilHelper {
    /**
     * Parse the time interval for a given time string.
     * 
     * @param {string} timeStr - The time in a string (e.g., '2 minutes, 5 hours, 3 days, etc).
     * @returns {Date} The corresponding javascript Date object. 
     */
    static parseTimeInterval(timeStr) {
        const regEx = /(?:every\s*)?(\d+)\s*(minute|hour|day|week|month|year)s?/i;
        const match = timeStr.match(regEx);

        if (!match) {
            throw new Error('[LOGCRAFT] Invalid time interval format. Example formats: "4 minutes", "2 hours", "5 days".');
        }

        const [, value, unit] = match;
        const number = parseInt(value, 10);

        if (isNaN(number)) {
            throw new Error('[LOGCRAFT] Invalid number in time interval.');
        }

        const currentDate = new Date();
        const normalizedUnit = unit.toLowerCase().replace(/s$/, '');

        switch (normalizedUnit) {
            case 'minute':
            currentDate.setMinutes(currentDate.getMinutes() + number);
            break;
        case 'hour':
            currentDate.setHours(currentDate.getHours() + number);
            break;
        case 'day':
            currentDate.setDate(currentDate.getDate() + number);
            break;
        case 'week':
            currentDate.setDate(currentDate.getDate() + number * 7);
            break;
        case 'month':
            currentDate.setMonth(currentDate.getMonth() + number);
            break;
        case 'year':
            currentDate.setFullYear(currentDate.getFullYear() + number);
            break;
        default:
            throw new Error(`[LOGCRAFT] Unsupported time unit: ${unit}`);
        }

        return currentDate;
    }

    /**
     * Format log based on the specified log format.
     * 
     * @param {Object} logData - The log data object to format (e.g., { timestamp, level, message }).
     * @param {Symbol} format - The desired log format from LogFormats.
     * @returns {string|Buffer} The formatted log data as a string or Buffer (for binary). 
     */
    static formatLogData(logData, format) {
        switch (format) {
            case LogFormats.JSON:
                return JSON.stringify(logData, null, 2);

            case LogFormats.CSV:
                const headers = Object.keys(logData).join(',');
                const values = Object.values(logData).map(value => `"${value}"`).join(',');
                return `${headers}\n${values}`;

            case LogFormats.PLAINTEXT:
                return `[${logData.timestamp}] [${logData.level}] ${logData.message}`;

            case LogFormats.XML:
                let xml = '<log>';

                for (const [key, value] of Object.entries(logData)) {
                    xml += `<${key}>${value}</${key}>`;
                }

                xml += '</log>';

                return xml;

            case LogFormats.YAML:
                return Object.entries(logData)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join('\n');

            case LogFormats.SYSLOG:
                return `<14> ${logData.timestamp} ${logData.hostname || 'localhost'} LogCraft ${logData.message}`;

            case LogFormats.LOGFMT:
                return Object.entries(logData)
                    .map(([key, value]) => `${key}="${value}"`)
                    .join(' ');

            case LogFormats.MARKDOWN:
                return `### Log Entry\n**Timestamp** ${logData.timestamp}\n**Level:** ${logData.level}\n**Message:** ${logData.message}`;

            case LogFormats.HTML:
                return `<div class="log-entry">
                            <p><strong>Timestamp:</strong> ${logData.timestamp}</p>
                            <p><strong>Level:</strong> ${logData.level}</p>
                            <p><strong>Message:</strong> ${logData.message}</p>
                        </div>`;

            case LogFormats.BINARY:
                return Buffer.from(JSON.stringify(logData));

            case LogFormats.NDJSON:
                return JSON.stringify(logData) + '\n';

            default:
                throw new Error('Unsupported log format specified.');
        }
    }

    /**
     * Logs the given data to the log file.
     * 
     * @param {string|Buffer} logData - The log data to log to the file. 
     * @param {string} filePath - The file path to the log file. 
     * @param {boolean} [append=true] - True to append, false to overwrite. 
     */
    static logToFile(logData, filePath, append = true) {
        try {
            const dirPath = path.dirname(filePath);

            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }

            if (!fs.existsSync(filePath)) {
                fs.openSync(filePath, 'w');
            }

            if (append) {
                fs.appendFileSync(filePath, logData, 'utf-8');
            } else {
                fs.writeFileSync(filePath, logData, 'utf-8');
            }
        } catch (error) {
            console.error('[LOGCRAFT] Failed to log data:', error);
            throw error;
        }
    }

    /**
     * Append a new JSON log entry to the log file.
     * 
     * @param {Object} logData - The log data to add.
     * @param {string} filePath - The path to the log file.
     */
    static appendJsonLog(logData, filePath) {
        try {
            const dirPath = path.dirname(filePath);

            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }

            let logs = [];

            if (fs.existsSync(filePath)) {
                const fileContent = fs.readFileSync(filePath, 'utf-8');
                logs = fileContent.trim() ? JSON.parse(fileContent) : [];
            }

            logs.push(logData);

            fs.writeFileSync(filePath, JSON.stringify(logs, null, 2), 'utf-8');
        } catch (error) {
            console.error('[LOGCRAFT] Failed to append JSON log:', error);
            throw error;
        }
    }

    /**
     * Sends the log to the configured third-party logging service.
     * 
     * @param {LogLevels} level - The log level.    
     * @param {string} message - The log message.
     * @param {string} logMessage - The formatted log message. 
     * @param {Object} thirdPartyService - The third party service configs.
     * @param {boolean} debug - True to log debug messages, false not to.
     */
    static async sendToThirdPartyLoggingService(level, message, logMessage, thirdPartyService, debug = false) {
        const { enabled, url, apiKey } = thirdPartyService;

        if (enabled) {
            try {
                await axios.post(url, {
                    apiKey: apiKey,
                    level: level,
                    message: message,
                    timestamp: new Date().toISOString(),
                    logMessage: logMessage,
                });

                if (debug) {
                    console.log('Log sent to third-party service.');
                }
            } catch (error) {
                console.error('[LOGCRAFT] Error sending log to third-party service:', error);
                throw error;
            }
        }
    }

    /**
     * Sends insight data to a third-party analytics service.
     * 
     * @param {Object} insightData - The insight data to send.
     * @param {Object} analyticsService - The analytics service configurations.
     * @param {boolean} [debug=false] - True to enable debug output, false to disable debug output.
     */
    static async sendToThirdPartyAnalyticsService(insightData, analyticsService, debug = false) {
        const { enabled, url, apiKey } = analyticsService;

        if (enabled) {
            try {
                if (debug) {
                    console.log('[LOGCRAFT] Sending data to analytics service:', insightData);
                }
    
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer: ${apiKey}`,
                    },
                    body: JSON.stringify(insightData),
                });

                if (!response.ok) {
                    throw new Error(`[LOGCRAFT] Failed to send insight data. Status: ${response.status}`);
                }

                const responseData = await response.json();

                if (debug) {
                    console.log('[LOGCRAFT] Analystics service response:', responseData);
                }
            } catch (error) {
                console.error('[LOGCRAFT] Error sending insights to third-party analytics service:', error);
                throw error;
            }
        }
    }

    /**
     * Get a configuration value.
     * This method was added for testing purposes.
     * 
     * @param {string} key - The configuration key to get.
     * @returns {any|null} The value for the given key or null if the key does not exist.
     */
    static getConfig(key) {
        const configFilePath = path.join(process.cwd(), 'logcraft.config.json');
        let configData = {};

        if (fs.existsSync(configFilePath)) {
            try {
                configData = require(configFilePath);
            } catch (error) {
                console.error('[LOGCRAFT] Error loading config file:', error);
                configData = {};
            }
        } else {
            configData = config;
        }

        if (key.includes('.')) {
            const keys = key.split('.');
            return keys.reduce((acc, part) => acc && acc[part] !== undefined ? acc[part] : null, configData);
        }

        if (configData.hasOwnProperty(key)) {
            return configData[key];
        }

        return null;
    }

    /**
     * Builds the LogCraft class properties and returns them all
     * in a single object.
     * 
     * @param {Object} [options={}] - The incoming options object.
     * @returns {Object} The resulting object with all properties.
     */
    static buildLogCraftProperties(options = {}) {
        const configPath = path.join(process.cwd(), 'logcraft.config.json');
        let configData = {};
        let logLevelData;

        if (fs.existsSync(configPath)) {
            try {
                configData = require(configPath);
            } catch (error) {
                console.error('[LOGCRAFT] Failed when reading the configurations file:', error);
                throw error;
            }
        }

        if (options.logLevel) {
            logLevelData = options.logLevel;
        } else if (configData.logLevel) {
            logLevelData = configData.logLevel;
        } else if (config.logLevel) {
            logLevelData = config.logLevel;
        } else {
            logLevelData = LogLevels.INFO;
        }

        const logDir = options.logDir || configData.file.logDir || config.file.logDir || null;
        const logFileName = options.logFileName || configData.file.logFileName || config.file.logFileName || null;
        const insightsEnabled = options.insightsEnabled || configData.insightsEnabled || config.insightsEnabled || false;
        const insightTypes = options.insightFrequencyType || configData.insightFrequencyType || config.insightFrequencyType || InsightFrequencyTypes.EVERY_UNIT;
        const insightFrequency = options.insightFrequency || configData.insightFrequency || config.insightFrequency || 'every 7 days';
        const insightRetentionPeriod = options.insightRetentionPeriod || configData.insightRetentionPeriod || config.insightRetentionPeriod || 30;
        const insightThresholds = {
            errorRate: options.insightThresholdsErrorRate || configData.insightThresholds.errorRate || config.insightThresholds.errorRate || 0.05,
            warningRate: options.insightThresholdsWarningRate || configData.insightThresholds.warningRate || config.insightThresholds.warningRate || 0.05,
        };

        return {
            hostname: options.hostname || configData.hostname || config.hostname || 'localhost',
            debugEnabled: options.debug || configData.debug || config.debug || false,
            logLevel: typeof logLevelData === 'string' ? Symbol.for(logLevelData) : logLevelData,
            logToConsole: options.logToConsole || configData.logToConsole || config.logToConsole || true,
            logDir: logDir,
            logFileName: logFileName,
            logFile: path.join(logDir, logFileName),
            enableColors: options.enableColors || configData.enableColors || config.enableColors || true,
            thirdPartyService: {
                enabled: options.thirdPartyServiceEnabled || configData.thirdPartyService.enabled || config.thirdPartyService.enabled || false,
                url: options.thirdPartyServiceUrl || configData.thirdPartyService.url || config.thirdPartyService.url || null,
                apiKey: options.thirdPartyServiceApiKey || configData.thirdPartyService.apiKey || config.thirdPartyService.apiKey || null,
            },
            analyticsService: {
                enabled: options.analyticsServiceEnabled || configData.analyticsService.enabled || config.analyticsService.enabled || false,
                url: options.analyticsServiceUrl || configData.analyticsService.url || config.analyticsService.url || null,
                apiKey: options.analyticsServiceApiKey || configData.analyticsService.apiKey || config.analyticsService.apiKey || null,
            },
            logRotation: options.logRotation || configData.logRotation || config.logRotation || true,
            maxLogFileSize: options.maxLogFileSize || configData.maxLogFileSize || config.maxLogFileSize || 10,
            logRotationCount: options.logRotationCount || configData.logRotationCount || config.logRotationCount || 5,
            logFormat: options.logFormat || configData.logFormat || config.logFormat || LogFormats.JSON,
            insightsEnabled: insightsEnabled,
            insightFrequencyType: insightTypes,
            insightFrequency: insightFrequency,
            insightTypes: options.insightTypes || configData.insightTypes || config.insightTypes || [InsightTypes.ERROR_RATE, InsightTypes.LOG_LEVELS, InsightTypes.RESPONSE_TIMES, InsightTypes.WARNING_RATE],
            insightRetentionPeriod: insightRetentionPeriod,
            insightThresholds: insightThresholds,
            insightAlerting: options.insightAlerting || configData.insightAlerting || config.insightAlerting || false,
            insightDestination: options.insightDestination || configData.insightDestination || config.insightDestination || null,
            insightAggregations: options.insightAggregations || configData.insightAggregations || config.insightAggregations || [InsightAggregationTypes.AVERAGE, InsightAggregationTypes.SUM],
            insightsManager: new InsightsManager({
                insightsEnabled,
                insightTypes,
                insightFrequency,
                insightRetentionPeriod,
                insightThresholds,
            }),
            levels: {
                [LogLevels.DEBUG]: 1,
                [LogLevels.INFO]: 2,
                [LogLevels.WARN]: 3,
                [LogLevels.ERROR]: 4,
            },
            appendLogFunction: options.appendLogFunction || this.appendJsonLog,
        };
    }
}

module.exports = UtilHelper;