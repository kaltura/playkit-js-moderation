import {h, Component} from 'preact';
import {Popover} from '../popover';
import {OnClick, A11yWrapper} from '@playkit-js/common';
import {icons} from '../icons';
import * as styles from './moderation.scss';
import {DownIcon} from './down-icon';

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
  reportPlaceholder?: string;
  defaultContentType?: string;
  reportTitle?: string;
}

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

  private _getPopoverMenuOptions = () => {
    return this.props.moderateOptions.map(({label, id}: ModerateOption) => ({
      label: label || '',
      onMenuChosen: () => this._onContentTypeChange(id || -1)
    }));
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
            role="button"
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
          <div className={[styles.title, 'kaltura-moderation__title'].join(' ')}>{this.props.reportTitle}</div>
          {subtitle ? <div className={[styles.subtitle].join(' ')}>{subtitle}</div> : null}
          <Popover
            options={this._getPopoverMenuOptions()}>
            <button className={styles.selectWrapper} tabIndex={1}>
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
              tabIndex={1}
              placeholder={this.props.reportPlaceholder}
              value={reportContent}
              maxLength={reportLength}
            />
            <div className={styles.submitWrapper}>
              <div className={styles.characterCounter}>{`${reportContent.length}/${reportLength}`}</div>
              <Tooltip label={tooltipMessage} classNames={styles.tooltip}>
                <A11yWrapper onClick={this._handleSubmit}>
                  <button
                    role="button"
                    aria-label={this.props.sendReportLabel}
                    className={[styles.submitButton, reportContentType === -1 ? styles.disabled : ''].join(' ')}
                    tabIndex={1}>
                    {this.props.sendReportLabel}
                  </button>
                </A11yWrapper>
              </Tooltip>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
