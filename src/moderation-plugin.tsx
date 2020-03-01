import {h, ComponentChild} from 'preact';
import {
  ContribPluginManager,
  CorePlugin,
  OnMediaLoad,
  OnMediaUnload,
  OnPluginSetup,
  ContribServices,
  ContribPluginData,
  ContribPluginConfigs,
} from '@playkit-js-contrib/plugin';
import {
  UpperBarItem,
  OverlayItem,
  OverlayPositions,
  ToastSeverity,
} from '@playkit-js-contrib/ui';
import {getContribLogger, ObjectUtils} from '@playkit-js-contrib/common';
import {
  BaseEntryFlagAction,
  KalturaModerationFlagType,
} from 'kaltura-typescript-client/api/types';
import {KalturaClient} from 'kaltura-typescript-client';
import {KalturaModerationFlag} from 'kaltura-typescript-client/api/types/KalturaModerationFlag';
import {Moderation} from './components/moderation';
import {PluginButton} from './components/plugin-button';

const pluginName = `moderation`;

const logger = getContribLogger({
  class: 'ModerationPlugin',
  module: 'moderation-plugin',
});

// const {get} = ObjectUtils;

interface ModerationPluginConfig {
  reportLength: number;
  onSentSuccessfulMessage: string;
}

export class ModerationPlugin
  implements OnMediaLoad, OnMediaUnload, OnPluginSetup, OnMediaUnload {
  private _upperBarItem: UpperBarItem | null = null;
  private _moderationOverlay: OverlayItem | null = null;
  private _wasPlayed = false; // keep state of the player so we can resume if needed
  private _kalturaClient = new KalturaClient();

  constructor(
    private _corePlugin: CorePlugin,
    private _contribServices: ContribServices,
    private _configs: ContribPluginConfigs<ModerationPluginConfig>,
    private _player: KalturaPlayerTypes.Player
  ) {}

  onPluginSetup(): void {
    const {playerConfig} = this._configs;

    this._kalturaClient.setOptions({
      clientTag: 'playkit-js-transcript',
      endpointUrl: playerConfig.provider.env.serviceUrl,
    });

    this._kalturaClient.setDefaultRequestOptions({
      ks: playerConfig.session.ks,
    });
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

  private _sentReport = (
    contentType: KalturaModerationFlagType,
    content: string
  ) => {
    const {playerConfig, pluginConfig: { onSentSuccessfulMessage }} = this._configs;
    const request = new BaseEntryFlagAction({
      moderationFlag: new KalturaModerationFlag({
        flaggedEntryId: playerConfig.sources.id,
        flagType: contentType,
        comments: content,
      }),
    });

    this._kalturaClient.request(request).then(
      () => {
        logger.trace('Moderation plugin submit OK', {
          method: 'handleSubmit',
        });
        this._toggleOverlay();
        this._displayToast({
          text: onSentSuccessfulMessage,
          icon: () => <span>icon</span>,
          severity: ToastSeverity.Success,
        });
        if (this._wasPlayed) {
          this._player.play();
        }
      },
      error => {
        logger.trace('Moderation plugin submit failed', {
          method: 'handleSubmit',
          data: error,
        });
      }
    );
  };

  private _displayToast = (options: {
    text: string;
    icon: ComponentChild;
    severity: ToastSeverity;
  }): void => {
    //display toast
    this._contribServices.toastManager.add({
      title: "Notifications",
      text: options.text,
      icon: options.icon,
      duration: 5000,
      severity: ToastSeverity.Success || ToastSeverity.Error,
      onClick: () => {},
    });
  };

  private _toggleOverlay = () => {
    const {reportLength} = this._configs.pluginConfig;
    const isPlaying = !(this._player as any).paused;
    logger.trace(`Info toggle overlay player`, {
      method: '_toggleOverlay',
    });
    if (this._moderationOverlay) {
      this._contribServices.overlayManager.remove(this._moderationOverlay);
      this._moderationOverlay = null;
      if (this._wasPlayed) {
        logger.trace(`Info plugin paused player`, {
          method: '_toggleOverlay',
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

    this._moderationOverlay = this._contribServices.overlayManager.add({
      label: 'moderation-overlay',
      position: OverlayPositions.PlayerArea,
      renderContent: () => (
        <Moderation
          onClick={this._toggleOverlay}
          onSubmit={this._sentReport}
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
      renderItem: () => <PluginButton />,
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
      onSentSuccessfulMessage: "Send report",
    },
  }
);
