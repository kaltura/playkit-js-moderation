import {h} from 'preact';
import {icons} from '../icons';
import {ui} from '@playkit-js/kaltura-player-js';

const {Tooltip, Icon} = KalturaPlayer.ui.components;
const {withText, Text} = KalturaPlayer.ui.preacti18n;

const translates = {
  label: <Text id="moderation.report_content">Report Content</Text>
};

interface PluginButtonProps {
  label?: string;
}

export const PluginButton = withText(translates)(({label}: PluginButtonProps) => {
  return (
    <Tooltip label={label} type="bottom">
        <button aria-label={label} className={ui.style.upperBarIcon} data-testid="moderationPluginButton">
          <Icon
            id="moderation-plugin-button"
            height={icons.BigSize}
            width={icons.BigSize}
            viewBox={`0 0 ${icons.BigSize} ${icons.BigSize}`}
            path={icons.PLUGIN_ICON}
          />
        </button>
    </Tooltip>
  );
});
