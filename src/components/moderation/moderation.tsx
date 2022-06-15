import {h, Component, Fragment} from 'preact';
import {KeyboardKeys, Popover, PopoverHorizontalPositions, PopoverVerticalPositions} from '../popover';
import {PopoverMenu, PopoverMenuItem} from '../popover-menu';
import * as styles from './moderation.scss';
const {Tooltip} = KalturaPlayer.ui.components;

export interface ModerateOption {
  id: number;
  label: string;
}

interface ModerationProps {
  onClick: () => void;
  onSubmit: (contentType: number, content: string, callBack: () => void) => void;
  reportLength: number;
  moderateOptions: ModerateOption[];
  subtitle: string;
  tooltipMessage: string;
  closeButtonSelected: boolean;
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

export class Moderation extends Component<ModerationProps, ModerationState> {
  _closeButtonNode: null | HTMLDivElement = null;

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

  private _handleClose = (event: MouseEvent | KeyboardEvent) => {
    // @ts-ignore
    if (event.type === 'keypress' && event?.keyCode !== KeyboardKeys.Enter) {
      return;
    }
    this.props.onClick();
  };

  render(props: ModerationProps) {
    const {reportLength, subtitle, tooltipMessage} = props;
    const {reportContent, reportContentType, isTextareaActive} = this.state;
    return (
      <div className={[styles.root, 'kaltura-moderation__root'].join(' ')}>
        <div
          className={[styles.closeButton, 'kaltura-moderation__close-button'].join(' ')}
          role="button"
          tabIndex={1}
          onClick={this._handleClose}
          onKeyPress={this._handleClose}
          ref={(node: HTMLDivElement | null) => {
            this._closeButtonNode = node;
          }}
        />
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
                  Report
                </button>
              </Tooltip>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
