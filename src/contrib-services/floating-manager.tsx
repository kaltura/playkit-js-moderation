import {FloatingItem} from './floating-item';
import {
  FloatingItemData,
  FloatingItemProps,
  FloatingPositions,
} from './floating-item-data';
import {PresetManager, PresetManagerEventTypes} from './preset-manager';
import {ComponentChild, h} from 'preact';
import {PlayerSize, VideoSize} from './common-types';
import {getPlayerSize, getVideoSize} from './player-utils';
import {ManagedComponent} from './managed-component';
import {PresetsUtils} from './presets-utils';
import {getContribConfig} from './contrib-utils';

export interface FloatingManagerOptions {
  kalturaPlayer: KalturaPlayerTypes.Player;
  presetManager: PresetManager;
}

const defaultFloatingConfig: any = {
  presetAreasMapping: {
    Playback: {
      VideoArea: 'VideoArea',
      PresetArea: 'PresetArea',
      InteractiveArea: 'InteractiveArea',
    },
    Live: {
      VideoArea: 'VideoArea',
      PresetArea: 'PresetArea',
      InteractiveArea: 'InteractiveArea',
    },
  },
};

const acceptableTypes = ['VideoArea', 'PresetArea', 'InteractiveArea'];

export class FloatingManager {
  private _items: Record<FloatingPositions, FloatingItem[]> = {
    [FloatingPositions.VideoArea]: [],
    [FloatingPositions.InteractiveArea]: [],
    [FloatingPositions.PresetArea]: [],
  };
  private _componentRef: Record<FloatingPositions, ManagedComponent | null> = {
    [FloatingPositions.InteractiveArea]: null,
    [FloatingPositions.VideoArea]: null,
    [FloatingPositions.PresetArea]: null,
  };
  private _cache: {
    canvas: {
      playerSize: PlayerSize;
      videoSize: VideoSize;
    };
  } = {
    canvas: {
      playerSize: {width: 0, height: 0},
      videoSize: {width: 0, height: 0},
    },
  };

  private _floatingConfig: any;

  constructor(private _options: FloatingManagerOptions) {
    this._floatingConfig = getContribConfig(
      this._options.kalturaPlayer,
      'ui.floating',
      defaultFloatingConfig,
      {
        explicitMerge: ['presetAreasMapping'],
      }
    );

    const groupedPresets = PresetsUtils.groupPresetAreasByType({
      presetAreasMapping: this._floatingConfig.presetAreasMapping,
      acceptableTypes,
    });

    Object.keys(groupedPresets).forEach(presetType => {
      this._options.presetManager.add({
        label: 'floating-manager',
        presetAreas: groupedPresets[presetType],
        // @ts-ignore
        renderChild: () => this._renderChild(FloatingPositions[presetType]),
      });
    });
    this._addPlayerBindings();
    this._updateCachedCanvas();
  }

  /**
   * initialize new floating ui item
   * @param item
   */
  //TODO push new item to relevant position array according to its' FloatingPositions value
  add(data: FloatingItemData): FloatingItem | null {
    const {presetManager} = this._options;

    const itemOptions = {
      // @ts-ignore
      presetManager,
      ...this._options,
      data,
    };

    const item = new FloatingItem(itemOptions);
    this._items[data.position].push(item);
    return item;
  }

  remove(item: FloatingItem) {
    const positionItems = this._items[item.data.position];
    const itemIndex = positionItems.indexOf(item);
    if (itemIndex > -1) {
      positionItems[itemIndex].destroy();
      positionItems.splice(itemIndex, 1);
    } else {
      console.warn(`couldn't remove ${item} since it wasn't found`);
    }
  }

  reset(): void {
    const allItems = [
      ...this._items.VideoArea,
      ...this._items.InteractiveArea,
      ...this._items.PresetArea,
    ];
    allItems.forEach(item => {
      try {
        item.destroy();
      } catch (e) {
        // TODO log error
        console.warn(e);
      }
    });

    this._items.VideoArea = [];
    this._items.PresetArea = [];
    this._items.InteractiveArea = [];
  }

  private _getRendererProps(
    props: Partial<FloatingItemProps>
  ): FloatingItemProps {
    const {kalturaPlayer} = this._options;

    return {
      currentTime:
        typeof props.currentTime !== 'undefined'
          ? props.currentTime
          : kalturaPlayer.currentTime * 1000,
      canvas: this._cache.canvas,
    };
  }

  private _updateCachedCanvas() {
    this._cache.canvas = {
      playerSize: getPlayerSize(this._options.kalturaPlayer),
      videoSize: getVideoSize(this._options.kalturaPlayer),
    };
  }

  private _renderItems = (position: FloatingPositions) => {
    const props = this._getRendererProps({});
    return this._items[position].map(item => item.renderFloatingChild(props));
  };

  private _renderChild = (position: FloatingPositions): ComponentChild => {
    return (
      <ManagedComponent
        label={'floating-manager'}
        renderChildren={() => this._renderItems(position)}
        isShown={() => true}
        ref={(ref: any) => (this._componentRef[position] = ref)}
      />
    );
  };

  private _updateComponents() {
    if (this._componentRef.InteractiveArea) {
      this._componentRef.InteractiveArea.update();
    }

    if (this._componentRef.PresetArea) {
      this._componentRef.PresetArea.update();
    }

    if (this._componentRef.VideoArea) {
      this._componentRef.VideoArea.update();
    }
  }

  private _addPlayerBindings() {
    const {kalturaPlayer} = this._options;

    kalturaPlayer.addEventListener(kalturaPlayer.Event.TIME_UPDATE, () => {
      this._updateComponents();
    });

    kalturaPlayer.addEventListener(kalturaPlayer.Event.MEDIA_LOADED, () => {
      this._updateCachedCanvas();
      this._updateComponents();
    });

    kalturaPlayer.addEventListener(kalturaPlayer.Event.LOADED_DATA, () => {
      this._updateCachedCanvas();
      this._updateComponents();
    });

    this._options.presetManager.on(
      PresetManagerEventTypes.VideoResizeEvent,
      () => {
        this._updateCachedCanvas();
        this._updateComponents();
      }
    );

    this._options.presetManager.on(
      PresetManagerEventTypes.PresetResizeEvent,
      () => {
        this._updateCachedCanvas();
        this._updateComponents();
      }
    );
  }
}
