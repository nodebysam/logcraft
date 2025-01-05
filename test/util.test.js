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
const test = require('ava');
const UtilHelper = require('../src/util');
const LogFormats = require('../src/types/log-formats');

test('parseTimeInterval should parse the string "2 minutes"', t => {
    const result = UtilHelper.parseTimeInterval('2 minutes ago');
    const expected = new Date();
    expected.setMinutes(expected.getMinutes() + 2);
    t.deepEqual(stripMilliseconds(result), stripMilliseconds(expected));
});

test('parseTimeInterval should parse the string "3 hours"', t => {
    const result = UtilHelper.parseTimeInterval('3 hours');
    const expected = new Date();
    expected.setHours(expected.getHours() + 3);
    t.deepEqual(stripMilliseconds(result), stripMilliseconds(expected));
});

test('parseTimeInterval should parse the string "10 days"', t => {
    const result = UtilHelper.parseTimeInterval('10 days');
    const expected = new Date();
    expected.setDate(expected.getDate() + 10);
    t.deepEqual(stripMilliseconds(result), stripMilliseconds(expected));
});

test('parseTimeInterval should parse the string "2 weeks"', t => {
    const result = UtilHelper.parseTimeInterval('2 weeks');
    const expected = new Date();
    expected.setDate(expected.getDate() + 14);
    t.deepEqual(stripMilliseconds(result), stripMilliseconds(expected));
});

test('parseTimeInterval should parse the string "1 month"', t => {
    const result = UtilHelper.parseTimeInterval('1 month');
    const expected = new Date();
    expected.setMonth(expected.getMonth() + 1);
    t.deepEqual(stripMilliseconds(result), stripMilliseconds(expected));
});

test('parseTimeInterval should parse the string "1 year"', t => {
    const result = UtilHelper.parseTimeInterval('1 year');
    const expected = new Date();
    expected.setFullYear(expected.getFullYear() + 1);
    t.deepEqual(stripMilliseconds(result), stripMilliseconds(expected));
});

test('parseTimeInterval should throw error for invalid time format', t => {
    const error = t.throws(() => {
        UtilHelper.parseTimeInterval('invalid time');
    });

    t.is(error.message, '[LOGCRAFT] Invalid time interval format. Example formats: "4 minutes", "2 hours", "5 days".');
});

test('parseTimeInterval should throw error for missing number', t => {
    const error = t.throws(() => {
        UtilHelper.parseTimeInterval('minutes');
    });

    t.is(error.message, '[LOGCRAFT] Invalid time interval format. Example formats: "4 minutes", "2 hours", "5 days".');
});

test('parseTimeInterval should throw error for invalid number', t => {
    const error = t.throws(() => {
        UtilHelper.parseTimeInterval('abc minutes');
    });

    t.is(error.message, '[LOGCRAFT] Invalid time interval format. Example formats: "4 minutes", "2 hours", "5 days".');
});

test('parseTimeInterval should throw error for unsupported unit', t => {
    const error = t.throws(() => {
        UtilHelper.parseTimeInterval('5 seconds');
    });

    t.is(error.message, '[LOGCRAFT] Invalid time interval format. Example formats: "4 minutes", "2 hours", "5 days".');
});

test('formatLogData should format log data as JSON', t => {
    const logData = {
        timestamp: "2025-01-01T00:00:00Z",
        level: "info",
        message: "This is a log message"
    };

    const expected = JSON.stringify(logData, null, 2);
    const result = UtilHelper.formatLogData(logData, LogFormats.JSON);

    t.is(result, expected);
});

test('formatLogData should format log data as CSV', t => {
    const logData = {
        timestamp: "2025-01-01T00:00:00Z",
        level: "info",
        message: "This is a log message"
    };

    const expected = 'timestamp,level,message\n"2025-01-01T00:00:00Z","info","This is a log message"';
    const result = UtilHelper.formatLogData(logData, LogFormats.CSV);

    t.is(result, expected);
});

