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
const Data = require('../src/data');
const path = require('path');
const fs = require('fs');

test.beforeEach(t => {
    t.context.data = new Data({ testFileName: 'test.json' });

    const testFilePath = path.join(__dirname, '..', 'src', 'data', 'test.json');
    const dirPath = path.dirname(testFilePath);

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    if (!fs.existsSync(testFilePath)) {
        fs.writeFileSync(testFilePath, '{}', 'utf-8');
    }
});

test.afterEach(t => {
    t.context.data.deleteAll();
});

test('get should return null when the key does not exist', t => {
    const result = t.context.data.get('unknown-key');
    t.is(result, null);
});

test('get should return the correct value for an existing key', t => {
    t.context.data.set('name', 'John Doe');
    const result = t.context.data.get('name');
    t.is(result, 'John Doe');
});

test('get should return the correct value that is an object for an existing key', t => {
    t.context.data.set('testObject', { name: "John", age: 30 });
    const result = t.context.data.get('testObject');
    const expected = { name: "John", age: 30 };
    t.deepEqual(result, expected);
});

test('get should return the correct value that is an integer for an existing key', t => {
    t.context.data.set('integer', 1000);
    const result = t.context.data.get('integer');
    const expected = 1000;
    t.deepEqual(result, expected);
});

test('get should return the correct value that is boolean for an existing key', t => {
    t.context.data.set('boolean', true);
    const result = t.context.data.get('boolean');
    const expected = true;
    t.deepEqual(result, expected);
});

test('exists should return false for a non-existing key', t => {
    const result = t.context.data.exists('non-existent');
    const expected = false;
    t.deepEqual(result, expected);
});

test('exists should return true for an existing key', t => {
    t.context.data.set('test-key', 'we are testing');
    const result = t.context.data.exists('test-key');
    const expected = true;
    t.deepEqual(result, expected);
});