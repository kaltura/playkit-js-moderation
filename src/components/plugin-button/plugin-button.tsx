import {h} from 'preact';
import {icons} from '../icons';
import {ui} from '@playkit-js/kaltura-player-js';
import { pluginName } from "../../index";

const {Tooltip, Icon} = KalturaPlayer.ui.components;
const {withText, Text} = KalturaPlayer.ui.preacti18n;

const translates = {
  label: <Text id="moderation.report_content">Report Content</Text>
};

interface PluginButtonProps {
  label?: string;
  setRef: (ref: HTMLButtonElement | null) => void;
}

export const PluginButton = withText(translates)(({label, setRef}: PluginButtonProps) => {
  return (
    <Tooltip label={label} type="bottom">
        <button type="button" aria-label={label} className={ui.style.upperBarIcon} data-testid="moderationPluginButton" ref={setRef}>
          <Icon
            id={pluginName}
            height={icons.BigSize}
            width={icons.BigSize}
            viewBox={`0 0 ${icons.BigSize} ${icons.BigSize}`}
            path={icons.PLUGIN_ICON}
          />
        </button>
    </Tooltip>
  );
});
