function gbaColor(short, a) {
    var r = (short & 0x1F) * 8,
        g = ((short & 0x3E0) >> 5) * 8,
        b = ((short & 0x7C00) >> 10) * 8;

    return [r, g, b, a];
}

function loadPalette(buf, offset, pals) {
    pals = pals ? 256 : 16;

    var colors = [];
    for (var i = 0; i < pals; ++i) {
        colors[i] = gbaColor(buf.readInt16LE(offset + i * 2), i === 0 ? 0 : 255);
    }

    return colors;
}

function expand(buf) {
    var out = new Buffer(buf.length * 2);

    for (var i = 0; i < buf.length; ++i) {
        out[i * 2] = buf[i] & 0xF;
        out[i * 2 + 1] = (buf[i] >> 4) & 0xF;
    }

    return out;
}

module.exports = {
    loadPalette: loadPalette,
    expand: expand
};