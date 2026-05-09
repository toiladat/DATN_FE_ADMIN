import { config } from '@tamagui/config/v3';

type Conf = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends Conf {}
}
