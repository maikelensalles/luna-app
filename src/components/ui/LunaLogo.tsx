import { Image } from 'react-native';

type LunaLogoProps = {
  size?: number;
};

export function LunaLogo({ size = 40 }: LunaLogoProps) {
  return (
    <Image
      source={require('../../../assets/images/luna-icon.png')}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}
