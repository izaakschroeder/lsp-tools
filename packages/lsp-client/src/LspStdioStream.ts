import { Transform } from 'node:stream';

export class LspStdioStream extends Transform {
  #chunks: Buffer[] = [];
  #headers: Record<string, string> = {};
  #remaining = -1;

  constructor() {
    super({
      readableObjectMode: true,
      writableObjectMode: false,
    });
  }

  _transform(
    data: Buffer,
    encoding: string,
    done: (err: Error | null | undefined) => void,
  ) {
    try {
      this.#transform(data, encoding);
      done(null);
    } catch (err) {
      done(err as Error);
    }
  }

  #processLine(line: Buffer, rest: Buffer, encoding: string): void {
    if (line.length === 0) {
      if (!('content-length' in this.#headers)) {
        throw new Error();
      }
      this.#remaining = Number.parseInt(this.#headers['content-length'], 10);
      if (!Number.isInteger(this.#remaining)) {
        throw new Error();
      }
      this.#headers = {};
      this.#transform(rest, encoding);
      return;
    }
    const [key, value] = line.toString('utf8').split(':', 2);
    if (typeof key !== 'string' || typeof value !== 'string') {
      throw new TypeError();
    }
    this.#headers[key.toLowerCase()] = value;
    this.#transform(rest, encoding);
  }

  #transform(input: Buffer, encoding: string): void {
    if (input.length <= 0) {
      return;
    }
    if (this.#remaining > -1) {
      const amount = Math.min(this.#remaining, input.length);
      this.#chunks.push(
        amount < input.length ? input.subarray(0, amount) : input,
      );
      this.#remaining -= amount;
      if (this.#remaining <= 0) {
        const json = Buffer.concat(this.#chunks).toString('utf8');
        const payload = JSON.parse(json);
        this.#chunks = [];
        this.#remaining = -1;
        this.push(payload);
      }
      this.#transform(input.subarray(amount), encoding);
      return;
    }

    const lastChunk = this.#chunks[this.#chunks.length - 1];
    const lastByte = lastChunk?.[lastChunk.length - 1];
    if (lastChunk && (lastByte === 13 || lastByte === 10)) {
      let offset = 0;
      if (lastByte === 13 && input[0] === 10) {
        offset += 1;
      }
      const line = Buffer.concat([
        ...this.#chunks.slice(0, this.#chunks.length - 1),
        lastChunk.subarray(0, lastChunk.length - 1),
      ]);
      this.#processLine(line, input.subarray(offset), encoding);
      return;
    }

    let r = input.indexOf(13);
    let offset = 1;
    if (r === -1 || r === input.length) {
      r = input.indexOf(10);
      if (r === -1) {
        this.#chunks.push(input);
        return;
      }
    } else if (input[r + 1] === 10) {
      offset += 1;
    }

    let line = input.subarray(0, r);
    if (this.#chunks.length > 0) {
      line = Buffer.concat([...this.#chunks, line]);
      this.#chunks = [];
    }
    this.#processLine(line, input.subarray(r + offset), encoding);
  }
}
