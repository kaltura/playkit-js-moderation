import {h, Component, VNode} from 'preact';
import {A11yWrapper, OnClickEvent} from '@playkit-js/common/dist/hoc/a11y-wrapper';
import * as styles from './popover.scss';

const {ESC, TAB} = KalturaPlayer.ui.utils.KeyMap;
const {withEventManager} = KalturaPlayer.ui.Event;
const {Tooltip} = KalturaPlayer.ui.components;


export interface PopoverMenuItem {
  label?: string;
  onMenuChosen: () => void;
}

interface PopoverProps {
  options: Array<PopoverMenuItem>;
  children: VNode;
  setExpandedState: (open: boolean, callback?: () => void) => void;
  open: boolean;
  eventManager?: any;
}

@withEventManager
export class Popover extends Component<PopoverProps> {
  private _controlElementRef: HTMLDivElement | null = null;
  private _popoverElementRef: HTMLDivElement | null = null;
  private _optionsRefMap: Map<number, HTMLDivElement | null> = new Map();


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
    if (event.keyCode === ESC || (!this._popoverElementRef?.contains(event.target as Node | null)
        && !this._controlElementRef?.contains(event.target as Node | null))) {

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
    this.props.setExpandedState(true, () => {
      this._addListeners();
      if (byKeyboard) {
        this.props.eventManager?.listen(this._controlElementRef, 'keydown', (event: KeyboardEvent) => {
          if (event.keyCode === TAB){
            this._getOptionRef(-1)?.focus();
          }
        })
      }
    });
  };

  private _closePopover = () => {
    this._removeListeners();
    this.props.setExpandedState(false);
  };

  private _togglePopover = (e: MouseEvent | KeyboardEvent, byKeyboard?: boolean) => {
    if (this.props.open) {
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

  private _createOptionDiv = (el:PopoverMenuItem, index: number) =>{
    return (
        <div
            tabIndex={0}
            aria-label={el.label}
            className={styles.popoverMenuItem}
            ref={node => {
              this._setOptionRef(index, node);
            }}>
          {el.label}
        </div>
    )
  }

  render(props: PopoverProps) {
    const {open} = this.props;

    return (
      <div className={styles.popoverContainer}>
        <div
          className="popover-anchor-container"
          ref={node => {
            if (node){
              this._controlElementRef = node;
            }
          }}>
          <A11yWrapper onClick={this._togglePopover}>{props.children}</A11yWrapper>;
        </div>
        {open && (
          <div
            aria-expanded={open}
            id="popoverContent"
            ref={node => {
              this._popoverElementRef = node;
            }}
            className={[styles.reportPopover, styles.popoverComponent, styles.bottom, styles.right].join(' ')}>
            <div role="menu" className={styles.popoverMenu} data-testid="popoverMenu">
              {props.options.map((el, index) => {
                const isTitle = el.label?.length ? el.label?.length > 58 : ''
                return (
                  <A11yWrapper
                    role="menuitem"
                    onClick={this._handleClickOnOption(el.onMenuChosen)}
                    onDownKeyPressed={this._handleDownKeyPressed(index)}
                    onUpKeyPressed={this._handleUpKeyPressed(index)}>
                    {isTitle?
                        (<Tooltip label={el.label}>
                          {this._createOptionDiv(el, index)}
                        </Tooltip>)
                    :(this._createOptionDiv(el, index))}
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
