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
import {getContribLogger} from '@playkit-js-contrib/common';
import {KalturaModerationFlagType} from 'kaltura-typescript-client/api/types/KalturaModerationFlagType';
import {BaseEntryFlagAction} from 'kaltura-typescript-client/api/types/BaseEntryFlagAction';
import {KalturaClient} from 'kaltura-typescript-client';
import {KalturaModerationFlag} from 'kaltura-typescript-client/api/types/KalturaModerationFlag';
import {Moderation, ModerateOption} from './components/moderation';
import {PluginButton} from './components/plugin-button';
import * as styles from './moderation-plugin.scss';

const pluginName = `playkit-js-moderation`;

const logger = getContribLogger({
  class: 'ModerationPlugin',
  module: 'moderation-plugin',
});

interface ModerationPluginConfig {
  reportLength: number;
  onReportSentMessage: string;
  onReportErrorMessage: string;
  notificatonDuration: number;
  moderateOptions: ModerateOption[];
  subtitle: string;
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
  ) {
  }

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
    logger.trace('Moderation plugin loaded', {
      method: 'onMediaLoad',
    });
    this._addPluginIcon();
  }

  onMediaUnload(): void {
    if (this._upperBarItem) {
      logger.trace('Moderation plugin remove plugin icon', {
        method: 'onMediaUnload',
      });
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
    const {
      playerConfig,
      pluginConfig: {onReportSentMessage, onReportErrorMessage},
    } = this._configs;
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
          text: onReportSentMessage,
          icon: (
            <div className={[styles.toastIcon, styles.success].join(' ')}/>
          ),
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
        this._toggleOverlay();
        this._displayToast({
          text: onReportErrorMessage,
          icon: <div className={[styles.toastIcon, styles.error].join(' ')}/>,
          severity: ToastSeverity.Error,
        });
      }
    );
  };

  private _displayToast = (options: {
    text: string;
    icon: ComponentChild;
    severity: ToastSeverity;
  }): void => {
    const {notificatonDuration} = this._configs.pluginConfig;
    //display toast
    this._contribServices.toastManager.add({
      title: 'Report Content',
      text: options.text,
      icon: options.icon,
      duration: notificatonDuration,
      severity: ToastSeverity.Success || ToastSeverity.Error,
      onClick: () => {
        logger.trace(`Moderation clicked on toast`, {
          method: '_displayToast',
        });
      },
    });
  };

  private _toggleOverlay = () => {
    const {reportLength, moderateOptions, subtitle} = this._configs.pluginConfig;
    const isPlaying = !(this._player as any).paused;
    logger.trace(`Moderation toggle overlay player`, {
      method: '_toggleOverlay',
    });
    if (this._moderationOverlay) {
      this._contribServices.overlayManager.remove(this._moderationOverlay);
      this._moderationOverlay = null;
      if (this._wasPlayed) {
        logger.trace(`Moderation plugin paused player`, {
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
          subtitle={subtitle}
          moderateOptions={moderateOptions}
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
      onReportSentMessage: 'Send report',
      onReportErrorMessage: 'The report failed to send',
      subtitle: '',
      notificatonDuration: 5000,
      moderateOptions: [
        {id: 1, label: 'Sexual Content'},
        {id: 2, label: 'Violent Or Repulsive'},
        {id: 3, label: 'Harmful Or Dangerous Act'},
        {id: 4, label: 'Spam / Commercials'},
      ],
    },
  }
);
