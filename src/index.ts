import { ModerationPlugin, pluginName } from "./moderation-plugin";
import {registerPlugin} from '@playkit-js/kaltura-player-js';

declare var __VERSION__: string;
declare var __NAME__: string;

const VERSION = __VERSION__;
const NAME = __NAME__;

export {ModerationPlugin as Plugin};
export {VERSION, NAME};


registerPlugin(pluginName, ModerationPlugin as any);
