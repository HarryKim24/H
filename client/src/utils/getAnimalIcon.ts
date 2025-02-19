const getAnimalIcon = (points: number): string => {
  if (points < 20) return "/animal-icon/rabbit.png";
  if (points < 50) return "/animal-icon/cat.png";
  if (points < 100) return "/animal-icon/fox.png";
  if (points < 200) return "/animal-icon/lama.png";
  if (points < 400) return "/animal-icon/rhino.png";
  if (points < 700) return "/animal-icon/buffalo.png";
  if (points < 1000) return "/animal-icon/crocodile.png";
  return "/animal-icon/lion.png";
};

export default getAnimalIcon;
