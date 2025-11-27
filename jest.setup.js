// eslint-disable-next-line no-undef
const J = jest;
J.mock('react-native/Libraries/Animated/Animated', () => {
  const ActualAnimated = J.requireActual(
    'react-native/Libraries/Animated/Animated',
  );
  class MockValue {
    constructor(initial) {
      this._val = initial;
    }
    setValue(v) {
      this._val = v;
    }
    __getValue() {
      return this._val;
    }
  }
  return {
    ...ActualAnimated,
    Value: MockValue,
    timing: (value, config) => {
      const start = cb => {
        if (value && typeof value.setValue === 'function') {
          value.setValue(config?.toValue ?? 1);
        }
        if (typeof cb === 'function') {
          cb();
        }
      };
      return {start};
    },
  };
});

J.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => ({
  getEnforcing: () => ({}),
  get: () => ({}),
}));

J.mock('react-native', () => {
  const React = require('react');
  const mk = name => props => React.createElement(name, props);
  const AnimatedView = React.forwardRef((props, ref) =>
    React.createElement('View', {...props, ref}),
  );
  const mkRef = name =>
    React.forwardRef((props, ref) =>
      React.createElement(name, {...props, ref}),
    );
  class MockValue {
    constructor(initial) {
      this._val = initial;
    }
    setValue(v) {
      this._val = v;
    }
    __getValue() {
      return this._val;
    }
  }
  const Animated = {
    Value: MockValue,
    timing: (value, config) => ({
      start: cb => {
        if (value?.setValue) value.setValue(config?.toValue ?? 1);
        cb && cb();
      },
    }),
    spring: (value, config) => ({
      start: cb => {
        if (value?.setValue) value.setValue(config?.toValue ?? 1);
        cb && cb();
      },
    }),
    sequence: () => ({
      start: cb => {
        cb && cb();
      },
    }),
    View: AnimatedView,
  };
  return {
    Animated,
    Dimensions: {get: () => ({width: 375, height: 667})},
    StyleSheet: {create: s => s, flatten: s => s},
    Text: mk('Text'),
    View: mk('View'),
    TouchableOpacity: mk('TouchableOpacity'),
    Pressable: mk('Pressable'),
    ActivityIndicator: mk('ActivityIndicator'),
    TextInput: mkRef('TextInput'),
    KeyboardAvoidingView: mk('KeyboardAvoidingView'),
    SafeAreaView: mk('SafeAreaView'),
    ScrollView: mk('ScrollView'),
    StatusBar: mk('StatusBar'),
    FlatList: mkRef('FlatList'),
    Platform: {OS: 'ios'},
    Keyboard: {dismiss: J.fn()},
    Alert: {alert: J.fn()},
    NativeModules: {RNKeychainManager: {}},
  };
});

J.mock('@react-native/virtualized-lists', () => ({
  VirtualizedList: 'VirtualizedList',
}));

J.mock('react-native-vector-icons/MaterialCommunityIcons', () => {
  const React = require('react');
  return props => React.createElement('MaterialCommunityIcons', props);
});
J.mock('react-native-screens', () => ({
  enableScreens: () => {},
}));

J.mock('react-native/Libraries/Utilities/PixelRatio', () => ({
  get: () => 2,
  roundToNearestPixel: n => n,
}));

J.mock('react-native/Libraries/StyleSheet/StyleSheet', () => ({
  create: s => s,
  flatten: s => s,
}));

J.mock('react-native-keychain', () => ({
  getGenericPassword: J.fn(async () => null),
  setGenericPassword: J.fn(async () => undefined),
}));

global.__DEV__ = true;
