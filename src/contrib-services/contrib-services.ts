import {PlayerContribRegistry} from './player-contrib-registry';
import {PresetManager} from './preset-manager';
import {ToastManager} from './toast-manager';
import {FloatingManager} from './floating-manager';

export interface ContribServicesOptions {
  kalturaPlayer: KalturaPlayerTypes.Player;
}

export function getPlayerContribRegistry(kalturaPlayer: KalturaPlayerTypes.Player): PlayerContribRegistry {
  return PlayerContribRegistry.get(kalturaPlayer);
}

export class ContribServices {
  static get(options: ContribServicesOptions): ContribServices {
    const playerContribRegistry = getPlayerContribRegistry(options.kalturaPlayer);
    return playerContribRegistry.register('ContribServices', () => {
      return new ContribServices(playerContribRegistry, options);
    });
  }

  private _toastManager: ToastManager;
  private _floatingManager: FloatingManager;
  private _presetManager: PresetManager;

  constructor(private _playerContribRegistry: PlayerContribRegistry, private _options: ContribServicesOptions) {
    const kalturaPlayer = this._options.kalturaPlayer;

    const presetManager = new PresetManager({
      kalturaPlayer
    });
    const floatingManager = new FloatingManager({
      kalturaPlayer,
      presetManager
    });
    const toastManager = new ToastManager({
      floatingManager
    });
    this._toastManager = toastManager;
    this._floatingManager = floatingManager;
    this._presetManager = presetManager;

    this._addListeners();

  }

  private _addListeners = (): void => {
    const kalturaPlayer = this._options.kalturaPlayer;
    kalturaPlayer.addEventListener(kalturaPlayer.Event.PLAYER_RESET, this.reset);
    kalturaPlayer.addEventListener(kalturaPlayer.Event.PLAYER_DESTROY, this._removeListeners);
  };

  private _removeListeners = (): void => {
    const kalturaPlayer = this._options.kalturaPlayer;
    kalturaPlayer.removeEventListener(kalturaPlayer.Event.PLAYER_RESET, this.reset);
    kalturaPlayer.removeEventListener(kalturaPlayer.Event.PLAYER_DESTROY, this._removeListeners);
  };

  public get presetManager(): PresetManager {
    return this._presetManager;
  }

  public get floatingManager(): FloatingManager {
    return this._floatingManager;
  }

  public get toastManager(): ToastManager {
    return this._toastManager;
  }

  reset = (): void => {
    this._toastManager.reset();
    this._floatingManager.reset();
  };

  public getPlayerKS(): string | null {
    const {session} = this._options.kalturaPlayer.config;
    return session && session.ks ? session.ks : null;
  }
}
