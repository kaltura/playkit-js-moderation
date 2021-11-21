// @flow
import {KalturaPlayer, BasePlugin} from 'kaltura-player-js';
import {Moderation as ModerationComponent} from './components/moderation/moderation';
import {KalturaClient} from 'kaltura-typescript-client';
import {ContribServices} from '@playkit-js-contrib/plugin';

const pluginName: string = 'moderation';
/**
 * The Moderation plugin.
 * @class Moderation
 * @param {string} name - The plugin name.
 * @param {Object} config - The plugin config.
 * @extends BasePlugin
 */
class Moderation extends BasePlugin {
  _contribServices: ContribServices;
  _kalturaClient: KalturaClient;
  /**
   * The default configuration of the plugin.
   * @type {Object}
   * @static
   * @memberof Share
   */
  static defaultConfig: ModerationConfig = {
    reportLength: 500,
    onReportSentMessage: 'Send report',
    onReportErrorMessage: 'The report failed to send',
    subtitle: '',
    notificationDuration: 5000,
    tooltipMessage: 'Send report',
    moderateOptions: [
      {id: 1, label: 'Sexual Content'},
      {id: 2, label: 'Violent Or Repulsive'},
      {id: 3, label: 'Harmful Or Dangerous Act'},
      {id: 4, label: 'Spam / Commercials'}
    ]
  };

  constructor(name: string, player: KalturaPlayer, config: Object) {
    super(name, player, config);
    this._kalturaClient = new KalturaClient();
    this._kalturaClient.setOptions({clientTag: 'playkit-js-transcript', endpointUrl: this.player.config.provider.env.serviceUrl});
    this._contribServices = ContribServices.get({kalturaPlayer: player});
    this._registerListeners();
  }

  getUIComponents() {
    return [
      {
        label: 'moderationButtonComponent',
        presets: ['Playback', 'Live'],
        area: 'TopBarRightControls',
        get: ModerationComponent,
        props: {
          config: this.config,
          kalturaClient: this._kalturaClient,
          contribServices: this._contribServices
        }
      }
    ];
  }

  /**
   * Whether the Moderation plugin is valid.
   * @static
   * @override
   * @public
   * @memberof Moderation
   */
  static isValid() {
    return true;
  }

  _registerListeners(): void {
    this.eventManager.listen(this.player, this.player.Event.MEDIA_LOADED, this._onMediaLoaded);
  }

  _onMediaLoaded(): void {
    this._kalturaClient.setDefaultRequestOptions({
      ks: this.player.config.session.ks
    });
  }

  /**
   * Destroys the plugin.
   * @override
   * @public
   * @returns {void}
   */
  destroy(): void {
    this.reset();
    this.eventManager.destroy();
  }
}

export {Moderation, pluginName};
