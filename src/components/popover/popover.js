// @flow
/**
 * @jsx h
 * @ignore
 */

import {ui} from 'kaltura-player-js';
const {preact, Utils} = ui;
const {h, Component, ComponentChild} = preact;
const {KeyMap} = Utils;

import styles from './popover.scss';

export const PopoverVerticalPositions = {
  Top: 'top',
  Bottom: 'bottom'
};
export const PopoverHorizontalPositions = {
  Left: 'left',
  Right: 'right'
};
export const PopoverTriggerMode = {
  Click: 'click',
  Hover: 'hover'
};

const CLOSE_ON_HOVER_DELAY = 500;

const defaultProps = {
  verticalPosition: PopoverVerticalPositions.Top,
  horizontalPosition: PopoverHorizontalPositions.Left,
  triggerMode: PopoverTriggerMode.Click,
  className: 'popover',
  closeOnEsc: true,
  closeOnClick: true
};

interface PopoverProps {
  onClose?: () => void;
  onOpen?: () => void;
  closeOnClick: boolean;
  closeOnEsc: boolean;
  verticalPosition: PopoverVerticalPositions;
  horizontalPosition: PopoverHorizontalPositions;
  className: string;
  triggerMode: PopoverTriggerMode;
  content: ComponentChild;
  children: ComponentChild;
}

interface PopoverState {
  open: boolean;
}

/**
 * Popover renders popup with a target.
 * Properties description:
 *   onOpen - function that will be executed when popover opens;
 *   onClose - function that will be executed when popover closes;
 *   closeOnClick - close the popover on mouse click;
 *   verticalPosition - vertical position of popover relative to target ("top" or "bottom"), default - "top";
 *   horizontalPosition - horizontal position of popover relative to target ("left" or "right"), default - "left";
 *   !!! known limitation of popover positions: if popover opens beyond the visible area of the player - the popover will be overlapped by player
 *   className - popover class, can be use for popover styling, default - 'popover';
 *   closeOnEsc - handle ESC keyboard pressed event and close popover, default - true;
 *   triggerMode - popover support 2 ways for opening: click (keyPress) and mouse hover ("click" or "hover"), default - "click";
 *   content - content of popover. Can be any valid Preact node, ex:
 *      <select>
 *          <option>Option 1</option>
 *          ...
 *          <option>Option n</option>
 *      </select>
 *   children - popover target. Can be any valid Preact node, ex:
 *      <button>
 *          <i className="icon" />
 *      </button>
 */

export class Popover extends Component<PopoverProps, PopoverState> {
  _closeTimeout: any = null;
  _controlElement = null;
  static defaultProps = {
    ...defaultProps
  };
  state = {
    open: false
  };

  componentWillUnmount() {
    this._removeListeners();
  }

  _clearTimeout = () => {
    clearTimeout(this._closeTimeout);
    this._closeTimeout = null;
  };

  _handleMouseEvent = (event: MouseEvent) => {
    if (!this._controlElement.contains(event.target) && this.props.closeOnClick) {
      this._closePopover();
    }
  };

  _handleKeyboardEvent = (event: KeyboardEvent) => {
    if (this._controlElement.contains(event.target) && event.keyCode === KeyMap.Enter) {
      // handle Enter key pressed on Target icon to prevent triggering of _closePopover twice
      return;
    }
    if ((this.props.closeOnEsc && event.keyCode === KeyMap.Esc) || event.keyCode === KeyMap.Enter) {
      // handle if ESC or Enter button presesd
      this._closePopover();
    }
  };

  _openPopover = () => {
    const {onOpen} = this.props;
    this._clearTimeout();
    this.setState({open: true}, () => {
      this._addListeners();
      if (onOpen) {
        onOpen();
      }
    });
  };

  _closePopover = () => {
    const {onClose} = this.props;
    this._clearTimeout();
    this.setState({open: false}, () => {
      this._removeListeners();
      if (onClose) {
        onClose();
      }
    });
  };

  _togglePopover = () => {
    if (this.state.open) {
      this._closePopover();
    } else {
      this._openPopover();
    }
  };
  _handleMouseEnter = () => {
    if (!this.state.open) {
      this._openPopover();
    }
  };
  _handleMouseLeave = () => {
    this._closeTimeout = setTimeout(this._closePopover, CLOSE_ON_HOVER_DELAY);
  };
  _handleHoverOnPopover = () => {
    if (this.state.open && this._closeTimeout) {
      this._clearTimeout();
    } else {
      this._closePopover();
    }
  };
  _addListeners = () => {
    document.addEventListener('click', this._handleMouseEvent);
    document.addEventListener('keydown', this._handleKeyboardEvent);
  };
  _removeListeners = () => {
    document.removeEventListener('click', this._handleMouseEvent);
    document.removeEventListener('keydown', this._handleKeyboardEvent);
  };
  _getHoverEvents = () => {
    if (this.props.triggerMode === PopoverTriggerMode.Hover) {
      return {
        targetEvents: {
          onMouseEnter: this._handleMouseEnter,
          onMouseLeave: this._handleMouseLeave
        },
        popoverEvents: {
          onMouseEnter: this._handleHoverOnPopover,
          onMouseLeave: this._handleHoverOnPopover
        }
      };
    }
    return {targetEvents: {onClick: this._togglePopover}, popoverEvents: {}};
  };
  render(props: PopoverProps) {
    if (!props.content || !props.children) {
      return null;
    }
    const {targetEvents, popoverEvents} = this._getHoverEvents();
    return (
      <div className={styles.popoverContainer}>
        <div
          className="popover-anchor-container"
          ref={node => {
            this._controlElement = node;
          }}
          {...targetEvents}>
          {props.children}
        </div>
        {this.state.open && (
          <div
            aria-expanded="true"
            className={[props.className, styles.popoverComponent, styles[props.verticalPosition], styles[props.horizontalPosition]].join(' ')}
            {...popoverEvents}>
            {props.content}
          </div>
        )}
      </div>
    );
  }
}
