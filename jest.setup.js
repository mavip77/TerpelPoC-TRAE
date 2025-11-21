// eslint-disable-next-line no-undef
const J = jest;
J.mock('react-native/Libraries/Animated/Animated', () => {
  const ActualAnimated = J.requireActual('react-native/Libraries/Animated/Animated');
  return {
    ...ActualAnimated,
    timing: (value, config) => {
      const start = (cb) => {
        value.setValue(config.toValue ?? 1);
        if (typeof cb === 'function') {cb();}
      };
      return { start };
    },
  };
});