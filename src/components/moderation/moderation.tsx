import {h, Component} from 'preact';
import {getContribLogger, ObjectUtils} from '@playkit-js-contrib/common';
import {
  KeyboardKeys,
  Popover,
  PopoverHorizontalPositions,
  PopoverVerticalPositions,
} from '@playkit-js-contrib/ui';
import {KalturaModerationFlagType} from 'kaltura-typescript-client/api/types';
import {CloseButton} from '../close-button';
import {PopoverMenu, PopoverMenuItem} from '../popover-menu';
import * as styles from './moderation.scss';
const {get} = ObjectUtils;

export interface ModerateOption {
  id: number;
  label: string;
}

interface ModerationProps {
  onClick: () => void;
  onSubmit: (contentType: KalturaModerationFlagType, content: string) => void;
  reportLength: number;
  moderateOptions: ModerateOption[];
}

interface ModerationState {
  reportContentType: number;
  reportContent: string;
  isTextareaActive: boolean;
}

const logger = getContribLogger({
  class: 'Info',
  module: 'info-plugin',
});

const INITIAL_CONTENT_VALUE = 'Describe what you saw...';
const DEFAULT_CONTENT_TYPE = 'Choose a reason for reporting this content';

export class Moderation extends Component<ModerationProps, ModerationState> {
  state: ModerationState = {
    reportContent: INITIAL_CONTENT_VALUE,
    reportContentType: -1,
    isTextareaActive: false,
  };

  componentDidMount(): void {
    logger.trace('Moderation plugin mount', {
      method: 'componentDidMount',
    });
  }
  shouldComponentUpdate(
    nextProps: Readonly<ModerationProps>,
    nextState: Readonly<ModerationState>
  ) {
    const {reportContent, reportContentType, isTextareaActive} = this.state;
    if (
      reportContent !== nextState.reportContent ||
      reportContentType !== nextState.reportContentType ||
      isTextareaActive !== nextState.isTextareaActive
    ) {
      return true;
    }
    return false;
  }

  private _onContentTypeChange = (id: number) => {
    this.setState({
      reportContentType: id,
    });
  };

  private _onContentChange = (event: any) => {
    const {value} = event.target;
    const {reportLength} = this.props;

    this.setState((state: ModerationState) => ({
      reportContent: value.length > reportLength ? state.reportContent : value,
    }));
  };

  private _handleFocus = () => {
    if (this.state.reportContent === INITIAL_CONTENT_VALUE) {
      this.setState({
        reportContent: '',
        isTextareaActive: true,
      });
    }
  };

  private _handleBlur = () => {
    this.setState((state: ModerationState) => ({
      reportContent: !state.reportContent
        ? INITIAL_CONTENT_VALUE
        : state.reportContent,
      isTextareaActive:
        state.reportContent && state.reportContent !== INITIAL_CONTENT_VALUE
          ? true
          : false,
    }));
  };

  private _handleSubmit = (event: any) => {
    event.preventDefault();
    const {reportContent, reportContentType} = this.state;
    logger.trace('Moderation plugin submit click', {
      method: 'handleSubmit',
    });
    if (reportContentType === -1) {
      logger.trace('User did not select reason', {
        method: 'handleSubmit',
      });
      // TODO - handle validation
      return;
    }
    this.props.onSubmit(reportContentType, reportContent);
  };

  private _onKeyDown = (e: KeyboardEvent, callBack: Function) => {
    if (e.keyCode !== KeyboardKeys.Enter && e.keyCode !== KeyboardKeys.Esc) {
      // don't stopPropagation on ESC and Enter pressed as it prevent the popup closing
      e.stopPropagation();
    }
    switch (e.keyCode) {
      case 13: // Enter pressed
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
    return this.props.moderateOptions.map(({ label, id }: ModerateOption) => ({
      label: label || '',
      onMenuChosen: () => this._onContentTypeChange(id || -1),
    }));
  };

  private _popoverContent = () => {
    return (
      <PopoverMenu
        itemRenderer={this._popoverMenuItemRenderer}
        options={this._getPopoverMenuOptions()}
      />
    );
  };

  private _getContentType = () => {
    return (
      this.props.moderateOptions.find(
        (moderateOption: ModerateOption) =>
          moderateOption.id === this.state.reportContentType
      ) || {}
    );
  };

  render(props: ModerationProps) {
    const {onClick, reportLength} = props;
    const {reportContent, reportContentType, isTextareaActive} = this.state;
    return (
      <div className={[styles.root, 'kaltura-moderation__root'].join(' ')}>
        <CloseButton onClick={onClick} />
        <div className={styles.mainWrapper}>
          <div className={[styles.title, 'kaltura-moderation__title'].join(' ')}>What’s wrong with this content?</div>
          <Popover
            className={styles.reportPopover}
            verticalPosition={PopoverVerticalPositions.Bottom}
            horizontalPosition={PopoverHorizontalPositions.Right}
            content={this._popoverContent()}>
            <div className={styles.selectWrapper}>
              <div className={styles.select}>
                {reportContentType > -1
                  ? get(this._getContentType(), 'label', '')
                  : DEFAULT_CONTENT_TYPE}
              </div>
              <div className={styles.downArrow} />
            </div>
          </Popover>
          <form onSubmit={this._handleSubmit}>
            <textarea
              className={isTextareaActive ? styles.active : ''}
              value={reportContent}
              onInput={this._onContentChange}
              onFocus={this._handleFocus}
              onBlur={this._handleBlur}
            />
            <div className={styles.submitWrapper}>
              <div className={styles.characterCounter}>
                {`${
                  reportContent === INITIAL_CONTENT_VALUE
                    ? 0
                    : reportContent.length
                }/${reportLength}`}
              </div>
              <button
                className={[
                  styles.submitButton,
                  reportContentType === -1 ? styles.disabled : '',
                ].join(' ')}
                type="submit">
                Report
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
