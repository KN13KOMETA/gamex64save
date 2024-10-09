import GUI from "./lil-gui.esm.js"

export const createGUI = (setNewSaveNumber = (n) => { }) => {
  const gui = new GUI();
  gui.title("Game");
  const folder = gui.addFolder("Data");

  const dumbnessSafe = () => {
    const test = (~~(Math.random() * 9999)).toString().padStart(4, 0);
    if (test != prompt(`Are you sure? If yes type "${test}"`)) return true;
    return false;
  }

  const control = {
    currentSave: 0,
    loadSave: 0,
    solved: 0,
    load: () => {
      if (dumbnessSafe()) return;

      const loadSave = folder.children.find(v => v.property == "loadSave");
      setNewSaveNumber(loadSave.object.loadSave);
      loadSave.setValue(0);
    },
    reset: () => {
      if (dumbnessSafe()) return;

      localStorage.clear();
      location.reload();
    },
    openSourceCode: () => window.open("https://github.com/ClintFlames/gamex64save", "_blank").focus()
  }

  const solved = folder.add(control, "solved")
    .name("Solved Levels")
    .disable();
  const currentSave = folder.add(control, "currentSave")
    .name("Current Save Value");
  folder.add(control, "loadSave")
    .name("Load Save Value");
  folder.add(control, "load")
    .name("Load Save");
  folder.add(control, "reset")
    .name("Reset Progress");
  folder.add(control, "openSourceCode")
    .name("View Source Code");


  return {
    updateSave: (n) => currentSave.setValue(n),
    updateSolved: (n) => solved.setValue(n),
    gui: folder,
    mainGui: gui
  }
}
