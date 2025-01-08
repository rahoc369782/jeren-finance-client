
const fs = require("fs")

function readContent(fd, buffer) {
  const result = fs.readSync(fd, buffer, 0, buffer.length, null);
  return result;
}
async function fileReader() {
  const buffer_bytes = Buffer.alloc(4096);
  const readTransactions = new Promise((res, rej) => {
    fs.open("t.ledger", "r", (err, fd) => {
      if (err) {
        rej({ success: false });
        return;
      }
      const read_status = readContent(fd, buffer_bytes);
      res({ success: true, bytes_read: read_status, buffer_bytes });
    });
    // Read default file that is transaction.
  });
  try {
    const status = await readTransactions;
    return status;
  } catch (err) {
    return { success: false };
  }
}

async function parseLedgerData() {
    const data = await fileReader();
    console.log(data.buffer_bytes.toString())
    const lines = data.buffer_bytes.toString().trim().split('\n');
    const jsonData = {};
    
    lines.forEach(line => {
        // Match lines with a number followed by category name
        const match = line.trim().match(/^([-\d.]+)\s+([a-zA-Z0-9:_.-]+)/);
        
        if (match) {
            const value = parseFloat(match[1].trim());
            const account = match[2].trim();
            jsonData[account] = { account, value }
            // Add the parsed entry into the JSON data array
            // jsonData.push({ category, value });
        }
    });
    console.log(jsonData)

    return jsonData;
}

// Parse the data
const financeData = parseLedgerData();