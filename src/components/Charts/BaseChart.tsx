/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { createChart, IChartApi, MouseEventHandler, TimeRangeChangeEventHandler } from 'lightweight-charts';
import equal from 'fast-deep-equal';
import usePrevious from 'util/hooks/usePrevious';
import { mergeDeep } from 'util/AnalyticsUtilities';

const BaseChart = (props: { autoHeight: any; autoWidth: any; backgroundTheme: any; charts: any; colors: any; darkTheme: any; fitAll: any; from: any; height: any; onClick: any; onCrosshairMove: any; onTimeRangeMove: any; options: any; to: any; timeScale: any; width: any; }) => {
    const {
        autoHeight,
        autoWidth,
        backgroundTheme,
        charts,
        colors,
        darkTheme,
        fitAll,
        from,
        height,
        onClick,
        onCrosshairMove,
        onTimeRangeMove,
        options,
        to,
        timeScale,
        width,
    } = props;
    const prevProps = usePrevious(props);
    const chartDiv = React.useRef<any>();
    const [series, setSeries] = React.useState<any>([]);
    const [chart, setChart] = React.useState<IChartApi>();
    const { customDarkTheme, lightTheme } = backgroundTheme;

    const addSeriesFunctions = {
        candlestick: 'addCandlestickSeries',
        line: 'addLineSeries',
        area: 'addAreaSeries',
        bar: 'addBarSeries',
        histogram: 'addHistogramSeries',
        baseline: 'addBaselineSeries',
    };
    const resizeHandler = () => {
        const newWidth =
            autoWidth &&
            chartDiv.current &&
            chartDiv.current.parentNode.clientWidth;
        const newHeight =
            autoHeight && chartDiv.current
                ? chartDiv.current.parentNode.clientHeight
                : height;

        chart?.resize(newWidth, newHeight);
    };

    const handleLinearInterpolation = (data: string | any[], candleTime: number) => {
        if (!candleTime || data.length < 2 || !data[0].value) return data;
        const first = data[0].time;
        const last = data[data.length - 1].time;
        const newData = new Array(Math.floor((last - first) / candleTime));
        newData[0] = data[0];
        const index = 1;
        for (let i = 1; i < data.length; i += 1) {
            newData[index + 1] = data[i];
            const prevTime = data[i - 1].time;
            const prevValue = data[i - 1].value;
            const { time, value } = data[i];
            for (
                let interTime = prevTime;
                interTime < time - candleTime;
                interTime += candleTime
            ) {
                // interValue get from the Taylor-Young formula
                const interValue =
                    prevValue +
                    (interTime - prevTime) *
                    ((value - prevValue) / (time - prevTime));
                newData[index + 1] = { time: interTime, value: interValue };
            }
        }
        // return only the valid values
        return newData.filter((x) => x);
    };
    const addSeries = (serie, type) => {
        const func = addSeriesFunctions[type];
        const color =
            (serie.options && serie.options.color) ||
            colors[series.length % colors.length];
        let mySeries;
        if (chart) {
            mySeries = chart[func]({
                color,
                ...serie.options,
            });
            const scaledData = timeScale === 'hour' ? serie.data[0] : serie.data[1];
            const data = handleLinearInterpolation(
                scaledData,
                serie.linearInterpolation
            );
            mySeries.setData(data);
            if (serie.markers) series.setMarkers(serie.markers);
            if (serie.priceLines) { serie.priceLines.forEach((line) => series.createPriceLine(line)); }
            if (serie.basevalue) {
                mySeries.setBaseValue(serie.basevalue);
            }
        }
        return mySeries;
    };
    const handleSeries = () => {
        // const candlestickSeries = charts.filter((c) => c.type === 'line');
        // if (candlestickSeries.length > 0 && candlestickSeries[0].data?.length > 0) {
        //   candlestickSeries.forEach((serie) => {
        //     setSeries([...series, addSeries(serie, 'candlestick')]);
        //   });
        // }
        // const lineSeries = charts.filter((c) => c.type === 'line');
        // if (lineSeries.length > 0 && lineSeries[0].data?.length > 0) {
        //   lineSeries.forEach((serie) => {
        //     setSeries([...series, addSeries(serie, 'line')]);
        //   });
        // }
        // const areaSeries = charts.filter((c) => c.type === 'area');
        // if (areaSeries.length > 0 && areaSeries[0].data?.length > 0) {
        //   areaSeries.forEach((serie) => {
        //     setSeries([...series, addSeries(serie, 'area')]);
        //   });
        // }
        // const barSeries = charts.filter((c) => c.type === 'bar');
        // if (barSeries.length > 0 && barSeries[0].data?.length > 0) {
        //   barSeries.forEach((serie) => {
        //     setSeries([...series, addSeries(serie, 'bar')]);
        //   });
        // }
        // const histogramSeries = charts.filter((c) => c.type === 'histogram');
        // if (histogramSeries.length > 0 && histogramSeries[0].data?.length > 0) {
        //   histogramSeries.forEach((serie) => {
        //     series.push(addSeries(serie, 'histogram'));
        //   });
        // }
        const baselineSeries = charts.filter((c: { type: string; }) => c.type === 'baseline');
        if (baselineSeries.length > 0 && baselineSeries[0].data?.length > 0) {
            baselineSeries.forEach((serie: { options: any; }) => {
                const newSerie = addSeries(serie, 'baseline');
                serie.options = options.baseline;
                setSeries([...series, newSerie]);
            });
        }
    };

    const removeSeries = () => {
        console.log('series', series);
        try {
            series.forEach((serie) => {
                console.log('serie', serie);
                if (serie) chart?.removeSeries(serie);
                const index = series.indexOf(serie);
                console.log('index', index);
                const newSeries = series.splice(index, 1);
                console.log('newSeries', series.splice(index, 1));
                if (index > -1) {
                    setSeries({ newSeries });
                }
            });
        } catch (e) {
            console.log(e);
        }
    };

    const handleEvents = () => {
        onClick && chart?.subscribeClick(onClick);
        onCrosshairMove &&
            chart?.subscribeCrosshairMove(onCrosshairMove);
        onTimeRangeMove &&
            chart?.timeScale().subscribeVisibleTimeRangeChange(onTimeRangeMove);
    };
    const unsubscribeEvents = (previousProps: { onClick: MouseEventHandler; onCrosshairMove: MouseEventHandler; onTimeRangeMove: TimeRangeChangeEventHandler; }) => {
        chart?.unsubscribeClick(previousProps.onClick);
        chart?.unsubscribeCrosshairMove(previousProps.onCrosshairMove);
        chart?.timeScale().unsubscribeVisibleTimeRangeChange(previousProps.onTimeRangeMove);
    };

    const handleTimeRange = () => {
        try {
            if (from && to && chart) {
                if (fitAll) {
                    chart.timeScale().resetTimeScale();
                    chart.timeScale().fitContent();
                } else {
                    chart.timeScale().setVisibleRange({ from, to });
                }
            }
        } catch (e) {
            console.log(e);
        }
    };

    const handleUpdateChart = () => {
        let customOptions = darkTheme ? customDarkTheme : lightTheme;

        customOptions = mergeDeep(customOptions, {
            width: autoWidth
                ? chartDiv.current.parentNode.clientWidth
                : width,
            height: autoHeight
                ? chartDiv.current.parentNode.clientHeight
                : height,
            ...options,
        });

        chart?.applyOptions(customOptions);

        handleSeries();
        handleEvents();
        handleTimeRange();

        if (autoWidth || autoHeight) {
            // resize the chart with the window
            window.addEventListener('resize', resizeHandler);
        }
    };

    React.useEffect(() => {
        const newChart = createChart(chartDiv.current);
        setChart(newChart);
    }, []);

    React.useEffect(() => {
        if (chart) {
            handleUpdateChart();
            resizeHandler();
        }
    }, [chart]);

    React.useEffect(() => {
        !autoWidth && !autoHeight &&
            window.removeEventListener('resize', resizeHandler);
    }, [autoWidth, autoHeight]);

    React.useEffect(() => {
        prevProps && !equal(
            [
                prevProps.onCrosshairMove,
                prevProps.onTimeRangeMove,
                prevProps.onClick,
            ],
            [
                onCrosshairMove,
                onTimeRangeMove,
                onClick,
            ]
        ) && unsubscribeEvents(prevProps);
    }, [prevProps?.onCrosshairMove, prevProps?.onClick, prevProps?.onTimeRangeMove, onCrosshairMove, onTimeRangeMove, onClick]);

    React.useEffect(() => {
        if (
            prevProps && !equal([prevProps.charts, prevProps.options], [charts, options])
        ) {
            removeSeries();
            handleUpdateChart();
        }
    }, [timeScale, prevProps?.charts, charts, prevProps?.options, options]);

    React.useEffect(() => {
        if (!prevProps) return;
        if (prevProps.from !== from || prevProps.to !== to) {
            handleTimeRange();
        }
    }, [prevProps?.from, prevProps?.to, from, to]);

    return (
      <div ref={chartDiv} style={{ position: 'relative' }} />
    );
};

export default BaseChart;
