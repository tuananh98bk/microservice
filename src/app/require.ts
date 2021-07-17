import fs from 'fs';

/**
 * Require all module in folder controller.
 * Deep: Infinity
 */

requireJsModule('controllers');

function requireJsModule(directoryName: string) {
  fs.readdirSync(__dirname + `/${directoryName}`, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory() || dirent.name.endsWith('.js'))
  .forEach((dirent) => {
    if (dirent.isDirectory()) {
      requireJsModule(`/${directoryName}/${dirent.name}`)
    }
    if (!dirent.isDirectory()) {
      module.exports = require(`./${directoryName}/${dirent.name}`);
    }
  });
}
