/**
 * Original C++ code:
 * 
 * AlexGyver, alex@alexgyver.ru
 * https://alexgyver.ru/
 * MIT License
 *
 * GitHub: https://github.com/GyverLibs/Random16
 * Version: 1.0
 *
 * JS version by ClintFlames
 */

export class Gyver16 {
  #seed = 0;

  constructor(newSeed = 0) { this.seed = newSeed; }

  get seed() { return this.#seed; }
  set seed(newSeed) { return this.#seed = newSeed & 0xffff; }

  next() {
    this.seed = ((this.#seed * 2053) + 13849);
    return this.seed;
  }

  nextMax(max = 2) {
    max = max & 0xffff;
    return (max * this.next()) >> 16;
  }

  nextMinMax(min = 0, max = 2) {
    min = min & 0xffff;
    max = max & 0xffff;
    return (this.nextMax(max - min) + min);
  }
}
