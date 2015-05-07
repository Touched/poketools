var fs = require('fs');
var tileset = require('./lib/map/tileset');
var PNG = require('node-png').PNG;

var buffer = fs.readFileSync('./BPRE0.gba');
var data = tileset.load(buffer, 0x2D4A94);



data.forEach(function (block, n) {

    var image = new PNG({
        filterType: 4,
        width: 16,
        height: 16
    });

    for (var i = 0; i < 1; ++i) {
        image.data = block[0];
        image.pack().pipe(fs.createWriteStream('out/block' + n + '.png'));
    }
});