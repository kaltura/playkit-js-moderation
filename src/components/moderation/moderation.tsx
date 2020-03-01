import {h, Component} from 'preact';
import * as styles from './moderation.scss';
import {getContribLogger} from '@playkit-js-contrib/common';
import {
  Popover,
  PopoverHorizontalPositions,
  PopoverVerticalPositions,
  KeyboardKeys,
} from '@playkit-js-contrib/ui';
import {CloseButton} from '../close-button';
import {PopoverMenu, PopoverMenuItem} from '../popover-menu';

interface ModerationProps {
  onClick: () => void;
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

const CONTENT_TYPES = [
  'Sexual Content',
  'Violent Or Repulsive',
  'Harmful Or Dangerous Act',
  'Spam / Commercials',
];

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

  private _onContentTypeChange = (index: number) => {
    this.setState({
      reportContentType: index,
    });
  };

  private _onContentChange = (event: any) => {
    const {value} = event.target;
    if (value.length > 500) {
      return;
    }
    this.setState({
      reportContent: value,
    });
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
    return CONTENT_TYPES.map((contentType: string, index: number) => ({
      label: contentType,
      onMenuChosen: () => this._onContentTypeChange(index),
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

  render(props: ModerationProps) {
    const {onClick} = props;
    const {reportContent, reportContentType, isTextareaActive} = this.state;
    return (
      <div className={[styles.root, 'kaltura-moderation__root'].join(' ')}>
        <CloseButton onClick={onClick} />
        <div className={styles.mainWrapper}>
          <div className={styles.title}>What’s wrong with this content?</div>
          <Popover
            className="download-print-popover"
            verticalPosition={PopoverVerticalPositions.Bottom}
            horizontalPosition={PopoverHorizontalPositions.Right}
            content={this._popoverContent()}>
            <div className={styles.select}>
              {reportContentType > -1
                ? CONTENT_TYPES[reportContentType]
                : 'Choose a reason for reporting this content'}
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
                }/500`}
              </div>
              <button className={styles.submitButton} type="submit">
                Report
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
