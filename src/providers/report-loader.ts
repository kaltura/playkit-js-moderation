import ILoader = KalturaPlayerTypes.ILoader;
import {KalturaModerationFlag, KalturaModerationFlagType, ObjectType, KalturaModerationFlagResponse} from './response-types';
const {RequestBuilder} = KalturaPlayer.providers;

interface ReportLoaderParams {
  comments: string;
  flagType: KalturaModerationFlagType;
  flaggedEntryId: string;
}

interface ReportResponse {
  moderationFlag?: KalturaModerationFlag;
}

export class ReportLoader implements ILoader {
  _comments: string;
  _flagType: KalturaModerationFlagType;
  _flaggedEntryId: string;
  _requests: typeof RequestBuilder[] = [];
  _response: ReportResponse = {};

  static get id(): string {
    return 'report';
  }

  constructor({comments, flagType, flaggedEntryId}: ReportLoaderParams) {
    this._comments = comments;
    this._flagType = flagType;
    this._flaggedEntryId = flaggedEntryId;

    const headers: Map<string, string> = new Map();

    const moderationFlagRequest = new RequestBuilder(headers);
    moderationFlagRequest.service = 'baseentry';
    moderationFlagRequest.action = 'flag';
    moderationFlagRequest.params = {
      moderationFlag: {
        comments: this._comments,
        flagType: this._flagType,
        flaggedEntryId: this._flaggedEntryId,
        objectType: ObjectType.KalturaModerationFlag
      }
    };
    this.requests.push(moderationFlagRequest);
  }

  set requests(requests: any[]) {
    this._requests = requests;
  }

  get requests(): any[] {
    return this._requests;
  }

  set response(response: any) {
    const moderationFlagRequestResponse = new KalturaModerationFlagResponse(response[0]?.data);
    if (moderationFlagRequestResponse) {
      this._response.moderationFlag = moderationFlagRequestResponse?.data;
    }
  }

  get response(): any {
    return this._response;
  }

  isValid(): boolean {
    return Boolean(this._flagType && this._flaggedEntryId);
  }
}
