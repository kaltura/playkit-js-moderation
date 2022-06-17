import {KalturaModerationFlag} from './kaltura-moderation-flag';
const {BaseServiceResult} = KalturaPlayer.providers.ResponseTypes;

export class KalturaModerationFlagResponse extends BaseServiceResult {
  data?: KalturaModerationFlag;

  constructor(responseObj: any) {
    super(responseObj);
    if (!this.hasError) {
      this.data = new KalturaModerationFlag(responseObj);
    }
  }
}
