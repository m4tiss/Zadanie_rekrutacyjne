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


async function main() {
    try {
    const data = await uploadCsv(path.join(__dirname, "ceny_akcji.csv"));
    console.log("Sformatowane dane: " + data)
    } catch (error) {
      console.error("Wystąpił błąd:", error);
    }
  }
  
  main();