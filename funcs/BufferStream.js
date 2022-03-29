import { Writable } from "stream";
class BufferStream extends Writable {
    constructor() {
        super(...arguments);
        this.buffer = Buffer.alloc(0);
    }
    getBuffer() {
        return this.buffer;
    }
    _write(chunk, encoding, callback) {
        this.buffer = Buffer.concat([this.buffer, chunk]);
        callback();
    }
}
export { BufferStream };
//# sourceMappingURL=BufferStream.js.map