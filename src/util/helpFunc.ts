import { Frame } from '../types';
import fromUnixTime from 'date-fns/fromUnixTime';
import { formatToTimeZone } from 'date-fns-timezone';

const getDay = (date: Date) => {
  return parseInt(formatToTimeZone(date, 'D', { timeZone: 'Europe/Athens' }));
};

const getHour = (date: Date) => {
  return parseInt(formatToTimeZone(date, 'HH', { timeZone: 'Europe/Athens' }));
};

const getDayFromUnix = (unix: number) => {
  const date = fromUnixTime(unix);
  return formatToTimeZone(date, 'D/M', { timeZone: 'Europe/Athens' });
};

export const processData = (data: Array<Frame>) => {
  const first_time = data[0].fields[1].values.buffer[0];
  const end_time = data[0].fields[1].values.buffer[data[0].fields[1].values.buffer.length - 1];

  if (first_time && end_time) {
    const day1 = getDay(fromUnixTime(first_time / 1000));
    const hour1 = getHour(fromUnixTime(first_time / 1000));

    const day2 = getDay(fromUnixTime(end_time / 1000));
    const hour2 = getHour(fromUnixTime(end_time / 1000));

    if (((day1 == day2 && hour1 < 8) || (day2 - day1 == 1 && hour1 >= 22)) && hour2 >= 8) {
      let total = 0;
      let visitors = 0;
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
    } else if ((day1 == day2 || (day2 - day1 == 1 && hour1 >= 22)) && hour2 < 8) {
      return [
        { label: 'Visitors', quantity: 0 },
        { label: 'Engaged Customers', quantity: 0 },
        { label: 'Returning Customers', quantity: 0 },
      ];
    } else if (day1 == day2 && hour1 >= 22 && hour2 >= 22) {
      return [
        { label: 'Visitors', quantity: 0 },
        { label: 'Engaged Customers', quantity: 0 },
        { label: 'Returning Customers', quantity: 0 },
      ];
    } else if (day1 == day2 && hour1 >= 8 && hour2 >= hour1) {
      let total1 = 0,
        visitors1 = 0,
        total2 = 0,
        visitors2 = 0;
      for (let i = 0; i < data.length; i++) {
        const num1 = data[i].fields[0].values.buffer.slice().find(n => n != null) || 0;
        const num2 =
          data[i].fields[0].values.buffer
            .slice()
            .reverse()
            .find(n => n != null) || 0;
        total1 += num1;
        total2 += num2;
        if (data[i].fields[0].name == '60-90m' || data[i].fields[0].name == '90-180m') {
          visitors1 += num1;
          visitors2 += num2;
        }
      }
      const visited = total2 - total1 >= 0 ? total2 - total1 : 0;
      const engaged = visitors2 - visitors1 >= 0 ? visitors2 - visitors1 : 0;

      return [
        { label: 'Visitors', quantity: visited },
        { label: 'Engaged Customers', quantity: engaged },
        { label: 'Returning Customers', quantity: 0 },
      ];
    } else {
      const dayList: Array<string> = [];
      const timeSplitByDay = data[0].fields[1].values.buffer.reduce((res: { [key: string]: Array<number> }, cur) => {
        if (cur) {
          const day = getDayFromUnix(cur / 1000);
          if (!res[day]) {
            res[day] = [];
            dayList.push(day);
          }

          res[day].push(cur / 1000);
          return res;
        }
        return res;
      }, {});

      const valuesObj: { [key: string]: Array<{ name: string; list: Array<number | null> }> } = {};
      const track_idx = dayList
        .map(dayLabel => {
          return timeSplitByDay[dayLabel].length;
        })
        .map((s => (a: number) => (s += a))(0));

      dayList.map((dayLabel, idx) => {
        valuesObj[dayLabel] = [];
        const startIdx = idx > 0 ? track_idx[idx - 1] : 0;
        const endIdx = track_idx[idx];
        for (let i = 0; i < data.length; i++) {
          valuesObj[dayLabel].push({
            name: data[i].fields[0].name,
            list: data[i].fields[0].values.buffer.slice(startIdx, endIdx),
          });
        }
      });

      let visited = 0,
        engaged = 0;
      dayList.map(dayLabel => {
        const timeArray = timeSplitByDay[dayLabel];
        const first_time = timeArray[0];
        const last_time = timeArray[timeArray.length - 1];

        const hour1 = getHour(fromUnixTime(first_time / 1000));
        const hour2 = getHour(fromUnixTime(last_time / 1000));
        if (hour1 >= 22) {
          return;
        }

        if (hour2 < 8) {
          return;
        }

        if (hour1 < 8) {
          let total = 0,
            visitors = 0;
          valuesObj[dayLabel].map(category => {
            const num =
              category.list
                .slice()
                .reverse()
                .find(n => n != null) || 0;
            total += num;
            if (category.name == '60-90m' || category.name == '90-180m') {
              visitors += num;
            }
          });
          visited += total;
          engaged += visitors;
        }

        if (hour1 >= 8) {
          let total1 = 0,
            visitors1 = 0,
            total2 = 0,
            visitors2 = 0;
          valuesObj[dayLabel].map(category => {
            const num1 = category.list.slice().find(n => n != null) || 0;
            const num2 =
              category.list
                .slice()
                .reverse()
                .find(n => n != null) || 0;
            total1 += num1;
            total2 += num2;
            if (category.name == '60-90m' || category.name == '90-180m') {
              visitors1 += num1;
              visitors2 += num2;
            }
          });
          const total_final = total2 - total1 > 0 ? total2 - total1 : 0;
          const visitors_final = visitors2 - visitors1 > 0 ? visitors2 - visitors1 : 0;

          visited += total_final;
          engaged += visitors_final;
        }
      });

      return [
        { label: 'Visitors', quantity: visited },
        { label: 'Engaged Customers', quantity: engaged },
        { label: 'Returning Customers', quantity: 0 },
      ];
    }
  }

  return [
    { label: 'Visitors', quantity: 0 },
    { label: 'Engaged Customers', quantity: 0 },
    { label: 'Returning Customers', quantity: 0 },
  ];
};
