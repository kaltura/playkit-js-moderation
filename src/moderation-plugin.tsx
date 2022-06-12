import {h, ComponentChild} from 'preact';
import {
  ContribServices,
} from '@playkit-js-contrib/plugin';
import {
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
// import {ui} from 'kaltura-player-js';
// const {SidePanelModes, SidePanelPositions, ReservedPresetNames} = ui;

const reservedPresetNames = {
  Playback: 'Playback',
  Live: 'Live',
  Idle: 'Idle',
  Ads: 'Ads',
  Error: 'Error',
}

const reservedPresetAreas = {
  PresetFloating: 'PresetFloating',
  BottomBarLeftControls: 'BottomBarLeftControls',
  BottomBarRightControls: 'BottomBarRightControls',
  TopBarLeftControls: 'TopBarLeftControls',
  TopBarRightControls: 'TopBarRightControls',
  SidePanelTop: 'SidePanelTop',
  SidePanelLeft: 'SidePanelLeft',
  SidePanelRight: 'SidePanelRight',
  SidePanelBottom: 'SidePanelBottom',
  PresetArea: 'PresetArea',
  InteractiveArea: 'InteractiveArea',
  PlayerArea: 'PlayerArea',
  VideoArea: 'VideoArea',
};

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
  tooltipMessage: string;
}

export class ModerationPlugin  extends KalturaPlayer.core.BasePlugin {
  private _moderationOverlay = null;
  private _wasPlayed = false; // keep state of the player so we can resume if needed
  private _kalturaClient = new KalturaClient();
  private _removeActiveOverlay: null | Function = null;

  constructor(
    name: string,
    private _player: any,
    private _configs: ModerationPluginConfig,
    private _contribServices: ContribServices,
  ) {
    super(name, _player, _configs);
    console.log('player', _player)
  }

  onPluginSetup(): void {
    const {provider, session} = this._player;

    this._kalturaClient.setOptions({
      clientTag: 'playkit-js-transcript',
      endpointUrl: provider.env.serviceUrl,
    });

    this._kalturaClient.setDefaultRequestOptions({
      ks: session.ks,
    });
  }

  loadMedia(): void {
    logger.trace('Moderation plugin loaded', {
      method: 'loadMedia',
    });
 
    try {
      this.onPluginSetup();
    } catch {}
 
    this._addPluginIcon();
  }

  private _sentReport = (
    contentType: KalturaModerationFlagType,
    content: string,
    callback?: () => void
  ) => {
    const {onReportSentMessage, onReportErrorMessage} = this._configs;
    const { sources } = this._player;
    const request = new BaseEntryFlagAction({
      moderationFlag: new KalturaModerationFlag({
        flaggedEntryId: sources.id,
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
            <div className={[styles.toastIcon, styles.success].join(' ')} />
          ),
          severity: ToastSeverity.Success,
        });
        if (this._wasPlayed) {
          this._player.play();
        }
        if (callback) {
          callback();
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
          icon: <div className={[styles.toastIcon, styles.error].join(' ')} />,
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
    const { notificatonDuration } = this._configs;
    //display toast
    // this._contribServices.toastManager.add({
    //   title: 'Report Content',
    //   text: options.text,
    //   icon: options.icon,
    //   duration: notificatonDuration,
    //   severity: ToastSeverity.Success || ToastSeverity.Error,
    //   onClick: () => {
    //     logger.trace(`Moderation clicked on toast`, {
    //       method: '_displayToast',
    //     });
    //   },
    // });
  };

  private _toggleOverlay = (event?: MouseEvent) => {
    if (this._removeActiveOverlay !== null) {
      this._removeOverlay();

      if (this._wasPlayed) {
        this._player.play();
        this._wasPlayed = false;
      }

      return;
    }

    let closeButtonSelected = false;
    if (event && event.x === 0 && event.y === 0) {
      // triggered by keyboard
      closeButtonSelected = true;
    }
    const {reportLength, moderateOptions, subtitle, tooltipMessage} = this._configs;
    const isPlaying = !(this._player as any).paused;
    const _toggleOverlay = this._toggleOverlay;
    const _sentReport = this._sentReport;

    logger.trace(`Moderation toggle overlay player`, {
      method: '_toggleOverlay',
    });
  
    if (this._moderationOverlay) {
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

    this._setOverlay(
      this._player.ui.addComponent({
        label: 'moderation-overlay',
        area: reservedPresetAreas.PlayerArea,
        presets: [reservedPresetNames.Playback, reservedPresetNames.Live],
        get: () => (
          <Moderation
            onClick={_toggleOverlay}
            onSubmit={_sentReport}
            reportLength={reportLength}
            subtitle={subtitle}
            tooltipMessage={tooltipMessage}
            moderateOptions={moderateOptions}
            closeButtonSelected={closeButtonSelected}
          />)
        }),
    );
  };

  private _addPluginIcon(): void {
    const {} = this._configs;
    const _toggleOverlay = this._toggleOverlay;
    this._player.ui.addComponent({
      label: 'Moderation',
      presets: [reservedPresetNames.Playback, reservedPresetNames.Live],
      area: reservedPresetAreas.TopBarRightControls,
      get: () => <PluginButton toggleOverlay={_toggleOverlay}/>
    });
  }
  
  static isValid(): boolean {
    return true;
  }

  reset(): void {
    return;
  }

  destroy(): void {
    this._removeOverlay();
  }

  private _setOverlay = (fn: Function) => {
    this._removeOverlay();
    this._removeActiveOverlay = fn;
  };

  private _removeOverlay = () => {
    if (this._removeActiveOverlay) {
      this._removeActiveOverlay();
      this._removeActiveOverlay = null;
    }
  };
}
