import { Frame } from '../types';

export const processData = (data: Array<Frame>) => {
  let total = 0;
  let visitors = 0;
  for (let i = 0; i < data.length; i++) {
    const num = data[i].fields[0].values.buffer.reverse().find(n => n != null) || 0;
    total += num;
    if (data[i].fields[0].name == '01-180m') {
      visitors = num;
    }
  }
  return [
    { label: 'Bypassers', quantity: total },
    { label: 'Visitors', quantity: visitors },
    { label: 'Returning Customers', quantity: 0 },
  ];
};
