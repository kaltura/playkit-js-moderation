import {h} from 'preact';
import {
  FloatingItemData,
  FloatingItemProps,
  FloatingUIModes,
} from './floating-item-data';
import {ManagedComponent} from './managed-component';

export interface FloatingItemOptions {
  kalturaPlayer: KalturaPlayerTypes.Player;
  data: FloatingItemData;
}

export class FloatingItem {
  private _destroyed = false;
  private _options: FloatingItemOptions;
  private _isShown = false;
  private _componentRef: ManagedComponent | null = null;

  constructor(options: FloatingItemOptions) {
    this._options = options;

    this._addPlayerBindings();
  }

  get data(): FloatingItemData {
    return this._options.data;
  }

  remove = (): void => {
    this._isShown = false;
    if (!this._componentRef) {
      return;
    }

    this._componentRef.update();
  };

  add = (): void => {
    this._isShown = true;
    if (!this._componentRef) {
      return;
    }

    this._componentRef.update();
  };

  public update() {
    if (!this._componentRef) {
      return;
    }

    this._componentRef.update();
  }

  /**
   * destory the ui item
   */
  destroy(): void {
    this._destroyed = true;
    this.remove();
  }

  renderFloatingChild(props: FloatingItemProps) {
    const {label} = this._options.data;

    return (
      <ManagedComponent
        label={label}
        renderChildren={() => this._options.data.renderContent(props)}
        isShown={() => this._isShown}
        ref={(ref: any) => (this._componentRef = ref)}
      />
    );
  }

  private _handleMediaLoaded = () => {
    const {kalturaPlayer} = this._options;
    kalturaPlayer.removeEventListener(
      kalturaPlayer.Event.MEDIA_LOADED,
      this._handleMediaLoaded
    );
    this.add();
  };

  private _handleFirstPlay = () => {
    const {kalturaPlayer} = this._options;
    kalturaPlayer.removeEventListener(
      kalturaPlayer.Event.FIRST_PLAY,
      this._handleFirstPlay
    );
    this.add();
  };

  private _addPlayerBindings() {
    const {kalturaPlayer, data} = this._options;

    if (data.mode === FloatingUIModes.MediaLoaded) {
      kalturaPlayer.addEventListener(
        kalturaPlayer.Event.MEDIA_LOADED,
        this._handleMediaLoaded
      );
    }

    if (data.mode === FloatingUIModes.FirstPlay) {
      kalturaPlayer.addEventListener(
        kalturaPlayer.Event.FIRST_PLAY,
        this._handleFirstPlay
      );
    }

    if (data.mode === FloatingUIModes.Immediate) {
      this.add();
    }
  }
}
