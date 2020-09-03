import { Frame } from '../types';

export const processData = (data: Array<Frame>) => {
  let total = 0;
  let visitors = 0;
  console.log('----debug----', data);
  for (let i = 0; i < data.length; i++) {
    const num =
      data[i].fields[0].values.buffer
        .slice()
        .reverse()
        .find(n => n != null) || 0;
    total += num;
    if (data[i].fields[0].name == '60-90m' || data[i].fields[0].name == '90-180m') {
      visitors += num;
    }
  }
  return [
    { label: 'Visitors', quantity: total },
    { label: 'Engaged Customers', quantity: visitors },
    { label: 'Returning Customers', quantity: 0 },
  ];
};
