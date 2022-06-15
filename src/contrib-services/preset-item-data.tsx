import {ComponentChild} from 'preact';

export enum ReservedPresetNames {
  Playback = 'Playback',
  Live = 'Live',
}

export enum ReservedPresetAreas {
  'PresetFloating' = 'PresetFloating',
  'BottomBarLeftControls' = 'BottomBarLeftControls',
  'BottomBarRightControls' = 'BottomBarRightControls',
  'TopBarLeftControls' = 'TopBarLeftControls',
  'TopBarRightControls' = 'TopBarRightControls',
  'SidePanelTop' = 'SidePanelTop',
  'SidePanelLeft' = 'SidePanelLeft',
  'SidePanelRight' = 'SidePanelRight',
  'SidePanelBottom' = 'SidePanelBottom',
  'PresetArea' = 'PresetArea',
  'InteractiveArea' = 'InteractiveArea',
  'PlayerArea' = 'PlayerArea',
  'VideoArea' = 'VideoArea',
}

export enum RelativeToTypes {
  Before = 'Before',
  After = 'After',
  Replace = 'Replace',
}

export interface PresetItemData {
  label: string;
  fillContainer?: boolean;
  isolateComponent?: boolean;
  presetAreas: Record<
    ReservedPresetNames | string,
    ReservedPresetAreas | string
  >;
  renderChild: () => ComponentChild;
  relativeTo?: {
    type: RelativeToTypes;
    name: string;
  };
}
