import React from 'react';

const RenderLabels = (props): any => {
  const [labels, setLabels] = React.useState<string>('');
  React.useEffect((): void => {
    if (props.labels) { setLabels(props.labels); }
  }, [setLabels, props.labels, props]);

  return (
    <div>{labels}</div>
  );
};

export default RenderLabels;
