import { ModerationPlugin, pluginName } from "./moderation-plugin";

declare var __VERSION__: string;
declare var __NAME__: string;

const VERSION = __VERSION__;
const NAME = __NAME__;

export {ModerationPlugin as Plugin};
export {VERSION, NAME};


KalturaPlayer.core.registerPlugin(pluginName, ModerationPlugin);
