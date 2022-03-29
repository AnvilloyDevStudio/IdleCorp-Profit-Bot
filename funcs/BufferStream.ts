import {Writable} from "stream";

class BufferStream extends Writable {
    buffer = Buffer.alloc(0);

    getBuffer() {
        return this.buffer;
    }

    _write(chunk, encoding, callback) {
        this.buffer = Buffer.concat([this.buffer, chunk]);
        callback()
    }
}
export {BufferStream};