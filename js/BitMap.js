export const bitMaskLength = (n = 0) => BigInt(parseInt("1".repeat(n), 2));

export class BitMap {
  #offset = { pos: BigInt(0), size: 0 };
  #data = BigInt(0);
  #size = { x: 0, xy: 0, xyz: 0 }

  constructor(save = BigInt(0), size = 3) {
    if (size ** 3 > 64) throw RangeError("size volume is taking more than 64 bit.");
    if (typeof save == "number") this.#data = BigInt(save);
    else if (typeof save == "bigint") this.#data = save;
    else throw TypeError("save must be number or bigint");

    this.#size = {
      x: size,
      xy: size ** 2,
      xyz: size ** 3
    }

    this.#offset = {
      size: 64 - this.#size.xyz,
      pos: BigInt(this.#bitIndex(this.#size.x - 1, this.#size.x - 1, this.#size.x - 1) + 1)
    }
  }

  static random(size = 3) {
    return new BitMap(
      BigInt(Math.floor(
        // Math.random() * bitMaskLength(size ** 3)
        Math.random() * parseInt(
          "1".repeat(size ** 3),
          2
        )
      )),
      size
    );
  }

  get save() { return this.#data; }
  set save(n) { return this.#data = BigInt(n); }

  #bitIndex(x = 0, y = 0, z = 0) { return (z * this.#size.xy) + (y * this.#size.x) + x; }
  #bitMask(x = 0, y = 0, z = 0) { return BigInt(0b1) << BigInt(this.#bitIndex(x, y, z)); }
  #setBitValue(x = 0, y = 0, z = 0) { this.#data |= this.#bitMask(x, y, z); }
  #clearBitValue(x = 0, y = 0, z = 0) { this.#data &= ~this.#bitMask(x, y, z); }
  #checkCoordinates(x, y, z) {
    if (
      typeof x != "number" ||
      typeof y != "number" ||
      typeof z != "number"
    ) throw TypeError("Coordinates must be type of number.");
    if (!(
      Number.isSafeInteger(x) &&
      Number.isSafeInteger(y) &&
      Number.isSafeInteger(z)
    )) throw RangeError("Coordinates must be safe integer.");
    if (
      x < 0 ||
      y < 0 ||
      z < 0
    ) throw RangeError("Coordinates value must be positive.");
    if (
      x >= this.#size.x ||
      y >= this.#size.x ||
      z >= this.#size.x
    ) throw RangeError("Coordinates value must be less than " + this.#size.x);
  }

  getValue(x = 0, y = 0, z = 0) {
    this.#checkCoordinates(x, y, z);
    return (this.#data & this.#bitMask(x, y, z)) == 0 ? 0 : 1;
  }

  setValue(v = 0, x = 0, y = 0, z = 0) {
    this.#checkCoordinates(x, y, z);
    if (v === 0) this.#clearBitValue(x, y, z);
    else if (v === 1) this.#setBitValue(x, y, z);
    else throw TypeError(`v must be 0 or 1.`);
  }

  getOffset() {
    return { data: this.#data >> this.#offset.pos, size: this.#offset.size };
  }

  setOffsetValue(n = 0n) {
    // Need to make sure that there is no extra data
    n = n & bitMaskLength(this.#offset.size);
    this.#data = (n << this.#offset.pos) + (this.#data & bitMaskLength(this.#size.xyz));
  }
}
