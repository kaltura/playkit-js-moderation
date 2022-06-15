import {h, render} from 'preact';
import {PresetItemData, RelativeToTypes} from './preset-item-data';
import {ManagedComponent} from './managed-component';
import {InjectedComponent} from './injected-component';
export interface PresetItemOptions {
  kalturaPlayer: KalturaPlayerTypes.Player;
  data: PresetItemData;
}

export interface PresetItemProps {}

export interface KalturaPlayerPresetComponent {
  label: string;
  presets: string[];
  container: string;
  get: () => () => ManagedComponent;
  afterComponent?: string;
  beforeComponent?: string;
  replaceComponent?: string;
}

export class PresetItem {
  private _options: PresetItemOptions;

  constructor(options: PresetItemOptions) {
    this._options = options;
  }

  get playerConfig(): KalturaPlayerPresetComponent[] {
    const configs: KalturaPlayerPresetComponent[] = [];

    for (const presetType in this._options.data.presetAreas) {
      const presetContainer = this._options.data.presetAreas[presetType];
      const {relativeTo} = this._options.data;

      if (!presetContainer) {
        continue;
      }

      const result: KalturaPlayerPresetComponent = {
        label: this._options.data.label,
        presets: [presetType],
        container: presetContainer,
        get: this._render,
      };

      if (relativeTo) {
        switch (relativeTo.type) {
          case RelativeToTypes.After:
            result['afterComponent'] = relativeTo.name;
            break;
          case RelativeToTypes.Before:
            result['beforeComponent'] = relativeTo.name;
            break;
          case RelativeToTypes.Replace:
            result['replaceComponent'] = relativeTo.name;
            break;
        }
      }

      configs.push(result);
    }

    return configs;
  }

  private _render = (): any => {
    if (this._options.data.isolateComponent) {
      const {
        data: {label, fillContainer},
      } = this._options;

      return (
        <InjectedComponent
          label={label}
          fillContainer={fillContainer || false}
          onCreate={this._onCreate}
          onDestroy={this._onDestroy}
        />
      );
    }

    return this._options.data.renderChild();
  };

  private _onDestroy = (options: {
    context?: any;
    parent: HTMLElement;
  }): void => {
    // TODO sakal handle destroy
    if (!options.parent) {
      return;
    }

    render(null, options.parent);
  };

  private _onCreate = (options: {context?: any; parent: HTMLElement}): void => {
    try {
      if (!options.parent) {
        return;
      }
      const child = this._options.data.renderChild();

      if (!child) {
        return;
      }

      render(child, options.parent);
    } catch (error) {
    }
  };
}
