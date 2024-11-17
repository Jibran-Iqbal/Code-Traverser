const fs = require('fs');
const path = require('path');

// Output file path relative to the script's location
const outputFilePath = path.join(__dirname, 'output.txt');

// Function to read a file and store its content
const readFile = (filePath) => {
  const fileName = path.basename(filePath);
  // Skip specific unnecessary files like package.json, package-lock.json
  if (fileName === 'package.json' || fileName === 'package-lock.json') {
    return; // Skip these files
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file ${filePath}:`, err);
      return;
    }
    // Append the content to the output file
    const output = `File: ${filePath}\n{\n${data}\n}----------------------------\n`;
    fs.appendFile(outputFilePath, output, (err) => {
      if (err) {
        console.error(`Error appending to file ${outputFilePath}:`, err);
      }
    });
  });
};

// Function to traverse directories
const traverseDirectory = (dirPath) => {
  fs.readdir(dirPath, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${dirPath}:`, err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(dirPath, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`Error stating file ${filePath}:`, err);
          return;
        }

        if (stats.isDirectory()) {
          // Skip certain unnecessary directories like node_modules, build, bin, obj, etc.
          if (
            file === 'node_modules' ||
            file === 'build' ||
            file === 'public' ||
            file === '.git' ||
            file === 'dependency' ||
            file === 'bin' ||      // Added to skip .NET build directory
            file === 'obj'         // Added to skip .NET build directory
          ) {
            return;
          }
          // If it's a directory, traverse it recursively
          traverseDirectory(filePath);
        } else if (
          stats.isFile() &&
          (
            path.extname(file) === '.js' ||
            path.extname(file) === '.jsx' ||
            path.extname(file) === '.json' ||
            path.extname(file) === '.html' ||
            path.extname(file) === '.http' ||
            path.extname(file) === '.cs' ||      // Included for C# files
            path.extname(file) === '.dart' ||       // Included for Dart files
            path.extname(file) === '.py' 
          )
        ) {
          // If it's a relevant file (including .cs for .NET), read its contents
          readFile(filePath);
        }
      });
    });
  });
};

// Check for command line arguments
if (process.argv.length < 3) {
  console.error('Please provide a directory to start from.');
  process.exit(1);
}

// Starting directory from command line argument
const startDir = path.resolve(process.argv[2]);

// Clear the output file before starting
fs.writeFile(outputFilePath, '', (err) => {
  if (err) {
    console.error(`Error clearing file ${outputFilePath}:`, err);
    return;
  }
  // Start the traversal from the starting directory
  traverseDirectory(startDir);
});
