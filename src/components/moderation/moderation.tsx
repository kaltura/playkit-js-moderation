import {h, Component, Fragment} from 'preact';
import {KeyboardKeys, Popover, PopoverHorizontalPositions, PopoverVerticalPositions} from '../popover';
import {PopoverMenu, PopoverMenuItem} from '../popover-menu';
import {OnClick, A11yWrapper} from '../a11y-wrapper';
import {icons} from '../icons';
import * as styles from './moderation.scss';

const {Tooltip, Icon} = KalturaPlayer.ui.components;
const {withText, Text} = KalturaPlayer.ui.preacti18n;

export interface ModerateOption {
  id: number;
  label: string;
}

interface ModerationProps {
  onClick: OnClick;
  onSubmit: (contentType: number, content: string, callBack: () => void) => void;
  reportLength: number;
  moderateOptions: ModerateOption[];
  subtitle: string;
  tooltipMessage: string;
  closeButtonSelected: boolean;
  sendReportLabel?: string;
  closeLabel?: string;
}

interface ModerationState {
  reportContentType: number;
  reportContent: string;
  isTextareaActive: boolean;
}

const DEFAULT_CONTENT_TYPE = 'Choose a reason for reporting this content';

const initialState: ModerationState = {
  reportContent: '',
  reportContentType: -1,
  isTextareaActive: false
};

const translates = {
  sendReportLabel: <Text id="moderation.send_report">Report</Text>,
  closeLabel: <Text id="moderation.close">Close</Text>
};

@withText(translates)
export class Moderation extends Component<ModerationProps, ModerationState> {
  _closeButtonNode: null | HTMLButtonElement = null;

  state: ModerationState = {...initialState};

  componentDidMount(): void {
    if (this._closeButtonNode && this.props.closeButtonSelected) {
      this._closeButtonNode.focus();
    }
  }

  private _onContentTypeChange = (id: number) => {
    this.setState({
      reportContentType: id
    });
  };

  private _onContentChange = (event: any) => {
    this.setState({
      reportContent: event.target.value
    });
  };

  private _handleFocus = () => {
    this.setState({
      isTextareaActive: true
    });
  };

  private _handleBlur = () => {
    this.setState((state: ModerationState) => ({
      isTextareaActive: state.reportContent.length > 0
    }));
  };

  private _handleSubmit = (event: any) => {
    event.preventDefault();
    const {reportContent, reportContentType} = this.state;
    if (reportContentType === -1) {
      return;
    }
    this.props.onSubmit(reportContentType, reportContent, () => {
      this.setState({...initialState});
    });
  };

  private _onKeyDown = (e: KeyboardEvent, callBack: Function) => {
    if (e.keyCode !== KeyboardKeys.Enter && e.keyCode !== KeyboardKeys.Esc) {
      // don't stopPropagation on ESC and Enter pressed as it prevent the popup closing
      e.stopPropagation();
    }
    switch (e.keyCode) {
      case KeyboardKeys.Enter: // Enter pressed
        callBack();
        break;
    }
  };

  private _popoverMenuItemRenderer = (el: PopoverMenuItem) => (
    <div
      tabIndex={1}
      role="button"
      onClick={() => el.onMenuChosen()}
      onKeyDown={e => this._onKeyDown(e, el.onMenuChosen)}
      className={styles.popoverMenuItem}>
      {el.label}
    </div>
  );

  private _getPopoverMenuOptions = () => {
    return this.props.moderateOptions.map(({label, id}: ModerateOption) => ({
      label: label || '',
      onMenuChosen: () => this._onContentTypeChange(id || -1)
    }));
  };

  private _popoverContent = () => {
    return <PopoverMenu itemRenderer={this._popoverMenuItemRenderer} options={this._getPopoverMenuOptions()} />;
  };

  private _getContentType = (): any => {
    return this.props.moderateOptions.find((moderateOption: ModerateOption) => moderateOption.id === this.state.reportContentType) || {};
  };

  render(props: ModerationProps) {
    const {reportLength, subtitle, tooltipMessage, onClick, closeLabel} = props;
    const {reportContent, reportContentType, isTextareaActive} = this.state;
    return (
      <div className={[styles.root, 'kaltura-moderation__root'].join(' ')}>
        <A11yWrapper onClick={onClick}>
          <button
            aria-label={closeLabel}
            className={[styles.closeButton, 'kaltura-moderation__close-button'].join(' ')}
            tabIndex={1}
            ref={node => {
              this._closeButtonNode = node;
            }}>
            <Icon
              id="moderation-plugin-close-button"
              height={icons.BigSize}
              width={icons.BigSize}
              viewBox={`0 0 ${icons.BigSize} ${icons.BigSize}`}
              path={icons.CLOSE_ICON}
            />
          </button>
        </A11yWrapper>
        <div className={styles.mainWrapper}>
          <div className={[styles.title, 'kaltura-moderation__title'].join(' ')}>What’s wrong with this content?</div>
          {subtitle ? <div className={[styles.subtitle].join(' ')}>{subtitle}</div> : null}
          <Popover
            className={styles.reportPopover}
            verticalPosition={PopoverVerticalPositions.Bottom}
            horizontalPosition={PopoverHorizontalPositions.Right}
            content={this._popoverContent()}>
            <Fragment>
              <button className={styles.selectWrapper} tabIndex={1}>
                <div className={styles.select}>{reportContentType > -1 ? this._getContentType()?.label || '' : DEFAULT_CONTENT_TYPE}</div>
                <div className={styles.downArrow} />
              </button>
            </Fragment>
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
                  {this.props.sendReportLabel}
                </button>
              </Tooltip>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
