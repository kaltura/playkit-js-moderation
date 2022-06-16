import {h} from 'preact';
import {PresetItemData} from './preset-item-data';
import {KalturaPlayerPresetComponent, PresetItem} from './preset-item';
import {EventsManager} from './events-manager';
import {UIPlayerAdapter} from './ui-player-adapter';
import {PresetsUtils} from './presets-utils';
import {getContribConfig} from './contrib-utils';

export interface PresetManagerOptions {
  kalturaPlayer: KalturaPlayerTypes.Player;
}

export enum PresetManagerEventTypes {
  PresetResizeEvent = 'PresetResizeEvent',
  VideoResizeEvent = 'VideoResizeEvent',
}

export interface PresetResizeEvent {
  type: PresetManagerEventTypes.PresetResizeEvent;
}

export interface VideoResizeEvent {
  type: PresetManagerEventTypes.VideoResizeEvent;
}

export type PresetManagerEvents = PresetResizeEvent | VideoResizeEvent;

const acceptableTypes = ['PlayerArea'];

const defaultPresetConfig: any = {
  presetAreasMapping: {
    Playback: {
      PlayerArea: 'PlayerArea',
    },
    Live: {
      PlayerArea: 'PlayerArea',
    },
  },
};

export class PresetManager {
  private _events: EventsManager<PresetManagerEvents> = new EventsManager<
    PresetManagerEvents
  >();
  private _isLocked = false;
  private _options: PresetManagerOptions;
  private _items: PresetItem[] = [];
  private _pendingItems: PresetItem[] = [];
  private _presetConfig: any;

  constructor(options: PresetManagerOptions) {
    this._options = options;

    this._presetConfig = getContribConfig(
      this._options.kalturaPlayer,
      'ui.preset',
      defaultPresetConfig,
      {
        explicitMerge: ['presetAreasMapping'],
      }
    );

    const groupedPresets = PresetsUtils.groupPresetAreasByType({
      presetAreasMapping: this._presetConfig.presetAreasMapping,
      acceptableTypes,
    });

    this.add({
      label: 'preset-manager',
      presetAreas: groupedPresets['PlayerArea'],
      renderChild: () => (
        <UIPlayerAdapter
          onMount={this._registerToPlayer}
          onUnmount={this._unregisterToPlayer}
        />
      ),
    });
  }

  private _registerToPlayer = (player: KalturaPlayerTypes.Player) => {
    player.addEventListener(
      KalturaPlayer.ui.EventType.UI_PRESET_RESIZE,
      this._notifyUIPresetResize
    );

    player.addEventListener(
      KalturaPlayer.ui.EventType.VIDEO_RESIZE,
      this._notifyVideoResize
    );
  };

  private _notifyVideoResize = () => {
    this._events.emit({
      type: PresetManagerEventTypes.VideoResizeEvent,
    });
  };

  private _notifyUIPresetResize = () => {
    this._events.emit({
      type: PresetManagerEventTypes.PresetResizeEvent,
    });
  };

  private _unregisterToPlayer = (player: KalturaPlayerTypes.Player) => {

    player.removeEventListener(
      KalturaPlayer.ui.EventType.UI_PRESET_RESIZE,
      this._notifyUIPresetResize
    );

    player.removeEventListener(
      KalturaPlayer.ui.EventType.VIDEO_RESIZE,
      this._notifyVideoResize
    );
  };

  on: EventsManager<PresetManagerEvents>['on'] = this._events.on.bind(
    this._events
  );
  off: EventsManager<PresetManagerEvents>['off'] = this._events.off.bind(
    this._events
  );

  add<TProps>(data: PresetItemData): void {
    if (this._isLocked) {
      console.warn(
        `cannot add new preset items once player completed its' setup phase`
      );
      // @ts-ignore
      return null;
    }
    const component = new PresetItem({
      kalturaPlayer: this._options.kalturaPlayer,
      data,
    });

    this._pendingItems.push(component);
  }

  lockManager(): void {
    this._isLocked = true;
  }

  registerComponents(): KalturaPlayerPresetComponent[] {
    let configs: KalturaPlayerPresetComponent[] = [];
    this._pendingItems.forEach(item => {
      configs = [...configs, ...item.playerConfig];
    });
    this._items = [...this._items, ...this._pendingItems];
    this._pendingItems = [];
    return configs.filter(Boolean) as KalturaPlayerPresetComponent[];
  }
}
