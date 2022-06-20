import {h, Component} from 'preact';
import * as styles from './injected-component.scss';

export interface InjectedComponentProps {
  onCreate: (options: {parent: HTMLDivElement}) => void;
  onDestroy: (options: {parent: HTMLDivElement}) => void;
  label: string;
  fillContainer: boolean;
}

class InjectedComponent extends Component<InjectedComponentProps> {
  _root = null;

  shouldComponentUpdate(): boolean {
    return false;
  }

  componentDidMount(): void {
    const {onCreate, label} = this.props;

    if (!onCreate) {
      return;
    }

    const parentElement = this._root;
    if (!parentElement) {
      return;
    }

    onCreate({parent: parentElement});
  }

  componentWillUnmount(): void {
    const {onDestroy, label} = this.props;
    const parentElement = this._root;

    if (!parentElement || !onDestroy) {
      return;
    }

    onDestroy({parent: parentElement});

  }

  render() {
    const {label, fillContainer} = this.props;
    const className = fillContainer ? styles.fillContainer : '';
    return (
      <div
        data-contrib-injected={label}
        className={className}
        ref={(ref: any) => (this._root = ref)}
      />
    );
  }
}

export {InjectedComponent};
