import { Frame } from '../types';

export const processData = (data: Array<Frame>) => {
  let total = 0;
  let visitors = 0;
  for (let i = 0; i < data.length; i++) {
    total += data[i].fields[0].values.buffer.reverse().find(n => n != null) || 0;
    if (data[i].fields[0].name == '01-180m') {
      visitors = data[i].fields[0].values.buffer.reverse().find(n => n != null) || 0;
    }
  }
  return [
    { label: 'Total Detected', quantity: total },
    { label: 'Visitors', quantity: visitors },
    { label: 'Returning Customers', quantity: 0 },
  ];
};
