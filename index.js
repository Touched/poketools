var fs = require('fs');
var tileset = require('./lib/map/tileset');
var PNG = require('node-png').PNG;

var buffer = fs.readFileSync('./BPRE0.gba');
var data = tileset.load(buffer, 0x2D4A94);

function writeLayer(layer, tileWidth) {
    tileWidth = tileWidth || 5;

    var tilesetImage = new PNG({
        filterType: 4,
        width: 16 * tileWidth,
        height: 0x280 / tileWidth * 16
    });

    data.forEach(function (block, n) {
        var image = new PNG({
            filterType: 4,
            width: 16,
            height: 16
        });

        for (var i = 0; i < 1; ++i) {
            image.data = block[layer];
        }

        image.data = new Buffer(image.data);

        image.bitblt(tilesetImage, 0, 0, 16, 16, (n % tileWidth) * 16, Math.floor(n / tileWidth) * 16);
    });

    tilesetImage.pack().pipe(fs.createWriteStream('out/layer' + layer + '.png'));
}

writeLayer(0, 10);
writeLayer(1, 10);