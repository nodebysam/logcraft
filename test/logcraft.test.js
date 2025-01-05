/**
 * LOGCRAFT
 * Powerful and customizable logging library.
 * 
 * By Sam Wilcox <wilcox.sam@gmail.com>
 * 
 * This library is released under the GNU v3.0 license.
 * For further license details, see the included LICENSE file.
 */

const test = require('ava');
const path = require('path');
const LogCraft = require('../src/logcraft');
const sinon = require('sinon');
const LogLevels = require('../src/types/log-levels');
const LogFormats = require('../src/types/log-formats');
const UtilHelper = require('../src/util');

const mockAppendJsonLog = sinon.stub();
const mockLogToFile = sinon.stub();
const mockSendToThirdPartyLoggingService = sinon.stub();
const mockSendToThirdPartyAnalyticsService = sinon.stub();

test.beforeEach(t => {
    mockAppendJsonLog.reset();
    mockLogToFile.reset();
    mockSendToThirdPartyAnalyticsService.reset();
    mockSendToThirdPartyLoggingService.reset();
});

test('should create LogCraft instance with default options', t => {
    const logCraft = new LogCraft({});

    t.is(logCraft.logLevel, LogLevels.INFO);
    t.is(logCraft.logToConsole, true);
    t.is(logCraft.enableColors, true);
});

test('should log an info message to console', t => {
    const logCraft = new LogCraft({ logToConsole: true });
    const logSpy = sinon.spy(console, 'log');

    logCraft.info('Test info message');

    const messageWithoutColors = logSpy.firstCall.args[0].replace(/\x1B\[\d+m/g, '');

    t.true(messageWithoutColors.includes('[INFO]: Test info message'));
    logSpy.restore();
});

test('should not log message below the current log level', t => {
    const logCraft = new LogCraft({ logLevel: LogLevels.WARN });
    const logSpy = sinon.spy(console, 'log');

    logCraft.debug('Debug message');

    t.false(logSpy.called);
    logSpy.restore();
});

test('should log to file in JSON format', t => {
    const mockAppendJsonLog = sinon.stub().callsFake((data, filePath) => {
        t.is(filePath, path.join(UtilHelper.getConfig('file.logDir'), 'test_log.json'));
        t.true(typeof data.timestamp === 'string', 'Timestamp should be a string');
        t.true(data.level instanceof Symbol, 'Level should be a Symbol');
        t.is(data.message, 'Test info message');
    });

    const logCraft = new LogCraft({
        logFormat: LogFormats.JSON,
        logFileName: 'test_log.json',
        appendLogFunction: mockAppendJsonLog,
    });

    logCraft.info('Test info message');

    t.true(mockAppendJsonLog.calledOnce);
});