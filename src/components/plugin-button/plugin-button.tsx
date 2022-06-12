import {h} from 'preact';
import * as styles from './plugin-button.scss';

export const PluginButton = ({toggleOverlay}: {toggleOverlay:(event?: MouseEvent) => void}) => (
  <button type="button" className={styles.moderationIcon} tabIndex={1} onClick={(event) => toggleOverlay(event)} />
);
