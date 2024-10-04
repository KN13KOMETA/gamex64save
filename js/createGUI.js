import GUI from "./lil-gui.esm.js"

export const createGUI = (setNewSaveNumber = (n) => { }) => {
  const gui = new GUI();

  const control = {
    currentSave: 0,
    loadSave: 0,
    solved: 0,
    load: () => {
      const loadSave = gui.children.find(v => v.property == "loadSave");
      const test = (~~(Math.random() * 0xffff)).toString(16);
      if (
        test != prompt(`If you sure you want load from number "${loadSave.getValue()}", then type "${test}"`).toLowerCase()
      ) return;
      setNewSaveNumber(loadSave.object.loadSave);
      loadSave.setValue(0);
    },
    openSourceCode: () => window.open("https://github.com/ClintFlames/gamex64save", "_blank").focus(),
    help: () => {
      alert("This game is stores all your data in one number. Just simply copy save number. And on next open type your number and press load.");
    }
  }

  gui.title("Game");
  const solved = gui.add(control, "solved")
    .name("Solved Levels")
    .disable();
  const currentSave = gui.add(control, "currentSave")
    .name("Current Save Value");
  const loadSave = gui.add(control, "loadSave")
    .name("Load Save Value");
  gui.add(control, "load")
    .name("Load Save");
  gui.add(control, "openSourceCode")
    .name("View Source Code");
  gui.add(control, "help").name("Help");


  return {
    updateSave: (n) => currentSave.setValue(n),
    updateSolved: (n) => solved.setValue(n),
    gui
  }
}
