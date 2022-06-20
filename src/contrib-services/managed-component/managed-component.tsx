import {h, Component, ComponentChild, ComponentChildren} from 'preact';
import * as styles from './_managed-component.scss';
const {
  redux: {connect},
} = KalturaPlayer.ui;

type ManagedComponentState = {
  toggler: boolean;
};
type ManagedComponentProps = {
  isShown: () => boolean;
  renderChildren: (playerSize: string) => ComponentChildren;
  label: string;
  fillContainer: boolean;
  playerSize?: string;
  updateOnPlayerSizeChanged?: boolean;
};

const mapStateToProps = (state: Record<string, any>) => ({
  playerSize: state.shell.playerSize,
});
@connect(mapStateToProps, null, null, {forwardRef: true})
export class ManagedComponent extends Component<
  ManagedComponentProps,
  ManagedComponentState
> {

  static defaultProps = {
    fillContainer: false,
  };

  update() {
    this.setState((prev: ManagedComponentState) => {
      return {
        toggler: !prev.toggler,
      };
    });
  }

  shouldComponentUpdate(prevProps: Readonly<ManagedComponentProps>): boolean {
    const {updateOnPlayerSizeChanged, playerSize} = this.props;
    return (
      (updateOnPlayerSizeChanged && prevProps.playerSize !== playerSize) ||
      prevProps.playerSize === playerSize
    );
  }

  componentDidMount(): void {
    this.setState({
      toggler: false,
    });
  }

  render() {
    const {fillContainer, isShown, playerSize} = this.props;
    if (!isShown()) {
      return null;
    }

    return (
      <div
        data-contrib-item={this.props.label}
        className={[
          `${fillContainer ? styles.fillContainer : ''}`,
          styles.inlineContainer,
        ].join(' ')}>
        {this.props.renderChildren(playerSize!)}
      </div>
    );
  }
}
