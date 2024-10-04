export const color = {
  toRGBA: (c = 0) => ({
    r: (c >> 24) & 0xff,
    g: (c >> 16) & 0xff,
    b: (c >> 8) & 0xff,
    a: c & 0xff
  }),
  toNormalizedRGBA: (c = 0) => ({
    r: ((c >> 24) & 0xff) / 0xff,
    g: ((c >> 16) & 0xff) / 0xff,
    b: ((c >> 8) & 0xff) / 0xff,
    a: (c & 0xff) / 0xff
  }),
  fromRGBA: (c = { r: 0, g: 0, b: 0, a: 0 }) => (
    // JS is cursed, if I don't do >>> 0 it results in negative number
    // https://stackoverflow.com/questions/54030623/left-shift-results-in-negative-numbers-in-javascript
    (c.r << 24 >>> 0) +
    (c.g << 16) +
    (c.b << 8) +
    c.a
  ),
  fromNormalizedRGBA: (c = { r: 0, g: 0, b: 0, a: 0 }) => (
    // Read comment above
    Math.round(c.r << 24 >>> 0) +
    Math.round(c.g << 16) +
    Math.round(c.b << 8) +
    Math.round(c.a)
  ),
  lerpNormalizedRGBA: (
    a = { r: 0, g: 0, b: 0, a: 0 },
    b = { r: 0, g: 0, b: 0, a: 0 },
    amount = 0
  ) => ({
    r: a.r + amount * (b.r - a.r),
    g: a.g + amount * (b.g - a.g),
    b: a.b + amount * (b.b - a.b),
    a: a.a + amount * (b.a - a.a),
  })
}
