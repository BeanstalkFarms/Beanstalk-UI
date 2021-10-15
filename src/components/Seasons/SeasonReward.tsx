import { HeaderLabelWithTimer } from '../Common';

export default function SeasonReward(props) {
  function display(time) {
    const title = 'Season Reward';
    const description =
      'Beans Rewarded for Calling the Sunrise Function Right Now';
    const beans = (100 * 1.01 ** Math.min(-time, 300)).toFixed();
    return [title, beans, description];
  }

  return <HeaderLabelWithTimer display={display} time={props.time} />;
}
