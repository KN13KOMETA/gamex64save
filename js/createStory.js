import GUI from "./lil-gui.esm.js"
/**
 * @param {GUI} lilGui
 */
export const createStory = (lilGui) => {
  const act = {
    silent: "* Stay Silent *"
  }
  const folder = lilGui.addFolder("Story");
  const div = document.getElementsByClassName("overlay")[0];
  const data = {
    "!!empty": "",
    [act.silent]: () => { }
  }

  const gui = {
    div: {
      get value() {
        return div.innerHTML;
      },
      set value(v) {
        return div.innerHTML = v;
      },
      hide: () => div.classList.add("overlay-hidden"),
      show: () => div.classList.remove("overlay-hidden")
    },
    "!!empty": folder.add(data, "!!empty"),
    [act.silent]: folder.add(data, act.silent)
  }


  /**
   * @param {number[]} route
   */
  return (solved, route, setRoute = () => { }) => {
    for (const element of Object.values(gui)) element.hide();
    switch (solved) {
      case 1: {
        const closeCb = () => {
          gui.Yes.hide();
          gui.No.hide();
          data[act.silent] = () => {
            gui.div.hide();
            gui[act.silent].hide();
          }
        }
        const cb = () => {
          route[0] = 1;
          gui.div.value = "Nice. Just continue \"playing\", I will contact with you later.";
          setRoute(route);

          closeCb();
        }
        data.Yes = () => cb();
        data.No = () => cb();
        data[act.silent] = () => {
          route[0] = 0;
          gui.div.value = "Oh crap. I was sure this one works. Hm, maybe this...";
          setRoute(route);

          closeCb();
        }

        gui.Yes = folder.add(data, "Yes");
        gui.No = folder.add(data, "No");
        gui[act.silent] = folder.add(data, act.silent);

        gui.div.show();
        gui.div.value = "Hello? Is this thing even working?";

        break;
      }
    }
  }
}
