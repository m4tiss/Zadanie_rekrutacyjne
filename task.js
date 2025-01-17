//SELECT id, data, cena, waluta FROM ceny_akcji WHERE data BETWEEN 'x' AND 'y' ORDER BY data ASC;

const fs = require("fs");
const path = require("path");

async function uploadCsv(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject("Błąd odczytu pliku CSV.");
        return;
      }
      const rows = data
        .split("\n")
        .map((row) => row.split(",").map((cell) => cell.trim()))
        .filter((row) => row.length > 1 && row.every((cell) => cell !== ""));

      resolve(rows);
    });
  });
}

function processData(data) {
  let largestDrop = 0;
  let dropPeriods = 0;

  let inDropPeriod = false;
  let isDropPeriodForCounting = false;

  let largestDropTotal = 0;
  let longestDropPeriodLength = 0;

  let currentDropTotal = 0;
  let currentDropLength = 0;

  let longestStablePeriodLength = 0;
  let currentStablePeriodLength = 0;

  for (let i = 1; i < data.length; i++) {
    const prev = parseFloat(data[i - 1][2]);
    const curr = parseFloat(data[i][2]);
    const dailyDrop = prev - curr;

    if (dailyDrop > 0) {
      if (!inDropPeriod) {
        inDropPeriod = true;
        currentDropLength = 1;
        currentDropTotal = dailyDrop;
      } else {
        currentDropLength++;
        currentDropTotal += dailyDrop;
      }

      if (!isDropPeriodForCounting) {
        isDropPeriodForCounting = true;
        dropPeriods++;
      }

      currentStablePeriodLength++;
      if (currentStablePeriodLength > longestStablePeriodLength) {
        longestStablePeriodLength = currentStablePeriodLength;
      }
      currentStablePeriodLength = 0;
    } else if (dailyDrop === 0) {
      if (inDropPeriod) {
        currentDropLength++;
      }
      currentStablePeriodLength++;
    } else {
      if (inDropPeriod) {
        currentDropLength++;
        if (currentDropTotal > largestDropTotal) {
          largestDropTotal = currentDropTotal;
          longestDropPeriodLength = currentDropLength;
        }
        inDropPeriod = false;
      }

      if (isDropPeriodForCounting) {
        isDropPeriodForCounting = false;
      }

      currentStablePeriodLength++;
      if (currentStablePeriodLength > longestStablePeriodLength) {
        longestStablePeriodLength = currentStablePeriodLength;
      }
      currentStablePeriodLength = 0;
    }

    if (dailyDrop > largestDrop) {
      largestDrop = dailyDrop;
    }
  }

  currentStablePeriodLength++;
  if (currentStablePeriodLength > longestStablePeriodLength) {
    longestStablePeriodLength = currentStablePeriodLength;
  }

  if (inDropPeriod) {
    currentDropLength++;
    if (currentDropTotal > largestDropTotal) {
      largestDropTotal = currentDropTotal;
      longestDropPeriodLength = currentDropLength;
    }
  }

  results = {
    largestDrop: parseFloat(largestDrop.toFixed(2)),
    dropPeriods: dropPeriods,
    largestDropTotal: parseFloat(largestDropTotal.toFixed(2)),
    largestDropPeriodLength: longestDropPeriodLength,
    longestStablePeriodLength: longestStablePeriodLength,
  };

  return results;
}

async function main() {
  try {
    const data = await uploadCsv(path.join(__dirname, "ceny_akcji.csv"));

    const results = await processData(data);
    console.log("Największy dzienny spadek wartości: ", results.largestDrop);
    console.log("Ilość okresów spadków cen: ", results.dropPeriods);
    console.log(
      "Liczba dni okresu spadku, w którym cena akcji spadła najbardziej: ",
      results.largestDropPeriodLength
    );
    console.log(
      "Łączna wartość spadku, w którym cena akcji spadła najbardziej: ",
      results.largestDropTotal
    );
    console.log(
      "Najdłuższy okres niezmiennej ceny jako liczba dni",
      results.longestStablePeriodLength
    );
  } catch (error) {
    console.error("Wystąpił błąd:", error);
  }
}

main();