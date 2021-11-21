// @flow
/**
 * @jsx h
 * @ignore
 */
import {ui} from 'kaltura-player-js';
const {preact} = ui;
const {h, Component, ComponentChild} = preact;
import styles from './popover-menu.scss';

declare type PopoverMenuItem = {
  label?: string,
  onMenuChosen?: Function,
  customRenderer?: (el: PopoverMenuItem) => ComponentChild
};

declare type PopoverMenuProps = {
  options: Array<PopoverMenuItem>,
  itemRenderer?: (el: PopoverMenuItem) => ComponentChild
};

/**
 * Popover menu renders list of options.
 *  options example:
 *   [
 *    {label: 'option_1', onMenuChosen: () => console.log('selected first')},
 *    {label: 'option_2', onMenuChosen: () => console.log('selected second')}
 *   ]
 * In case when 'itemRenderer' properdy hasn't provided - PopoverMenu renders
 * div with class "popover-menu-item" that contain label for the current option.
 * Default render of options can be changed by providing 'itemRenderer' - it should be
 * function that takes current option and returns valid 'preact' node.
 * If some option need to be rendered with a different method - specific render
 * method can be provided with 'customRenderer' property for the current option.
 *  option example with specific render method:
 *   { label: 'specific render', onMenuChosen: () => {}, customRenderer: el => (<span>{el.label}</span>)}
 */

export class PopoverMenu extends Component<PopoverMenuProps> {
  render(props: any) {
    return (
      <div className={styles.popoverMenu}>
        {props.options.map((el: PopoverMenuItem) => {
          if (el.customRenderer) {
            return el.customRenderer(el);
          }
          if (props.itemRenderer) {
            return props.itemRenderer(el);
          }
          return (
            // eslint-disable-next-line react/jsx-key
            <div className="popover-menu-item" onClick={() => el.onMenuChosen(el)}>
              {el.label}
            </div>
          );
        })}
      </div>
    );
  }
}
