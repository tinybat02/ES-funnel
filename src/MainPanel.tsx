import React, { PureComponent } from 'react';
import { PanelProps } from '@grafana/data';
import { PanelOptions, Frame } from 'types';
import { Funnel } from './Funnel-React/dist';
import { processData } from './util/helpFunc';

interface Props extends PanelProps<PanelOptions> {}

export class MainPanel extends PureComponent<Props> {
  state = {
    data: [],
  };

  componentDidMount() {
    if (this.props.data.series.length > 0) {
      const series = this.props.data.series as Array<Frame>;
      const data = processData(series);
      this.setState({ data });
    }
  }

  componentDidUpdate(prevProps: PanelProps) {
    if (prevProps.data.series !== this.props.data.series) {
      const seriesOld = prevProps.data.series as Array<Frame>;
      const series = this.props.data.series as Array<Frame>;
      const dataOld = processData(seriesOld);
      const dataNew = processData(series);

      for (let i = 0; i < dataOld.length; i++) {
        if (dataOld[i].quantity !== dataNew[i].quantity) {
          this.setState({ data: dataNew });
          break;
        }
      }
    }
  }

  render() {
    const { width, height } = this.props;
    const { data } = this.state;

    if (data.length === 0) {
      return <div />;
    }

    return (
      <div style={{ width: width, height: height }}>
        <Funnel
          labelKey="label"
          height={height - 100}
          width={width}
          colors={{
            //graph: ['#1890FF', '#BAE7FF'], // array or string : 'red' || '#666'
            graph: ['red', 'orange', 'yellow', 'green'],
            label: '#000',
            value: '#000',
          }}
          valueKey="quantity"
          displayPercent={true}
          data={data}
        />
      </div>
    );
  }
}
