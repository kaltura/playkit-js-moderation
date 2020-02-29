import {h, Component} from 'preact';
import * as styles from './moderation.scss';
import {getContribLogger} from '@playkit-js-contrib/common';
import {CloseButton} from '../close-button';

export interface ModerationProps {
  onClick: () => void;
}

const logger = getContribLogger({
  class: 'Info',
  module: 'info-plugin',
});

export class Moderation extends Component<ModerationProps> {
  componentDidMount(): void {
    logger.trace('Moderation plugin mount', {
      method: 'componentDidMount',
    });
  }

  render(props: ModerationProps) {
    const {onClick} = props;
    return (
      <div className={[styles.root, 'kaltura-moderation__root'].join(' ')}>
        <CloseButton onClick={onClick} />
      </div>
    );
  }
}
