
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");

// data/ folder na thakle taka toiri kora (fresh clone er khetre lagbe)
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Generic function: JSON file theke data read kora
function readData(fileName) {
  const filePath = path.join(DATA_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]");
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  try {
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

// Generic function: JSON file e data write kora
function writeData(fileName, data) {
  const filePath = path.join(DATA_DIR, fileName);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error(`❌ Failed to write ${fileName}:`, err.message);
    return false;
  }
}

module.exports = { readData, writeData };
