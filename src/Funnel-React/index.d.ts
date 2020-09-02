export class Funnel extends React.Component<FunnelProps> {}

interface FunnelProps {
  label?: string;
  width: number;
  height: number;

  labelKey: string;
  valueKey: string;
  colors: any;
  displayPercent: boolean;
  data: Array<{}>;
}
