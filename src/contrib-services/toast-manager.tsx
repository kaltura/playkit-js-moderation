import {UUID} from './uuid';
import {FloatingManager} from './floating-manager';
import {FloatingPositions, FloatingUIModes} from './floating-item-data';
import {FloatingItem} from './floating-item';
import {ToastProps} from './toast/toast';
import {ToastsContainer} from './toasts-container';
import {h} from 'preact';

export interface ToastManagerOptions {
  floatingManager: FloatingManager;
}

export enum ToastSeverity {
  Info = 'Info',
  Success = 'Success',
  Warn = 'Warn',
  Error = 'Error'
}

export interface ToastItemData {
  title: string;
  text: string;
  icon: any;
  severity: ToastSeverity;
  duration: number;
  onClick: () => void;
}

interface ManagedToasts {
  timerSubscription: any;
  duration: number;
  toastProps: ToastProps;
}

export class ToastManager {
  private _options: ToastManagerOptions;
  private _toasts: ManagedToasts[] = [];
  private _floatingItem: FloatingItem | null = null;

  constructor(private options: ToastManagerOptions) {
    this._options = options;
  }

  add(data: ToastItemData): void {
    const {duration, ...props} = data;
    if (!this._floatingItem) this._addToastsContainer();
    const managedToast = {
      toastProps: {
        ...props,
        id: UUID.uuidV1(),
        onClose: this._remove
      },
      duration: duration,
      timerSubscription: null
    };
    this._toasts.push(managedToast);
    this._updateToastsUI();
    this._startDurationTimer(managedToast);
  }

  reset(): void {
    this._toasts.forEach(managedToast => {
      this._remove(managedToast.toastProps.id);
    });
  }

  private _startDurationTimer(managedToast: ManagedToasts): void {
    managedToast.timerSubscription = setTimeout(() => {
      this._remove(managedToast.toastProps.id);
    }, managedToast.duration);
  }

  private _remove = (id: string): void => {
    const index = this._findToastIndexById(id);
    if (index === -1) return;

    clearTimeout(this._toasts[index].timerSubscription);
    this._toasts.splice(index, 1);
    this._updateToastsUI();
    if (this._toasts.length === 0) this._removeToastsContainer();
  };

  private _addToastsContainer(): void {
    this._floatingItem = this._options.floatingManager.add({
      label: 'Toasts',
      mode: FloatingUIModes.Immediate,
      position: FloatingPositions.InteractiveArea,
      renderContent: () => {
        return (
          <ToastsContainer
            toasts={this._toasts.map(toast => {
              return toast.toastProps;
            })}
          />
        );
      }
    });
  }

  private _removeToastsContainer(): void {
    if (!this._floatingItem) return;

    this._options.floatingManager.remove(this._floatingItem);
    this._floatingItem = null;
  }

  private _updateToastsUI(): void {
    if (this._floatingItem) this._floatingItem.update();
  }

  private _findToastIndexById(id: string): number {
    let index = 0;
    while (index < this._toasts.length) {
      if (this._toasts[index].toastProps.id === id) {
        return index;
      }
      index++;
    }
    return -1;
  }
}
