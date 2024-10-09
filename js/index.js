import { Gyver16 } from "./Gyver16.js"
import { BitMap } from "./BitMap.js"
import { BitMapOffset } from "./BitMapOffset.js"
import { createRender } from "./createRender.js"
import { createGUI } from "./createGUI.js"
import { createStory } from "./createStory.js"

const splitString = (s = 0, n = 3) => s.replace(RegExp(`(.{${n}})`, "g"), "$1 ");
const canMove = (a = { x: 0, y: 0, z: 0 }, b = { x: 0, y: 0, z: 0 }) => {
  if (
    (Math.abs(a.x - b.x) == 1 && a.y == b.y && a.z == b.z) ||
    (a.x == b.x && Math.abs(a.y - b.y) == 1 && a.z == b.z) ||
    (a.x == b.x && a.y == b.y && Math.abs(a.z - b.z) == 1)
  ) return true;

  return false;
}
const generateMap = (bitMap, g16) => {
  for (let x = 0; x < SIZE; x++)
    for (let y = 0; y < SIZE; y++)
      for (let z = 0; z < SIZE; z++) {
        bitMap.setValue(g16.nextMax(2), x, y, z);
      }
}

const SIZE = 3;

const localMap = (() => {
  if (localStorage.getItem("save") == null) return null;
  try {
    return BigInt(localStorage.getItem("save"));
  } catch (e) {
    return null;
  }
})();
const bitMap = new BitMap(
  localMap !== null ? localMap : 0,
  SIZE
);
const g16 = new Gyver16();
const osetMap = new BitMapOffset(
  bitMap,
  [
    { name: "x", size: 2 },
    { name: "y", size: 2 },
    { name: "z", size: 2 },
    { name: "seed", size: 16 },
    { name: "solved", size: 8 },
    { name: "route0", size: 1 },
    { name: "route1", size: 1 },
    { name: "route2", size: 1 },
    { name: "route3", size: 1 },
    { name: "route4", size: 1 },
    { name: "route5", size: 1 },
    { name: "route6", size: 1 }
  ]
);
const storyRoute = {
  get all() {
    return [
      osetMap.getField("route0"),
      osetMap.getField("route1"),
      osetMap.getField("route2"),
      osetMap.getField("route3"),
      osetMap.getField("route4"),
      osetMap.getField("route5"),
      osetMap.getField("route6")
    ];
  },
  set all(arr) {
    osetMap.setField("route0", arr[0]);
    osetMap.setField("route1", arr[1]);
    osetMap.setField("route2", arr[2]);
    osetMap.setField("route3", arr[3]);
    osetMap.setField("route4", arr[4]);
    osetMap.setField("route5", arr[5]);
    osetMap.setField("route6", arr[6]);
    return this.all;
  }
}
if (!Number.isSafeInteger(localMap)) {
  osetMap.setField("y", 1n);
  osetMap.setField("x", 1n);
  osetMap.setField("z", 1n);
  osetMap.setField("seed", ~~(Math.random() * 0xffff));
}

g16.seed = osetMap.getField("seed");

if (!Number.isSafeInteger(localMap)) {
  generateMap(bitMap, g16);
  osetMap.setField("seed", g16.seed);
}
// The Shitty Bridge to transfer data beetwen gui and render
let trickyUpdate = () => { }


const cgui = createGUI(
  (n) => {
    bitMap.save = n;
    g16.seed = osetMap.getField("seed");

    localStorage.setItem("save", bitMap.save.toString());
    cgui.updateSave(n);
    cgui.updateSolved(osetMap.getField("solved"));

    trickyUpdate();
  }
);

const story = createStory(cgui.mainGui);
const storyCallback = (route) => {
  storyRoute.all = route;
  localStorage.setItem("save", bitMap.save.toString());
  cgui.updateSave(bitMap.save);
}
story(osetMap.getField("solved"), storyRoute.all, storyCallback);
localStorage.setItem("save", bitMap.save.toString());
cgui.updateSave(bitMap.save);
cgui.updateSolved(osetMap.getField("solved"));

let render = createRender(
  document.getElementsByTagName("canvas")[0],
  {
    clear: 0x444455ff,
    active: 0x44ff44ff,
    idle: 0xff4444ff,
    player: 0xffffffff,
    hover: 0xffffffff
  },
  SIZE,
  {
    x: osetMap.getField("x"),
    y: osetMap.getField("y"),
    z: osetMap.getField("z"),
  },
  (x, y, z) => bitMap.getValue(x, y, z),
  (pos) => canMove(
    {
      x: osetMap.getField("x"),
      y: osetMap.getField("y"),
      z: osetMap.getField("z"),
    },
    pos
  ),
  (pos) => {
    if (!canMove(
      {
        x: osetMap.getField("x"),
        y: osetMap.getField("y"),
        z: osetMap.getField("z"),
      },
      pos
    )) return false;
    osetMap.setField("x", pos.x);
    osetMap.setField("y", pos.y);
    osetMap.setField("z", pos.z);
    bitMap.setValue(bitMap.getValue(pos.x, pos.y, pos.z) == 0 ? 1 : 0, pos.x, pos.y, pos.z);

    let filled = 0;
    for (let x = 0; x < SIZE; x++)
      for (let y = 0; y < SIZE; y++)
        for (let z = 0; z < SIZE; z++) {
          if (bitMap.getValue(x, y, z) == 1) filled++;
        }

    if (filled == 27) {
      generateMap(bitMap, g16);
      osetMap.setField("seed", g16.seed);
      const solved = osetMap.getField("solved") + 1;
      osetMap.setField("solved", solved);
      cgui.updateSolved(solved);

      story(solved, storyRoute.all, storyCallback);
    }

    localStorage.setItem("save", bitMap.save.toString());
    cgui.updateSave(bitMap.save);

    return true;
  }
);


trickyUpdate = () => {
  story(osetMap.getField("solved"), storyRoute.all, storyCallback);
  render(
    osetMap.getField("x"),
    osetMap.getField("y"),
    osetMap.getField("z")
  );
  localStorage.setItem("save", bitMap.save.toString());
  cgui.updateSave(bitMap.save);
}

