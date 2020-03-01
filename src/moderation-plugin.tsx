import {h} from 'preact';
import {
  ContribPluginManager,
  CorePlugin,
  OnMediaLoad,
  OnMediaUnload,
  ContribServices,
  ContribPluginData,
  ContribPluginConfigs,
} from '@playkit-js-contrib/plugin';
import {
  UpperBarItem,
  OverlayItem,
  OverlayPositions,
} from '@playkit-js-contrib/ui';
import {getContribLogger, ObjectUtils} from '@playkit-js-contrib/common';
import {KalturaClient} from 'kaltura-typescript-client';
import {KalturaModerationFlagType} from 'kaltura-typescript-client/api/types/KalturaModerationFlagType';
import {KalturaModerationFlag} from 'kaltura-typescript-client/api/types/KalturaModerationFlag';
import * as classes from './moderation-plugin.scss';
import {Moderation} from './components/moderation';
import {PluginButton} from './components/plugin-button';


const pluginName = `moderation`;

const logger = getContribLogger({
  class: 'ModerationPlugin',
  module: 'moderation-plugin',
});

const {get} = ObjectUtils;

interface ModerationPluginConfig {
  reportLength: number;
}

export class ModerationPlugin
  implements OnMediaLoad, OnMediaUnload, OnMediaUnload {
  private _upperBarItem: UpperBarItem | null = null;
  private _moderationOverlay: OverlayItem | null = null;
  private _wasPlayed = false; // keep state of the player so we can resume if needed

  constructor(
    private _corePlugin: CorePlugin,
    private _contribServices: ContribServices,
    private _configs: ContribPluginConfigs<ModerationPluginConfig>,
    private _player: KalturaPlayerTypes.Player
  ) {
  }

  onMediaLoad(): void {
    logger.trace('Info plugin loaded', {
      method: 'onMediaLoad',
    });
    this._addPluginIcon();
  }

  onMediaUnload(): void {
    if (this._upperBarItem) {
      this._contribServices.upperBarManager.remove(this._upperBarItem);
      this._upperBarItem = null;
    }
    if (this._moderationOverlay) {
      this._toggleOverlay();
    }
  }

  private _toggleOverlay = () => {
    const { reportLength } = this._configs.pluginConfig;
    const isPlaying = !(this._player as any).paused;
    logger.trace(`Info toggle overlay player`, {
      method: '_toggleOverlay'
    });
    if (this._moderationOverlay) {
      this._contribServices.overlayManager.remove(this._moderationOverlay);
      this._moderationOverlay = null;
      if (this._wasPlayed) {
        logger.trace(`Info plugin paused player`, {
          method: '_toggleOverlay'
        });
        this._wasPlayed = false;
        this._player.play();
      }
      return;
    }
    if (isPlaying) {
      this._wasPlayed = true;
      this._player.pause();
    }

    const {playerConfig} = this._configs;

    this._moderationOverlay = this._contribServices.overlayManager.add({
      label: 'moderation-overlay',
      position: OverlayPositions.PlayerArea,
      renderContent: () => (
        <Moderation
          entryId={playerConfig.sources.id}
          endpoint={playerConfig.provider.env.serviceUrl}
          ks={(playerConfig as any).session.ks}
          onClick={this._toggleOverlay}
          reportLength={reportLength}
        />
      ),
    });
  };

  private _addPluginIcon(): void {
    const {} = this._configs.pluginConfig;
    this._upperBarItem = this._contribServices.upperBarManager.add({
      label: 'Moderation',
      onClick: this._toggleOverlay,
      renderItem: () => <PluginButton/>,
    });
  }
}

ContribPluginManager.registerPlugin(
  pluginName,
  (data: ContribPluginData<ModerationPluginConfig>) => {
    return new ModerationPlugin(
      data.corePlugin,
      data.contribServices,
      data.configs,
      data.player
    );
  },
  {
    defaultConfig: {
      reportLength: 500,
    },
  }
);
