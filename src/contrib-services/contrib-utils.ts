import {KalturaPlayerUtils} from './kaltura-player-utils';

export function getContribConfig<T>(
  player: KalturaPlayerTypes.Player,
  path: string,
  baseConfig: T,
  options?: {explicitMerge: string[]}
): T {
  return KalturaPlayerUtils.getPlayerConfig(
    player,
    `contrib.${path}`,
    baseConfig,
    // @ts-ignore
    options
  );
}
