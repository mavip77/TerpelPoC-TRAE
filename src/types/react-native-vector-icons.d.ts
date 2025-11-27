declare module 'react-native-vector-icons/MaterialCommunityIcons' {
  import {ComponentType} from 'react';
  import {TextProps} from 'react-native';
  const MaterialCommunityIcons: ComponentType<
    {name: string; size?: number; color?: string} & TextProps
  >;
  export default MaterialCommunityIcons;
}
