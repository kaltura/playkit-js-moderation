// @flow
import {registerPlugin} from 'kaltura-player-js';
import {Moderation as Plugin, pluginName} from './moderation';
import {Moderation} from './components/moderation/moderation';
declare var __VERSION__: string;
declare var __NAME__: string;

const VERSION = __VERSION__;
const NAME = __NAME__;

export {VERSION, NAME};
export {Plugin};
export {Moderation};

registerPlugin(pluginName, Plugin);
