var util = require('../util');
var tileset = require('./tileset');

function parseMapData(buf, pointer, length) {

}

function loadMapData(buf, headerOffset) {
    var width = util.pointerToOffset(buf, headerOffset),
        height = util.pointerToOffset(buf, headerOffset + 4),
        bb_width = buf[headerOffset + 0x18],
        bb_height = buf[headerOffset + 0x19];

    console.log(util.pointerToOffset(buf, headerOffset + 0x10));

    return {
        width: width,
        height: height,
        data: parseMapData(buf, util.pointerToOffset(buf, headerOffset + 0xC), height * width),
        border: {
            data: parseMapData(buf, util.pointerToOffset(buf, headerOffset + 8), bb_height * bb_width),
            width: bb_width,
            height: bb_height
        },
        blocks: [
            tileset.load(buf, util.pointerToOffset(buf, headerOffset + 0x10)),
            tileset.load(buf, util.pointerToOffset(buf, headerOffset + 0x14))
        ]
    };
}

module.exports = {
    load: loadMapData
};