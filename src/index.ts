import {ModerationPlugin} from './moderation-plugin';

declare var __VERSION__: string;
declare var __NAME__: string;

const VERSION = __VERSION__;
const NAME = __NAME__;

export {ModerationPlugin as Plugin};
export {VERSION, NAME};

const pluginName: string = 'playkit-js-moderation';

KalturaPlayer.core.registerPlugin(pluginName, ModerationPlugin);
