function pointerToOffset(buf, offset) {
    return buf.readUInt32LE(offset) - 0x08000000;
}

module.exports = {
    pointerToOffset: pointerToOffset
};