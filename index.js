var fs = require('fs');
var tileset = require('./lib/map/tileset');
var PNG = require('node-png').PNG;

var buffer = fs.readFileSync('./BPRE0.gba');
var data = tileset.load(buffer, 0x2D4A94 + 0x18 * 1);

function writeLayer(data) {
    var tilesetImage = new PNG({
        filterType: 4,
        width: 16 * data.length,
        height: 16 * 2
    });

    for (var layer = 0; layer < 2; ++layer) {
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

            image.bitblt(tilesetImage, 0, 0, 16, 16, n * 16, layer * 16);
        });
    }

    tilesetImage.pack().pipe(fs.createWriteStream('out/tileset.png'));
}

writeLayer(data);