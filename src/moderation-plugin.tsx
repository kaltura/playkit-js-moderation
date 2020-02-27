import { h } from "preact";
import {
  ContribPluginManager,
  CorePlugin,
  OnMediaLoad,
  OnMediaUnload,
  OnPluginSetup,

  ContribServices,
  ContribPluginData,
  ContribPluginConfigs
} from "@playkit-js-contrib/plugin";
import { getContribLogger } from "@playkit-js-contrib/common";
import * as classes from './moderation-plugin.scss';

const pluginName = `moderation`;

const logger = getContribLogger({
  class: "ModerationPlugin",
  module: "moderation-plugin"
});

interface ModerationPluginConfig {
}

export class ModerationPlugin implements OnMediaLoad, OnMediaUnload, OnPluginSetup, OnMediaUnload {

  constructor(
    private _corePlugin: CorePlugin,
    private _contribServices: ContribServices,
    private _configs: ContribPluginConfigs<ModerationPluginConfig>
  ) {
  }

  onPluginSetup(): void {
  }

  onMediaLoad(): void {
  }

  onMediaUnload(): void {
  }

  onPluginDestroy(): void {
  }
}

ContribPluginManager.registerPlugin(
  pluginName,
  (data: ContribPluginData<ModerationPluginConfig>) => {
    return new ModerationPlugin(data.corePlugin, data.contribServices, data.configs);
  },
  {
    defaultConfig: {
    }
  }
);
