import {h, Component, VNode} from 'preact';
import {A11yWrapper, OnClickEvent} from '@playkit-js/common';
import * as styles from './popover.scss';

const {ESC, TAB} = KalturaPlayer.ui.utils.KeyMap;

export interface PopoverMenuItem {
  label?: string;
  onMenuChosen: () => void;
}

interface PopoverProps {
  options: Array<PopoverMenuItem>;
  children: VNode;
}

interface PopoverState {
  open: boolean;
}

export class Popover extends Component<PopoverProps, PopoverState> {
  private _controlElementRef: HTMLDivElement | null = null;
  private _popoverElementRef: HTMLDivElement | null = null;
  private _optionsRefMap: Map<number, HTMLDivElement | null> = new Map();

  state = {
    open: false
  };

  componentWillUnmount() {
    this._removeListeners();
    this._optionsRefMap = new Map();
  }

  private _handleMouseEvent = (event: MouseEvent) => {
    if (!this._controlElementRef?.contains(event.target as Node | null)) {
      this._closePopover();
    }
  };

  private _handleKeyboardEvent = (event: KeyboardEvent) => {
    if (event.keyCode === ESC || !this._popoverElementRef?.contains(event.target as Node | null)) {
      this._closePopover();
    }
  };

  private _getOptionRef = (index: number) => {
    return this._optionsRefMap.get(index);
  };

  private _setOptionRef = (index: number, ref: HTMLDivElement | null) => {
    return this._optionsRefMap.set(index, ref);
  };

  private _handleUpKeyPressed = (currentIndex: number) => () => {
    this._getOptionRef(currentIndex - 1)?.focus();
  };

  private _handleDownKeyPressed = (currentIndex: number) => () => {
    this._getOptionRef(currentIndex + 1)?.focus();
  };

  private _openPopover = (byKeyboard?: boolean) => {
    this.setState({open: true}, () => {
      this._addListeners();
      if (byKeyboard) {
        this._getOptionRef(0)?.focus();
      }
    });
  };

  private _closePopover = () => {
    this._removeListeners();
    this.setState({open: false});
  };

  private _togglePopover = (e: MouseEvent | KeyboardEvent, byKeyboard?: boolean) => {
    if (this.state.open) {
      this._closePopover();
    } else {
      this._openPopover(byKeyboard);
    }
  };
  private _addListeners = () => {
    document.addEventListener('click', this._handleMouseEvent);
    document.addEventListener('keydown', this._handleKeyboardEvent);
  };
  private _removeListeners = () => {
    document.removeEventListener('click', this._handleMouseEvent);
    document.removeEventListener('keydown', this._handleKeyboardEvent);
  };

  private _handleClickOnOption = (cb: (byKeyboard?: boolean) => void) => (event: OnClickEvent, byKeyboard?: boolean) => {
    this._closePopover();
    cb(byKeyboard);
  };

  render(props: PopoverProps) {
    const {open} = this.state;
    return (
      <div className={styles.popoverContainer}>
        <div
          className="popover-anchor-container"
          ref={node => {
            this._controlElementRef = node;
          }}>
          <A11yWrapper onClick={this._togglePopover}>{props.children}</A11yWrapper>;
        </div>
        {open && (
          <div
            aria-expanded={open}
            ref={node => {
              this._popoverElementRef = node;
            }}
            className={[styles.reportPopover, styles.popoverComponent, styles.bottom, styles.right].join(' ')}>
            <div role="menu" className={styles.popoverMenu}>
              {props.options.map((el, index) => {
                return (
                  <A11yWrapper
                    onClick={this._handleClickOnOption(el.onMenuChosen)}
                    onDownKeyPressed={this._handleDownKeyPressed(index)}
                    onUpKeyPressed={this._handleUpKeyPressed(index)}>
                    <div
                      tabIndex={0}
                      role="menuitem"
                      aria-label={el.label}
                      className={styles.popoverMenuItem}
                      ref={node => {
                        this._setOptionRef(index, node);
                      }}>
                      {el.label}
                    </div>
                  </A11yWrapper>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
}
