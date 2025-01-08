const TransactionProcessor = (() => {
  // Private functions and utilities
  function configManager() {
    const encryptedToken =
      window.localStorage.getItem("token");

    const decryptToken = () => atob(encryptedToken);
    
    const config = {
      base_url: "https://api.github.com",
      owner: "rahoc369782",
      repo: "J_FINANCE_CONNECTOR",
      j_finance_input_file: "J-INPUT-FILE",
      j_finance_output_file: "J-OUTPUT-FILE",
      generateFilePath(type) {
        const fileName =
          type === "input"
            ? this.j_finance_input_file
            : this.j_finance_output_file;
        return `repos/${this.owner}/${this.repo}/contents/${fileName}`;
      },
    };

    return {
      getBaseUrl: () => config.base_url,
      getOwner: () => config.owner,
      getRepo: () => config.repo,
      getToken: () => decryptToken(),
      generateFilePath: (type) => config.generateFilePath(type),
    };
  }

  const CONFIG_MANAGER = configManager();

  const Utils = {
    base64ToUint8Array(base64String) {
      const binaryString = atob(base64String);
      return Uint8Array.from(binaryString, (char) => char.charCodeAt(0));
    },
    concatUint8Arrays(arrays) {
      const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
      const result = new Uint8Array(totalLength);
      arrays.reduce((offset, arr) => {
        result.set(arr, offset);
        return offset + arr.length;
      }, 0);
      return result;
    },
    getHumanReadableDateTime() {
      return new Date().toLocaleString(); // Example: "12/28/2024, 3:30 PM"
    },
  };

  async function NetworkUtility(
    baseurl,
    path,
    method = "GET",
    headers = {},
    body = null,
    type = "text"
  ) {
    const url = `${baseurl}/${path}`;
    try {
      const response = await fetch(url, {
        method,
        headers,
        ...(body && { body: JSON.stringify(body) }),
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return type === "json"
        ? { success: true, data: await response.json() }
        : { success: true, data: await response.text() };
    } catch (err) {
      console.error("Network error:", err.message);
      return { success: false, error: err.message };
    }
  }

  async function readGitFiles(fileType, bufferData = false) {
    const path = CONFIG_MANAGER.generateFilePath(fileType);
    const result = await NetworkUtility(
      CONFIG_MANAGER.getBaseUrl(),
      path,
      "GET",
      {
        Authorization: `Bearer ${CONFIG_MANAGER.getToken()}`,
        Accept: "application/vnd.github.v3+json",
      },
      null,
      "json"
    );

    if (result.success && bufferData) {
      const fileBytes = atob(result.data.content);
      return { success: true, sha: result.data.sha, bufferData: fileBytes };
    }
    return result;
  }

  async function writeGitFiles(body) {
    const path = CONFIG_MANAGER.generateFilePath("input");
    return await NetworkUtility(
      CONFIG_MANAGER.getBaseUrl(),
      path,
      "PUT",
      {
        Authorization: `Bearer ${CONFIG_MANAGER.getToken()}`,
        Accept: "application/vnd.github.v3+json",
      },
      body,
      "json"
    );
  }

  function generateBuffer(data, isHeader = false) {
    const jsonString = JSON.stringify(data);
    const encodedBuffer = new TextEncoder().encode(
      jsonString + (isHeader ? "\n" : "")
    );
    return { buffer: encodedBuffer, length: jsonString.length };
  }

  function parseJSON(buffer) {
    try {
      return { success: true, data: JSON.parse(buffer) };
    } catch (err) {
      console.error("JSON parsing error:", err.message);
      return { success: false, error: err.message };
    }
  }

  function modifyHeaders(headers, batchSize) {
    return {
      ...headers,
      total_transactions: headers.total_transactions + batchSize,
      process_timestamp: Date.now(),
      process_datetime: Utils.getHumanReadableDateTime(),
    };
  }

  function compactTransactions(buffer, thresholdTimestamp, newTransaction) {
    try {
      const transactions = JSON.parse(buffer);
      if (!Array.isArray(transactions)) throw new Error("Invalid data format");
      const validTransactions = transactions.filter(
        (t) => t.timestamp > thresholdTimestamp
      );
      if (newTransaction && newTransaction["timestamp"])
        validTransactions.push(newTransaction);
      return { success: true, data: validTransactions };
    } catch (err) {
      console.error("Compaction error:", err.message);
      return { success: false, error: err.message };
    }
  }

  async function processTransactions(newTransaction) {
    try {
      console.log("Starting transaction processing...");

      const [inputFile, outputFile] = await Promise.all([
        readGitFiles("input", true),
        readGitFiles("output", true),
      ]);

      if (!inputFile.success || !outputFile.success) {
        throw new Error("Failed to read input or output files.");
      }

      const { sha, bufferData: inputData } = inputFile;
      const { bufferData: outputData } = outputFile;

      const inputHeader = parseJSON(inputData.split("\n")[0]);
      const outputHeader = parseJSON(outputData.split("\n")[0]);
      if (!inputHeader.success || !outputHeader.success)
        throw new Error("Failed to parse headers.");

      const modifiedHeader = modifyHeaders(inputHeader.data, 1);
      const compactedData = compactTransactions(
        inputData.split("\n")[1],
        outputHeader.data.last_processed_timestamp,
        newTransaction
      );
      if (!compactedData.success) throw new Error("Compaction failed.");

      const headerBuffer = generateBuffer(modifiedHeader, true);
      const dataBuffer = generateBuffer(compactedData.data);
      const finalBuffer = Utils.concatUint8Arrays([
        headerBuffer.buffer,
        dataBuffer.buffer,
      ]);

      const pushResult = await writeGitFiles({
        message: `Transactions updated as on ${new Date().toISOString()}`,
        sha,
        content: btoa(String.fromCharCode(...finalBuffer)),
      });

      if (!pushResult.success)
        throw new Error("Failed to push data to GitHub.");

      return { success: true };
    } catch (err) {
      console.error("Transaction processing error:", err.message);
      return { success: false, error: err.message };
    }
  }

  function updateGlobalStatus({ text, status }) {
    const colorDir = {
      info: "transperant",
      success: "#157145",
      failed: "#E50914",
      warning: "#FF9900",
    };
    const statusBar = document.getElementById("account-status-msg");
    const statusBarParent = document.getElementById("status_strip_wrapper");
    statusBar.innerText = text;
    statusBar.style.color = status != "info" ? "#fff" : "";
    statusBarParent.style.background = colorDir[status];
  }

  // Expose only the main function
  return {
    processTransactions,
    updateGlobalStatus,
  };
})();
