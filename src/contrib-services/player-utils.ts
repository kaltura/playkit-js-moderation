import {PlayerSize, VideoSize} from './common-types';

export function getPlayerSize(
  kalturaPlayer: any
): PlayerSize {
  return kalturaPlayer ? kalturaPlayer.dimensions : {width: 0, height: 0};
}

export function getVideoSize(
  kalturaPlayer: any
): VideoSize {
  if (!kalturaPlayer) {
    return {width: 0, height: 0};
  }

  const videoTrack = kalturaPlayer.getActiveTracks().video;

  if (
    !videoTrack ||
    videoTrack.width === undefined ||
    videoTrack.height === undefined
  ) {
    // fallback - mainly for Safari
    if (kalturaPlayer.getVideoElement()) {
      return {
        width: kalturaPlayer.getVideoElement().videoWidth,
        height: kalturaPlayer.getVideoElement().videoHeight,
      };
    }
    return {width: 0, height: 0};
  }

  return {
    width: videoTrack.width,
    height: videoTrack.height,
  };
}
