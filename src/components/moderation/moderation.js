// @flow
/**
 * @jsx h
 * @ignore
 */

import {pluginName} from '../../moderation';
import {ui} from 'kaltura-player-js';
const {preact, Components, style, Utils, redux, Reducers, createPortal} = ui;
const {h, Component} = preact;
import {ModerationOverlay} from '../moderation-overlay/moderation-overlay';
import styles from '../../assets/toast.scss';
import {ToastSeverity} from '@playkit-js-contrib/ui';
import {KalturaModerationFlagType} from 'kaltura-typescript-client/api/types/KalturaModerationFlagType';
import {BaseEntryFlagAction} from 'kaltura-typescript-client/api/types/BaseEntryFlagAction';
import {KalturaModerationFlag} from 'kaltura-typescript-client/api/types/KalturaModerationFlag';
const {Tooltip, Button, ButtonControl, withLogger, Icon, withPlayer} = Components;
const {bindActions} = Utils;
const {shell} = Reducers;
const {actions} = shell;
const {connect} = redux;

const ICON_PATH: string =
  'M8.378 7.084l5.175 19.314c.134.497-.126 1.005-.594 1.19l-.112.037c-.533.143-1.08-.165-1.225-.71L6.447 7.603c-.134-.497.126-1.005.594-1.19l.112-.037c.533-.143 1.08.165 1.225.71zM21.882 7c1.878 0 2.79 1.622 1.84 3.239l-1.386 2.36 2.94 3.246C26.6 17.31 25.842 19 23.868 19h-10.21c-.452 0-.848-.304-.966-.741l-2.68-10c-.17-.635.31-1.259.967-1.259h10.902zm.211 1.994l-.21.006h-9.6l2.144 8h9.196l-3.263-3.604c-.293-.324-.342-.8-.12-1.178l1.757-2.992c.114-.194.168-.23.096-.232z';
/**
 * mapping state to props
 * @param {*} state - redux store state
 * @returns {Object} - mapped state to this component
 */
const mapStateToProps = state => ({
  isPlaying: state.engine.isPlaying
});

const COMPONENT_NAME = 'Moderation';
/**
 * Moderation component
 *
 * @class Moderation
 * @extends {Component}
 */
@connect(mapStateToProps, bindActions(actions))
@withPlayer
@withLogger(COMPONENT_NAME)
class Moderation extends Component {
  _portal: any; // ie11 fix (FEC-7312) - don't remove
  /**
   * toggle overlay internal component state
   *
   * @returns {void}
   * @memberof Moderation
   */
  _toggleOverlay = (): void => {
    this.setState(
      prevState => {
        return {
          overlayActive: !this.state.overlayActive,
          previousIsPlaying: this.props.isPlaying || prevState.previousIsPlaying
        };
      },
      () => {
        if (this.state.overlayActive) {
          this.props.player.pause();
        } else if (this.state.previousIsPlaying) {
          this.props.player.play();
          this.setState({previousIsPlaying: false});
        }
      }
    );
  };

  /**
   * send the moderation request
   *
   * @param {KalturaModerationFlagType} contentType - moderation type
   * @param {string} content - moderation description
   * @returns {void}
   * @memberof Moderation
   */
  _sentReport = (contentType: KalturaModerationFlagType, content: string) => {
    const {onReportSentMessage, onReportErrorMessage} = this.props.config;
    const request = new BaseEntryFlagAction({
      moderationFlag: new KalturaModerationFlag({
        flaggedEntryId: this.props.player.sources.id,
        flagType: contentType,
        comments: content
      })
    });

    return this.props.kalturaClient
      .request(request)
      .then(() => {
        this.props.logger.debug('report sent successfully');
        this._toggleOverlay();
        this._displayToast({
          text: onReportSentMessage,
          icon: <div className={[styles.toastIcon, styles.success].join(' ')} />,
          severity: ToastSeverity.Success
        });
        if (this._wasPlayed) {
          this._player.play();
        }
      })
      .catch(error => {
        this.props.logger.error('failed to submit report', error);
        this._toggleOverlay();
        this._displayToast({
          text: onReportErrorMessage,
          icon: <div className={[styles.toastIcon, styles.error].join(' ')} />,
          severity: ToastSeverity.Error
        });
      });
  };

  /**
   * display popup on the screen
   *
   * @param {{text: string, icon: ComponentChild, severity: ToastSeverity}} options - toast options
   * @returns {void}
   * @memberof Moderation
   */
  _displayToast = (options: {text: string, icon: ComponentChild, severity: ToastSeverity}): void => {
    const {notificationDuration} = this.props.config;
    this.props.contribServices.toastManager.add({
      title: 'Report Content',
      text: options.text,
      icon: options.icon,
      duration: notificationDuration,
      severity: ToastSeverity.Success || ToastSeverity.Error,
      onClick: () => {
        this.props.logger.debug('Moderation clicked on toast');
      }
    });
  };

  /**
   * render element
   *
   * @returns {React$Element} component element
   * @memberof Moderation
   */
  render(): React$Element<any> | void {
    const {reportLength, moderateOptions, subtitle, tooltipMessage} = this.props.config;
    const targetId = document.getElementById(this.props.player.config.targetId) || document;
    const portalSelector = `.overlay-portal`;
    return this.state.overlayActive ? (
      createPortal(
        <ModerationOverlay
          onSubmit={this._sentReport}
          reportLength={reportLength}
          subtitle={subtitle}
          tooltipMessage={tooltipMessage}
          moderateOptions={moderateOptions}
          onClose={this._toggleOverlay}
        />,
        targetId.querySelector(portalSelector)
      )
    ) : (
      <ButtonControl name={COMPONENT_NAME}>
        <Tooltip label={this.props.shareTxt}>
          <Button aria-haspopup="true" className={style.controlButton} onClick={this._toggleOverlay} aria-label={this.props.shareTxt}>
            <Icon id={pluginName} path={ICON_PATH} width="32" height="32" viewBox="0 0 32 32" />
          </Button>
        </Tooltip>
      </ButtonControl>
    );
  }
}

Moderation.displayName = COMPONENT_NAME;
export {Moderation};
