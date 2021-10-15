import { HeaderLabel } from './index';

export default function HeaderLabelWithTimer(props) {
  const [title, value, description] = props.display(props.time);

  return (
    <HeaderLabel
      description={description}
      marginTooltip="0 0 0 10px"
      title={title}
      value={value}
    />
  );
}

HeaderLabelWithTimer.defaultProps = {
  display: v => ['', '', ''],
};
