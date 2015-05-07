function compress(buf) {

}

function decompress(buf, offset) {
    offset = offset || 0;

    if (buf[offset] != 0x10) {
        throw new Error('Invalid header');
    }

    var destSize = buf.readUInt32LE(offset) >> 8;

    if (!destSize) {
        throw new Error('Invalid size');
    }

    // Start after the header
    offset += 4;
    var out = new Buffer(destSize);

    var currentSize = 0;
    while (currentSize < destSize) {
        var flags = buf[offset++];
        var start;

        for (var block = 0; block < 8; ++block) {
            var flag = flags & (0x80 >> block);

            if (flag) {
                // Compressed

                // Interpret block data
                var blockData = buf.readUInt16LE(offset);
                var count = ((blockData >> 4) & 0xF) + 3;
                var displacement = ((blockData & 0xF) << 8) | (blockData >> 8);
                offset += 2;

                // Copy from buffer
                start = currentSize;
                for (var i = 0; i < count; ++i) {
                    var from = start - displacement - 1 + i;
                    var to = currentSize++;

                    if (to >= destSize || from >= destSize) {
                        throw new Error('Invalid LZSS data');
                    }
                    out[to] = out[from];
                }
            } else {
                // Uncompressed
                out[currentSize++] = buf[offset++];
            }
        }
    }

    return out;
}

module.exports = {
    compress: compress,
    decompress: decompress
};