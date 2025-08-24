// utils/file-store.js
const fs = require("fs").promises;
const path = require("path");

// Queue to serialize writes
let writeQueue = Promise.resolve();

async function readJSON(filepath) {
    const data = await fs.readFile(filepath, "utf-8");
    return JSON.parse(data);
}

async function writeJSON(filepath, content) {
  // Serialize writes to avoid race conditions
    writeQueue = writeQueue.then(async () => {
        const tmpFile = filepath + ".tmp";          // 1. Write temp file
        await fs.writeFile(tmpFile, JSON.stringify(content, null, 2), "utf-8");
        await fs.rename(tmpFile, filepath);         // 2. Rename to actual file
    });
    return writeQueue;
}

module.exports = { readJSON, writeJSON };
