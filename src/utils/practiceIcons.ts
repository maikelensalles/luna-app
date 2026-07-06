import type { ImageSourcePropType } from 'react-native';

const ICONS_BY_TITLE: Record<string, ImageSourcePropType> = {
  Respiração: require('../../assets/icons/icon-respiracao.png'),
  Alongamento: require('../../assets/icons/icon-alongamento.png'),
  Leitura: require('../../assets/icons/icon-leitura.png'),
  Caminhada: require('../../assets/icons/icon-caminhada.png'),
  Escrita: require('../../assets/icons/icon-escrita.png'),
  Yoga: require('../../assets/icons/icon-yoga.png'),
  Meditação: require('../../assets/images/luna-icon.png'),
};

export function getPracticeIcon(practice: { title: string }): ImageSourcePropType {
  return ICONS_BY_TITLE[practice.title] ?? require('../../assets/icons/icon-lotus.png');
}
