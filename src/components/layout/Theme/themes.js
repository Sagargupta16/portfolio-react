const generateTheme = (name, bgColor, bgVariant, primaryColor) => ({
  name,
  colors: {
    bg: bgColor,
    'bg-variant': bgVariant,
    primary: primaryColor,
    'primary-variant': `${primaryColor}80`, // 50% opacity
  },
});

const themes = [
  generateTheme('theme1', '#1f2125', '#2e3238', '#ff99cc'),
  generateTheme('theme2', '#1d1f21', '#2e3133', '#66ffcc'),
  generateTheme('theme3', '#1e1e26', '#2c2c33', '#ffcc66'),
  generateTheme('theme4', '#0d0d0d', '#1a1a1a', '#00ffcc'),
  generateTheme('theme5', '#0c0c15', '#1b1b2a', '#ff6600'),
  generateTheme('theme6', '#1f2125', '#2e3238', '#ff99cc'),
];

export default themes;
