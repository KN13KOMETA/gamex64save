import GUI from "./lil-gui.esm.js"
/**
 * @param {GUI} lilGui
 */
export const createStory = (lilGui) => {
  const act = {
    silent: "* Stay Silent *",
    yes: "Yes",
    no: "No"
  }
  const folder = lilGui.addFolder("Story");
  const div = document.getElementsByClassName("overlay")[0];
  const data = {
    get text() { return div.innerHTML; },
    set text(v) { return div.innerHTML = v; },
    act0: () => { },
    act1: () => { },
    act2: () => { },
    act3: () => { },
  }

  const gui = {
    text: {
      hide: () => div.classList.add("overlay-hidden"),
      show: () => div.classList.remove("overlay-hidden")
    },
    act0: folder.add(data, "act0"),
    act1: folder.add(data, "act1"),
    act2: folder.add(data, "act2"),
    act3: folder.add(data, "act3"),
  }


  const closeGui = () => {
    for (const key of Object.keys(gui)) gui[key].hide();
    gui.text.show();

    data.act3 = () => {
      gui.text.hide();
      gui.act3.hide();
    }

    gui.act3.name(act.silent).show();
  }

  /**
   * @param {number[]} route
   */
  return (solved, route, setRoute = () => { }) => {
    for (const element of Object.values(gui)) element.hide();

    switch (solved) {
      case 0: {
        data.text = `Tutorial 1.
Your goal is to turn all red spheres into green.
When you step on a sphere, its color switches.
You can only step 1 sphere in any direction except diagonals.
Now click "* Stay Silent *" button.`;

        gui.text.show();
        closeGui();
        break;
      }
      case 1: {
        data.text = `Tutorial 2.
Nice work, you completed your first level.
You probably wonder why game have such strange name.
It's because all your data stored in 1 (64 bit) number.
Your map, solved levels, seed and even story progress.`;

        gui.text.show();
        closeGui();
        break;
      }
      case 2: {
        data.text = `Tutorial 3.
You may not noticed, but your progress saving local automatically.
Try reloading page, is's safe I swear.
Also if you want, you can always reset your progress.`;

        gui.text.show();
        closeGui();
        break;
      }
      case 3: {
        data.text = `Tutorial 4.
But what if you want to load your save from another device.
In that case copy "Current Save Value".
Type it into "Load Save Value".
Press "Load Save" button.
`;

        gui.text.show();
        closeGui();
        break;
      }
      case 4: {
        data.text = `Tutorial 5.
At this point you know everything about game.
You can continue playing game, but nothing new will happen.
So this is end of tutorial.`;

        gui.text.show();
        closeGui();
        break;
      }
      case 7: {
        const cb = () => {
          route[0] = 1;
          data.text = "Nice. Just continue \"playing\", I will contact with you later.";
          setRoute(route);

          closeGui();
        }

        data.act0 = () => cb();
        data.act1 = () => cb();
        data.act3 = () => {
          route[0] = 0;
          data.text = "I was sure this one works. Hm, maybe try...";
          setRoute(route);

          closeGui();
        }

        data.text = "Hello? Is this thing even working?";

        gui.text.show();
        gui.act0.name(act.yes).show();
        gui.act1.name(act.no).show();
        gui.act3.name(act.silent).show();

        break;
      }
      case 8: {
        data.text = `DEV MESSAGE
Currently this is end, now there is really nothing new. Wait for updates.
`;

        gui.text.show();
        closeGui();
        break;
      }
    }
  }
}
