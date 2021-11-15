import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { BaseModule, ContentSection } from '../Common';

export default function BaseChart(props) {
  const marginTop = props.marginTop == null ? '-80px' : props.marginTop;
  const [section, setSection] = useState(0);
  const [width, setWidth] = useState<number>(window.innerWidth);
  const [data, setData] = useState<any>({
    labels: [],
    datasets: [],
  });
  const [labels, setLabels] = useState<any>(['0']);
  const [datasets, setDataSets] = useState<any>([]);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }

  const isMobile: boolean = (width <= 758);
  const baseStyle = isMobile ? { width: '100vw', paddingLeft: 0, paddingRight: 0 } : null;

  useEffect(() => {
    setLabels(['1', '2', '3', '4', '5', '6']);
    setDataSets([{
      label: '# of Votes',
      data: [12, 19, 3, 5, 2, 3],
      fill: false,
      backgroundColor: 'rgb(255,255,255)',
      borderColor: 'rgba(255, 99, 132)',
    },
    ]);
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    };
  }, []);

  useEffect(() => {
    setData({
      labels: labels,
      datasets: datasets,
    });
  }, [labels, datasets]);

  const addData = () => {
    const newData = {
      label: '# of times x does y',
      data: [12, 19, 3, 5, 2, 3].reverse(),
      fill: false,
      backgroundColor: 'rgb(255,255,255)',
      borderColor: 'rgba(0, 255, 255)',
    };
    setData({ ...data, datasets: [...data.datasets, newData] });
  };
  const addChartLabel = () => {
    const newLabel = Math.floor(Math.random() * 100);
    setLabels([...labels, newLabel.toString()]);
  };
  const removeData = () => {
    setData({ ...data, datasets: data.datasets.slice(0, data.datasets.length - 1) });
  };

  const options = {
    redraw: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const titles = ['Bean'];
  const descriptions = [
    'Use this tab to view charts with information about the BEAN token.',
    'Use this tab to view charts with information about the Field.',
    'Use this tab to view charts with information about the Silo.',
  ];
  console.log(data);
  const sections = [
    <Line data={data} options={options} />,
  ];

  return (
    <ContentSection
      id="charts"
      title={props.title}
      size="20px"
      style={{ minHeight: '600px', maxWidth: '1000px', marginTop: marginTop }}
    >
      <BaseModule
        handleTabChange={(event, newSection) => { setSection(newSection); }}
        removeBackground
        section={section}
        sectionTitlesDescription={descriptions}
        size={isMobile ? 'small' : 'medium'}
        sectionTitles={titles}
        showButton={false}
        style={baseStyle}
      >
        {sections[section]}
        <button type="button" onClick={() => addData()}>Add Data</button>
        <button type="button" onClick={() => addChartLabel()}>Add Chart Label</button>
        <button type="button" onClick={() => removeData()}>Remove Data</button>
      </BaseModule>
    </ContentSection>
  );
}
BaseChart.defaultProps = {
  title: 'Charts',
};
