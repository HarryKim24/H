const getAnimalIcon = (points: number) => {
  if (points < 20) return "../../public/animal-icon/rabbit.png";
  if (points < 50) return "../../public/animal-icon/cat.png";
  if (points < 100) return "../../public/animal-icon/fox.png";
  if (points < 200) return "../../public/animal-icon/lama.png";
  if (points < 400) return "../../public/animal-icon/rhino.png";
  if (points < 700) return "../../public/animal-icon/buffalo.png";
  if (points < 1000) return "../../public/animal-icon/crocodile.png";
  return "../../public/animal-icon/lion.png";
};

export default getAnimalIcon;