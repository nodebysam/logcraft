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

/**
 * LogCraft data class for storing and retreiving data.
 */
class Data {
    /**
     * Constructor that sets up Data. 
     * 
     * @param {Object} [options={}] - Optional options.
     * @param {string} [options.testFileName] - The name of a test file name (optional). 
     */
    constructor(options = {}) {
        let fileName;

        if (options && options.testFileName) {
            fileName = options.testFileName;
        } else {
            fileName = 'data.json';
        }

        this.storedData = {};
        this.dataFilePath = path.join(__dirname, 'data', fileName);
        this.ensureDataFileExists();
        this.loadData();
    }

    /**
     * Get the data for the given key.
     * 
     * @param {string} key - The name of the key to get.
     * @returns {any|null} The data for the given key or null if it does not exist.
     */
    get(key) {
        return this.exists(key) ? this.storedData[key] : null;
    }

    /**
     * Get the data for the given key name.
     * 
     * @param {string} key - The name of the key to set.
     * @param {any} value - The value to set for the key.
     */
    set(key, value) {
        this.storedData[key] = value;
        this.saveData();
    }

    /**
     * Check if a key exists.
     * 
     * @param {string} key - The name of the key to check.
     * @returns {boolean} True if the key exists, false if it does not exist.
     */
    exists(key) {
        return this.storedData.hasOwnProperty(key);
    }

    /**
     * Deletes the data file.
     */
    deleteAll() {
        try {
            if (fs.existsSync(this.dataFilePath)) {
                fs.unlinkSync(this.dataFilePath);
            }
        } catch (error) {
            console.error('[LOGCRAFT] Failed to delete the data:', error);
            throw error;
        }
    }

    /**
     * Loads the data into the class property.
     */
    loadData() {
        try {
            const fileData = fs.readFileSync(this.dataFilePath, 'utf-8');
            this.storedData = JSON.parse(fileData);
        } catch (error) {
            console.error('[LOGCRAFT] Failed to load data from the data file:', error);
            throw error;
        }
    }

    /**
     * Saves the current data to file.
     */
    saveData() {
        try {
            const jsonData = JSON.stringify(this.storedData, null, 2);
            fs.writeFileSync(this.dataFilePath, jsonData, 'utf-8');
        } catch (error) {
            console.error('[LOGCRAFT] Failed to write data to the data file:', error);
            throw error;
        }
    }

    /**
     * Ensure that the data file exists before interacting.
     */
    ensureDataFileExists() {
        const dirPath = path.dirname(this.dataFilePath);

        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        if (!fs.existsSync(this.dataFilePath)) {
            fs.writeFileSync(this.dataFilePath, '{}', 'utf-8');
        }
    }
}

module.exports = Data;