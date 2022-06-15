import {h, Component} from 'preact';

export interface UIPlayerAdapterProps {
  player: KalturaPlayerTypes.Player;
  onMount: (player: KalturaPlayerTypes.Player) => void;
  onUnmount: (player: KalturaPlayerTypes.Player) => void;
}

@KalturaPlayer.ui.components.withPlayer
export class UIPlayerAdapter extends Component<UIPlayerAdapterProps> {
  static defaultProps = {
    player: null,
  };

  componentDidMount(): void {

    this.props.onMount(this.props.player);
  }

  componentWillUnmount(): void {
    this.props.onUnmount(this.props.player);
  }

  render(props: any) {
    return null;
  }
}
