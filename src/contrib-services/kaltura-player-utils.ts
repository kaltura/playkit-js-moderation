import {ObjectUtils} from './object-utils';

export class KalturaPlayerUtils {
  static getPlayerConfig<T>(
    player: any,
    configPath: string,
    baseConfig: T,
    options: {explicitMerge: string[]}
  ): T {
    const playerContribConfig = ObjectUtils.get(player.config, configPath, {});

    return ObjectUtils.mergeDefaults<T>(
      playerContribConfig as any,
      baseConfig,
      options
    );
  }
}
