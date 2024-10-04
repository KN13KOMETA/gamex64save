import { bitMaskLength } from "./BitMap.js"
export class BitMapOffset {
  /** @type {import("./BitMap.js").BitMap} */
  #bitMap;
  /** @type {{ name: string, size: number, pos: number }[]} */
  #schema = [];
  /**
   * @param {import("./BitMap.js").BitMap} bitMap 
   * @param {{ name: string, size: number }[]} schema 
   */
  #space = [0, 0];
  constructor(bitMap, schema) {
    this.#bitMap = bitMap;

    const offset = bitMap.getOffset();
    const space = schema.reduce((p, c) => p + c.size, 0);
    if (offset.size < space) throw RangeError("Your schema size is bigger than we can fit into offset " + offset.size);

    this.#space = [offset.size, space];
    let pos = 0;
    for (let i = 0; i < schema.length; i++) {
      const field = schema[i];
      field.pos = pos;
      this.#schema.push(field);
      pos += field.size;
    }
  }

  get totalSpace() { return this.#space[0]; }
  get freeSpace() { return this.#space[0] - this.#space[1]; }

  #tryGetField(name) {
    const field = this.#schema.find(v => v.name == name);
    if (!field) throw "No offset field named: " + name;
    return field;
  }

  getField(name) {
    const field = this.#tryGetField(name);
    const bitMask = bitMaskLength(field.size);
    const shift = BigInt(field.pos);
    return Number((this.#bitMap.getOffset().data & (bitMask << shift)) >> shift);
  }

  setField(name, value = 0) {
    const field = this.#tryGetField(name);
    const bitMask = bitMaskLength(field.size);
    const normalValue = BigInt(value) & bitMask;
    const offset = this.#bitMap.getOffset().data;
    const shift = BigInt(field.pos);
    this.#bitMap.setOffsetValue(
      (offset & ~(bitMask << shift)) + (normalValue << shift)
    );
  }
}
