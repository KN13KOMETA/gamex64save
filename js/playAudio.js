export const playAudio = (path, volume) => {
  const audio = new Audio(path);
  audio.volume = volume;
  audio.play();
}
