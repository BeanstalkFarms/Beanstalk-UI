import React from 'react';

const RenderLabels = (props): any => {
  // const divRef = React.useRef<HTMLDivElement>();
  const [labels, setLabels] = React.useState<string>('');
  React.useEffect((): void => {
    if (props.labels) { setLabels(props.labels); }
    // divRef.current.innerHTML = labels;
    console.log('props', props);
  }, [setLabels, props.labels, props]);

  return (
    <div>{labels}</div>
  );
};

export default RenderLabels;
