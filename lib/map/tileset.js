var lzss = require('../lzss');
var image = require('../image');
var util = require('../util');

function getBlockCount(secondary) {
    // FR only for now
    return secondary ? 0x56 : 0x280; // Copied from MEH.ini
}

function loadPalette(buf, offset) {
    return image.loadPalette(buf, offset, 16);
}

function loadBlockData(buf, offset) {
    var block = [];

    for (var layer = 0; layer < 2; ++layer) {
        // Create blank array to build layer in
        block.push([]);
        for (var tile = 0; tile < 4; ++tile) {
            var data = buf.readUInt16LE(offset + (layer * 4 * 2) + (tile * 2));

            // TODO: Investigate this
            block[layer].push({
                tile: (data & 0xFF) | (data & 0x300),
                palette: (data & 0xF000) >> 12,
                flip: {
                    x: !!(data & 0x400),
                    y: !!(data & 0x800)
                }
            });
        }
    }

    return block;
}

function renderTile(graphics, palette, flip) {
    var out = new Array(64);

    // Slicing doesn't seem to copy
    for (var i = 0; i < 64; ++i) out[i] = graphics[i];

    if (flip.x) {
        for (var y = 0; y < 8; ++y) {
            for (var x = 0; x < 4; ++x) {
                var tmp = out[y * 8 + x];
                out[y * 8 + x] = out[y * 8 + 7 - x];
                out[y * 8 + 7 - x] = tmp;
            }
        }
    }

    if (flip.y) {
        for (var y = 0; y < 4; ++y) {
            for (var x = 0; x < 8; ++x) {
                var tmp = out[y * 8 + x];
                out[y * 8 + x] = out[(7 - y) * 8 + x];
                out[(7 - y) * 8 + x] = tmp;
            }
        }
    }

    for (var i = 0; i < out.length; ++i) {
        out[i] = palette[out[i]];
    }

    return out;
}

function renderBlock(block, tiles, palettes) {
    return block.map(function (layer) {
        var renderedTile = layer.map(function (tile) {
            var start = 64 * tile.tile;
            var graphics = tiles.slice(start, start + 64),
                palette = palettes[tile.palette];

            if(start + 64 > tiles.length) {
                graphics = new Buffer(64);
            }

            return renderTile(graphics, palette, tile.flip);
        });

        var renderedLayer = new Array(256);

        // Paste 8x8 tiles into a 16x16 layer
        var positions = [[0, 0], [8, 0], [0, 8], [8, 8]];
        for (var i = 0; i < renderedTile.length; ++i) {
            for (var y = 0; y < 8; ++y) {
                for (var x = 0; x < 8; ++x) {
                    var position = positions[i];

                    var originX = position[0],
                        originY = position[1];

                    var atPixel = (originY + y) * 16 + originX + x;
                    renderedLayer[atPixel] = renderedTile[i][y * 8 + x];
                }
            }
        }

        var merged = [];
        merged = merged.concat.apply(merged, renderedLayer);

        return merged;
    });
}

function loadTileset(buf, offset) {
    offset = offset || 0;

    var compressed = !!buf[offset],
        secondary = !!buf[offset + 1];

    var tiles = util.pointerToOffset(buf, offset + 4),
        paletteData = util.pointerToOffset(buf, offset + 8),
        blockData = util.pointerToOffset(buf, offset + 0xC),
        funcPtr = util.pointerToOffset(buf, offset + 0x10),
        behaviours = util.pointerToOffset(buf, offset + 0x14);

    // Decompress the data
    var graphics;
    if (compressed) {
        graphics = lzss.decompress(buf, tiles);
    } else {
        throw new Error('Uncompressed tilesets unsupported');
    }

    console.log(blockData.toString(16));

    graphics = image.expand(graphics);

    // Load the palette data
    var i;
    var palettes = new Array(16);
    for (i = 0; i < palettes.length; ++i) {
        palettes[i] = loadPalette(buf, paletteData + 32 * i);
    }

    // Load blocks
    var blockCount = getBlockCount(secondary);
    var blocks = new Array(blockCount);

    for (i = 0; i < blocks.length; ++i) {
        var data = loadBlockData(buf, blockData + i * 16);
        blocks[i] = renderBlock(data, graphics, palettes);
    }

    return blocks;
}

module.exports = {
    load: loadTileset
};