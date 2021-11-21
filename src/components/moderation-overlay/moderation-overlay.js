// @flow
/**
 * @jsx h
 * @ignore
 */
import {ui} from 'kaltura-player-js';
import styles from './style.scss';
import {Popover, PopoverHorizontalPositions, PopoverVerticalPositions} from '../popover';
import {PopoverMenu, PopoverMenuItem} from '../popover-menu';

const {preact, Components, Utils} = ui;
const {h, Component} = preact;
const {Overlay, withLogger, Tooltip, Icon} = Components;
const {KeyMap} = Utils;

const ICON_PATH: string =
  'M4.78325732,5.37830235 C4.43990319,4.94572127 3.81088342,4.87338855 3.37830235,5.21674268 C2.94572127,5.56009681 2.87338855,6.18911658 3.21674268,6.62169765 L7.21674268,11.6611718 C7.61710439,12.165575 8.38289561,12.165575 8.78325732,11.6611718 L12.7832573,6.62169765 C13.1266115,6.18911658 13.0542787,5.56009681 12.6216977,5.21674268 C12.1891166,4.87338855 11.5600968,4.94572127 11.2167427,5.37830235 L8,9.43097528 L4.78325732,5.37830235 Z';

const DEFAULT_CONTENT_TYPE = 'Choose a reason for reporting this content';

const COMPONENT_NAME = 'ModerationOverlay';

const initialState: ModerationState = {
  reportContent: '',
  reportContentType: -1,
  isTextareaActive: false
};

/**
 * ShareOverlay component
 *
 * @class ShareOverlay
 * @extends {Component}
 */
@withLogger(COMPONENT_NAME)
class ModerationOverlay extends Component {
  state: ModerationState = {...initialState};
  /**
   * display popup on the screen
   *
   * @param {number} id - report content type id
   * @returns {void}
   * @memberof ModerationOverlay
   */
  _onContentTypeChange = (id: number) => {
    this.setState({
      reportContentType: id
    });
  };

  /**
   * display popup on the screen
   *
   * @param {any} event - event
   * @returns {void}
   * @memberof ModerationOverlay
   */
  _onContentChange = (event: any) => {
    this.setState({
      reportContent: event.target.value
    });
  };

  _handleFocus = () => {
    this.setState({
      isTextareaActive: true
    });
  };

  _handleBlur = () => {
    this.setState((state: ModerationState) => ({
      isTextareaActive: state.reportContent.length > 0
    }));
  };

  /**
   * display popup on the screen
   *
   * @param {any} event - event
   * @returns {void}
   * @memberof ModerationOverlay
   */
  _handleSubmit = (event: any) => {
    event.preventDefault();
    const {reportContent, reportContentType} = this.state;
    this.props.onSubmit(reportContentType, reportContent).then(() => {
      this.setState({...initialState});
    });
  };

  /**
   * display popup on the screen
   *
   * @param {KeyboardEvent} e - KeyboardEvent
   * @param {Function} callBack - callBack
   * @returns {void}
   * @memberof ModerationOverlay
   */
  _onKeyDown = (e: KeyboardEvent, callBack: Function) => {
    if (e.keyCode !== KeyMap.Enter && e.keyCode !== KeyMap.Esc) {
      // don't stopPropagation on ESC and Enter pressed as it prevent the popup closing
      e.stopPropagation();
    }
    switch (e.keyCode) {
      case 13: // Enter pressed
        callBack();
        break;
    }
  };

  /**
   * display popup on the screen
   *
   * @param {PopoverMenuItem} el - toast options
   * @returns {React$Element} - menu item element
   * @memberof ModerationOverlay
   */
  _popoverMenuItemRenderer = (el: PopoverMenuItem): React$Element<any> => (
    <div
      tabIndex={1}
      role="button"
      onClick={() => el.onMenuChosen()}
      onKeyDown={e => this._onKeyDown(e, el.onMenuChosen)}
      className={styles.popoverMenuItem}>
      {el.label}
    </div>
  );

  _getPopoverMenuOptions = () => {
    return this.props.moderateOptions.map(({label, id}: ModerateOption) => ({
      label: label || '',
      onMenuChosen: () => this._onContentTypeChange(id || -1)
    }));
  };

  _popoverContent = () => {
    return <PopoverMenu itemRenderer={this._popoverMenuItemRenderer} options={this._getPopoverMenuOptions()} />;
  };

  _getContentType = () => {
    return this.props.moderateOptions.find((moderateOption: ModerateOption) => moderateOption.id === this.state.reportContentType) || {};
  };
  /**
   * render component
   *
   * @param {*} props - component props
   * @returns {React$Element} - component element
   * @memberof ShareOverlay
   */
  render(props: any): React$Element<any> {
    const {reportLength, subtitle, tooltipMessage} = props;
    const {reportContent, reportContentType, isTextareaActive} = this.state;
    return (
      <Overlay open onClose={props.onClose} type="playkit-moderation">
        <div className={styles.root}>
          <div className={styles.mainWrapper}>
            <div className={[styles.title, 'kaltura-moderation__title'].join(' ')}>What’s wrong with this content?</div>
            {subtitle ? <div className={[styles.subtitle].join(' ')}>{subtitle}</div> : null}
            <Popover
              className={styles.reportPopover}
              verticalPosition={PopoverVerticalPositions.Bottom}
              horizontalPosition={PopoverHorizontalPositions.Right}
              content={this._popoverContent()}>
              <button className={styles.selectWrapper} tabIndex={1}>
                <div className={styles.select}>{reportContentType > -1 ? this._getContentType().label : DEFAULT_CONTENT_TYPE}</div>
                <div className={styles.downArrow}>
                  <Icon className={styles.iconn} id="down" path={ICON_PATH} width="32" height="32" viewBox="0 0 32 32" />
                </div>
              </button>
            </Popover>
            <form onSubmit={this._handleSubmit}>
              <textarea
                className={[styles.textarea, isTextareaActive ? styles.active : ''].join(' ')}
                onInput={this._onContentChange}
                onFocus={this._handleFocus}
                onBlur={this._handleBlur}
                tabIndex={1}
                placeholder="Describe what you saw..."
                value={reportContent}
                maxLength={reportLength}
              />
              <div className={styles.submitWrapper}>
                <div className={styles.characterCounter}>{`${reportContent.length}/${reportLength}`}</div>
                <Tooltip label={tooltipMessage} classNames={styles.tooltip}>
                  <button className={[styles.submitButton, reportContentType === -1 ? styles.disabled : ''].join(' ')} tabIndex={1} type="submit">
                    Report
                  </button>
                </Tooltip>
              </div>
            </form>
          </div>
        </div>
      </Overlay>
    );
  }
}

ModerationOverlay.displayName = COMPONENT_NAME;
export {ModerationOverlay};
