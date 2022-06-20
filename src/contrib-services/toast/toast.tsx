import {Component, h} from 'preact';
import * as styles from './_toast.scss';
import {ToastSeverity} from '../toast-manager';

export interface ToastProps {
  id: string;
  title: string;
  text: string;
  icon: any;
  severity: ToastSeverity;
  onClose: (id: string) => void;
  onClick: () => void;
}

interface ToastState {
  isShown: boolean;
}

export class Toast extends Component<ToastProps, ToastState> {
  state = {
    isShown: true,
  };

  private _onClick = (e: any) => {
    this.props.onClick();
    this._onClose(e);
  };

  private _onClose = (e: any) => {
    e.stopPropagation();
    this.setState({isShown: false});
    this.props.onClose(this.props.id);
  };

  private _getToastSeverityClass(): string {
    switch (this.props.severity) {
      case ToastSeverity.Success:
        return styles.successToast;
      case ToastSeverity.Warn:
        return styles.warnToast;
      case ToastSeverity.Error:
        return styles.errorToast;
      default:
        //info
        return styles.infoToast;
    }
  }

  render() {
    const {text, title, icon} = this.props;

    return (
      <div
        className={styles.toastWrapper + ' ' + this._getToastSeverityClass()}
        onClick={this._onClick}>
        <button className={styles.closeButton} onClick={this._onClose}></button>
        <div className={styles.title}>{title}</div>
        <div className={styles.toastBody}>
          <div className={styles.iconContainer}>
            <div className={styles.iconWrapper}>{icon}</div>
          </div>
          <div className={styles.text}>{text}</div>
        </div>
      </div>
    );
  }
}
