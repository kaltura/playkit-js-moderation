import {ComponentChild, Ref} from 'preact';
import {PlayerSize, VideoSize} from './common-types';

export enum FloatingUIModes {
  MediaLoaded = 'MediaLoaded',
  OnDemand = 'OnDemand',
  Immediate = 'Immediate',
  FirstPlay = 'FirstPlay',
}

export enum FloatingPositions {
  VideoArea = 'VideoArea',
  PresetArea = 'PresetArea',
  InteractiveArea = 'InteractiveArea',
}

export interface FloatingItemData {
  label: string;
  mode: FloatingUIModes;
  renderContent: (floatingItemProps: FloatingItemProps) => ComponentChild;
  className?: string;
  position: FloatingPositions;
}

export interface FloatingItemProps {
  currentTime: number;
  canvas: {
    playerSize: PlayerSize;
    videoSize: VideoSize;
  };
}
