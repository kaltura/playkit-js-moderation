export enum ObjectType {
  KalturaModerationFlag = 'KalturaModerationFlag'
}

export enum KalturaModerationFlagType {
  SEXUAL_CONTENT = 1,
  VIOLENT_REPULSIVE = 2,
  HARMFUL_DANGEROUS = 3,
  SPAM_COMMERCIALS = 4,
  COPYRIGHT = 5,
  TERMS_OF_USE_VIOLATION = 6
}

enum KalturaModerationObjectType {
  ENTRY = 2,
  USER = 3
}

enum KalturaModerationFlagStatus {
  PENDING = 1,
  MODERATED = 2
}

export interface KalturaModerationFlagArgs {
  comments: string;
  objectType: ObjectType;
  createdAt: number;
  updatedAt: number;
  flagType: KalturaModerationFlagType;
  flaggedEntryId: string;
  id: number;
  moderationObjectType: KalturaModerationObjectType;
  partnerId: number;
  status: KalturaModerationFlagStatus;
}

export class KalturaModerationFlag {
  comments: string;
  objectType: ObjectType;
  id: number;
  status: KalturaModerationFlagStatus;
  flagType: KalturaModerationFlagType;

  constructor(moderationFlag: KalturaModerationFlagArgs) {
    this.comments = moderationFlag.comments;
    this.objectType = moderationFlag.objectType;
    this.id = moderationFlag.id;
    this.status = moderationFlag.status;
    this.flagType = moderationFlag.flagType;
  }
}
