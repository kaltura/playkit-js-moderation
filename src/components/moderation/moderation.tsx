import {h, Component} from 'preact';
import {Popover} from '../popover';
import {OnClick, A11yWrapper, OverlayPortal} from '@playkit-js/common';
import * as styles from './moderation.scss';
import {DownIcon} from './down-icon';

const {Tooltip, Overlay, PLAYER_SIZE} = KalturaPlayer.ui.components;
const {withText, Text} = KalturaPlayer.ui.preacti18n;
const {
  redux: {connect}
} = KalturaPlayer.ui;

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
  reportPlaceholder?: string;
  defaultContentType?: string;
  reportTitle?: string;
}

interface ConnectProps {
  playerSize?: string;
}

type MergedProps = ModerationProps & ConnectProps;

interface ModerationState {
  reportContentType: number;
  reportContent: string;
  isTextareaActive: boolean;
}

const initialState: ModerationState = {
  reportContent: '',
  reportContentType: -1,
  isTextareaActive: false
};

const translates = {
  sendReportLabel: <Text id="moderation.send_report">Report</Text>,
  closeLabel: <Text id="moderation.close">Close</Text>,
  reportPlaceholder: <Text id="moderation.report_placeholder">Describe what you saw...</Text>,
  defaultContentType: <Text id="moderation.default_content_type">Choose a reason for reporting this content</Text>,
  reportTitle: <Text id="moderation.report_title">What’s wrong with this content?</Text>
};

const mapStateToProps = (state: Record<string, any>) => ({
  playerSize: state.shell.playerSize
});

@withText(translates)
@connect(mapStateToProps)
export class Moderation extends Component<MergedProps, ModerationState> {
  _buttonRef: null | HTMLButtonElement = null;
  _textAreaElementRef: null | HTMLTextAreaElement = null;

  state: ModerationState = {...initialState};

  componentDidMount(): void {
    if (this._buttonRef && this.props.closeButtonSelected) {
      this._buttonRef.focus();
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

  private _getPopoverMenuOptions = () => {
    return this.props.moderateOptions.map(({label, id}: ModerateOption) => ({
      label: label || '',
      onMenuChosen: (byKeyboard?: boolean) => {
        this._onContentTypeChange(id || -1);
        if (byKeyboard) {
          this._textAreaElementRef?.focus();
        }
      }
    }));
  };

  private _getContentType = (): any => {
    return this.props.moderateOptions.find((moderateOption: ModerateOption) => moderateOption.id === this.state.reportContentType) || {};
  };

  render(props: MergedProps) {
    const {playerSize = '', reportLength, subtitle, tooltipMessage, onClick} = props;
    const {reportContent, reportContentType, isTextareaActive} = this.state;
    if (playerSize === PLAYER_SIZE.TINY) {
      return null;
    }
    const submitButtonDisabled = reportContentType === -1;
    return (
      <OverlayPortal>
        <Overlay open onClose={onClick}>
          <div className={[styles.root, styles[playerSize]].join(' ')}>
            <div className={styles.mainWrapper}>
              <div className={styles.title}>{this.props.reportTitle}</div>
              {subtitle ? <div className={[styles.subtitle].join(' ')}>{subtitle}</div> : null}
              <Popover options={this._getPopoverMenuOptions()}>
                <button
                  className={styles.selectWrapper}
                  tabIndex={0}
                  ref={node => {
                    this._buttonRef = node;
                  }}>
                  <div className={styles.select}>{reportContentType > -1 ? this._getContentType()?.label || '' : this.props.defaultContentType}</div>
                  <div className={styles.downArrow}>
                    <DownIcon />
                  </div>
                </button>
              </Popover>
              <form>
                <textarea
                  className={[styles.textarea, isTextareaActive ? styles.active : ''].join(' ')}
                  onInput={this._onContentChange}
                  onFocus={this._handleFocus}
                  onBlur={this._handleBlur}
                  tabIndex={0}
                  placeholder={this.props.reportPlaceholder}
                  aria-label={this.props.reportPlaceholder}
                  value={reportContent}
                  maxLength={reportLength}
                  ref={node => {
                    this._textAreaElementRef = node;
                  }}
                />
                <div className={styles.submitWrapper}>
                  <div className={styles.characterCounter}>{`${reportContent.length}/${reportLength}`}</div>
                  <Tooltip label={tooltipMessage} classNames={styles.tooltip}>
                    <A11yWrapper onClick={this._handleSubmit}>
                      <button
                        role="button"
                        aria-disabled={submitButtonDisabled}
                        aria-label={this.props.sendReportLabel}
                        className={[styles.submitButton, submitButtonDisabled ? styles.disabled : ''].join(' ')}
                        tabIndex={0}>
                        {this.props.sendReportLabel}
                      </button>
                    </A11yWrapper>
                  </Tooltip>
                </div>
              </form>
            </div>
          </div>
        </Overlay>
      </OverlayPortal>
    );
  }
}
