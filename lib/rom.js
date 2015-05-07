var fs = require('fs');

function bufferFile(filePath) {
}

var Rom = function (filePath) {
    this._path = filePath;
    this._buffer = fs.readFileSync(filePath);
};

