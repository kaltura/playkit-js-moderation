import {h, ComponentChild} from 'preact';
import {Moderation, ModerateOption} from './components/moderation';
import {PluginButton} from './components/plugin-button';
import * as styles from './moderation-plugin.scss';
import {ui} from '@playkit-js/kaltura-player-js';
import {icons} from './components/icons';
import {ContribServices, ToastSeverity} from '@playkit-js/common/dist/ui-common';
import {OnClickEvent} from '@playkit-js/common/dist/hoc/a11y-wrapper';
import {UpperBarManager} from '@playkit-js/ui-managers';
import {ReportLoader, KalturaModerationFlag} from './providers';
import {ErrorIcon} from './components/icons/error-icon';
import {SuccessIcon} from './components/icons/success-icon';
const {ReservedPresetAreas, ReservedPresetNames} = ui;

interface ModerationPluginConfig {
  reportLength: number;
  onReportSentMessage: string;
  onReportErrorMessage: string;
  notificatonDuration: number;
  moderateOptions: ModerateOption[];
  subtitle: string;
  tooltipMessage: string;
}

// @ts-ignore
export class ModerationPlugin extends KalturaPlayer.core.BasePlugin {
  static defaultConfig: ModerationPluginConfig = {
    reportLength: 500,
    onReportSentMessage: 'The report was sent successfully',
    onReportErrorMessage: 'The report failed to send',
    subtitle: '',
    notificatonDuration: 5000,
    tooltipMessage: 'Send report',
    moderateOptions: [
      {id: 1, label: 'Sexual Content'},
      {id: 2, label: 'Violent Or Repulsive'},
      {id: 3, label: 'Harmful Or Dangerous Act'},
      {id: 4, label: 'Spam / Commercials'}
    ]
  };

  private _moderationOverlay = null;
  private _wasPlayed = false; // keep state of the player so we can resume if needed
  private _removeActiveOverlay: null | Function = null;
  private _pluginIcon = -1;
  private _contribServices: ContribServices;

  constructor(name: string, private _player: KalturaPlayerTypes.Player, config: ModerationPluginConfig) {
    super(name, _player, config);
    this._contribServices = ContribServices.get({kalturaPlayer: _player});
  }

  get upperBarManager() {
    return this.player.getService('upperBarManager') as UpperBarManager | undefined;
  }

  loadMedia(): void {
    if (!this.upperBarManager) {
      this.logger.warn('upperBarManager service not registered');
      return;
    }
    this._addPluginIcon();
  }

  // TODO: remove once contribServices migrated to BasePlugin
  getUIComponents(): any[] {
    return this._contribServices.register();
  }

  private _sentReport = (contentType: number, content: string, callback?: () => void) => {
    const {onReportSentMessage, onReportErrorMessage} = this.config;
    const {sources} = this._player;
    return this._player.provider
      .doRequest([{loader: ReportLoader, params: {comments: content, flagType: contentType, flaggedEntryId: sources.id}}])
      .then((data: Map<string, any>) => {
        if (data && data.has(ReportLoader.id)) {
          const reportLoader = data.get(ReportLoader.id);
          const moderationFlag: KalturaModerationFlag = reportLoader?.response?.moderationFlag;
          if (moderationFlag) {
            this.logger.debug('Moderation plugin submit OK');
            this._toggleOverlay();
            this._displayToast({
              text: onReportSentMessage,
              icon: (
                <div className={styles.toastIcon}>
                  <SuccessIcon />
                </div>
              ),
              severity: ToastSeverity.Success
            });
            if (this._wasPlayed) {
              this._player.play();
            }
            if (callback) {
              callback();
            }
          }
        }
      })
      .catch((e: any) => {
        this.logger.warn(e);
        this._toggleOverlay();
        this._displayToast({
          text: onReportErrorMessage,
          icon: (
            <div className={styles.toastIcon}>
              <ErrorIcon />
            </div>
          ),
          severity: ToastSeverity.Error
        });
      });
  };

  private _displayToast = (options: {text: string; icon: ComponentChild; severity: ToastSeverity}): void => {
    const {notificatonDuration} = this.config;
    this._contribServices.toastManager.add({
      title: 'Report Content',
      text: options.text,
      icon: options.icon,
      duration: notificatonDuration,
      severity: options.severity,
      onClick: () => {
        this.logger.debug(`Moderation clicked on toast`, {
          method: '_displayToast'
        });
      }
    });
  };

  private _toggleOverlay = (event?: OnClickEvent, byKeyboard?: boolean) => {
    if (this._removeActiveOverlay !== null) {
      this._removeOverlay();

      if (this._wasPlayed) {
        this._player.play();
        this._wasPlayed = false;
      }
      return;
    }

    let closeButtonSelected = false;
    if (byKeyboard) {
      closeButtonSelected = true;
    }
    const {reportLength, moderateOptions, subtitle, tooltipMessage} = this.config;
    const isPlaying = !(this._player as any).paused;

    this.logger.debug(`Moderation toggle overlay player`, {
      method: '_toggleOverlay'
    });

    if (this._moderationOverlay) {
      this._moderationOverlay = null;
      if (this._wasPlayed) {
        this.logger.debug(`Moderation plugin paused player`, {
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

    this._removeActiveOverlay = this._player.ui.addComponent({
      label: 'moderation-overlay',
      area: ReservedPresetAreas.PlayerArea,
      presets: [ReservedPresetNames.Playback, ReservedPresetNames.Live],
      get: () => (
        <Moderation
          onClick={this._toggleOverlay}
          onSubmit={this._sentReport}
          reportLength={reportLength}
          subtitle={subtitle}
          tooltipMessage={tooltipMessage}
          moderateOptions={moderateOptions}
          closeButtonSelected={closeButtonSelected}
        />
      )
    });
  };

  private _addPluginIcon(): void {
    const {tooltipMessage} = this.config;
    if (this._pluginIcon > 0) {
      return;
    }
    this.player.ready().then(() => {
      this._pluginIcon = this.upperBarManager!.add({
        label: 'Moderation',
        component: () => <PluginButton onClick={this._toggleOverlay} label={tooltipMessage} />,
        svgIcon: {path: icons.PLUGIN_ICON, viewBox: `0 0 ${icons.BigSize} ${icons.BigSize}`},
        onClick: this._toggleOverlay
      }) as number;
    });
  }

  private _removeOverlay = () => {
    if (this._removeActiveOverlay) {
      this._removeActiveOverlay();
      this._removeActiveOverlay = null;
    }
  };

  static isValid(): boolean {
    return true;
  }

  reset(): void {
    this._removeOverlay();
    this._contribServices.reset();
  }

  destroy(): void {
    if (this._pluginIcon > 0) {
      this.upperBarManager!.remove(this._pluginIcon);
      this._pluginIcon = -1;
    }
  }
}