test('formatLogData should format log data as PLAINTEXT', t => {
    const logData = {
        timestamp: "2025-01-01T00:00:00Z",
        level: "info",
        message: "This is a log message"
    };

    const expected = `[2025-01-01T00:00:00Z] [info] This is a log message`;
    const result = UtilHelper.formatLogData(logData, LogFormats.PLAINTEXT);

    t.is(result, expected);
});

test('formatLogData should format log data as XML', t => {
    const logData = {
        timestamp: "2025-01-01T00:00:00Z",
        level: "info",
        message: "This is a log message"
    };

    const expected = '<log><timestamp>2025-01-01T00:00:00Z</timestamp><level>info</level><message>This is a log message</message></log>';
    const result = UtilHelper.formatLogData(logData, LogFormats.XML);

    t.is(result, expected);
});

test('formatLogData should format log data as YAML', t => {
    const logData = {
        timestamp: "2025-01-01T00:00:00Z",
        level: "info",
        message: "This is a log message"
    };

    const expected = 'timestamp: 2025-01-01T00:00:00Z\nlevel: info\nmessage: This is a log message';
    const result = UtilHelper.formatLogData(logData, LogFormats.YAML);

    t.is(result, expected);
});

test('formatLogData should format log data as SYSLOG', t => {
    const logData = {
        timestamp: "2025-01-01T00:00:00Z",
        level: "info",
        message: "This is a log message",
        hostname: "localhost"
    };

    const expected = '<14> 2025-01-01T00:00:00Z localhost LogCraft This is a log message';
    const result = UtilHelper.formatLogData(logData, LogFormats.SYSLOG);

    t.is(result, expected);
});

test('formatLogData should format log data as LOGFMT', t => {
    const logData = {
        timestamp: "2025-01-01T00:00:00Z",
        level: "info",
        message: "This is a log message"
    };

    const expected = 'timestamp="2025-01-01T00:00:00Z" level="info" message="This is a log message"';
    const result = UtilHelper.formatLogData(logData, LogFormats.LOGFMT);

    t.is(result, expected);
});

test('formatLogData should format log data as MARKDOWN', t => {
    const logData = {
        timestamp: "2025-01-01T00:00:00Z",
        level: "info",
        message: "This is a log message"
    };

    const expected = `### Log Entry\n**Timestamp** 2025-01-01T00:00:00Z\n**Level:** info\n**Message:** This is a log message`;
    const result = UtilHelper.formatLogData(logData, LogFormats.MARKDOWN);

    t.is(result, expected);
});

test('formatLogData should format log data as HTML', t => {
    const logData = {
        timestamp: "2025-01-01T00:00:00Z",
        level: "info",
        message: "This is a log message"
    };

    const expected = `<div class="log-entry">
                            <p><strong>Timestamp:</strong> 2025-01-01T00:00:00Z</p>
                            <p><strong>Level:</strong> info</p>
                            <p><strong>Message:</strong> This is a log message</p>
                        </div>`;
    const result = UtilHelper.formatLogData(logData, LogFormats.HTML);

    t.is(result, expected);
});

test('formatLogData should format log data as BINARY', t => {
    const logData = {
        timestamp: "2025-01-01T00:00:00Z",
        level: "info",
        message: "This is a log message"
    };

    const expected = Buffer.from(JSON.stringify(logData));
    const result = UtilHelper.formatLogData(logData, LogFormats.BINARY);

    t.deepEqual(result, expected);
});

test('formatLogData should format log data as NDJSON', t => {
    const logData = {
        timestamp: "2025-01-01T00:00:00Z",
        level: "info",
        message: "This is a log message"
    };

    const expected = JSON.stringify(logData) + '\n';
    const result = UtilHelper.formatLogData(logData, LogFormats.NDJSON);

    t.is(result, expected);
});

/**
 * Helper that strips the milliseconds from a given Date object.
 * 
 * @param {Date} date - The Date object.
 * @returns {Date} The new Date object without milliseconds. 
 */
const stripMilliseconds = (date) => {
    const newDate = new Date(date);
    newDate.setMilliseconds(0);
    return newDate;
};