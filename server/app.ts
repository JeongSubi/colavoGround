import express, { Request, Response, Express, NextFunction } from 'express';
import moment from 'moment-timezone';
import {
  RequestBody,
  ResponseBody,
  DayTimetable,
  Timeslot,
  event,
  workhour,
} from './type/type';

const events: Array<event> = require('./events.ts');
const workhours: Array<workhour> = require('./workhours.ts');

const app = express();
const port: number = 80;

app.use(express.json());
app.use(express.text());

/*
getTimeSlots
*/
app.post('/getTimeSlots', (req: Request, res: Response): void => {
  let {
    start_day_identifier,
    timezone_identifier,
    service_duration,
    days = 1,
    timeslot_interval = 1800,
    is_ignore_schedule = false,
    is_ignore_workhour = false,
  }: RequestBody = req.body;

  /*
  날짜 or timestamp 구하는 함수
  */
  const getDate = function (
    date: string,
    timezone_identifier: string,
    option: string,
  ): any {
    date = date.slice(0, 4) + '-' + date.slice(4, 6) + '-' + date.slice(6);
    let start_day: any;
    if (option === 'getTimeStamp') {
      start_day = moment(date).tz(timezone_identifier).format('YYYY.MM.DD');
    } else if (option === 'getTimeStamp1') {
      start_day = moment(date).tz(timezone_identifier).format('YYYY-MM-DD');
    }
    start_day = Math.floor(new Date(start_day).getTime() / 1000);
    return start_day;
  };

  const result: ResponseBody = [];

  for (let i = 0; i < Number(days); i++) {
    if (is_ignore_schedule === false && is_ignore_workhour === false) {
      let data: any = {};
      let timeStamp: any = getDate(
        start_day_identifier,
        timezone_identifier,
        'getTimeStamp',
      );
      let date: any = getDate(
        start_day_identifier,
        timezone_identifier,
        'getTimeStamp1',
      );

      date = new Date(date * 1000);
      date.setDate(date.getDate() + i);
      let day: number = new Date(date).getDay() + 1;

      let open_interval: any;
      let close_interval: any;

      /*
      start_of_day
      day_modifier
      is_day_off
      */
      for (let m = 0; m < workhours.length; m++) {
        if (workhours[m].weekday === day) {
          open_interval = workhours[m].open_interval;
          close_interval = workhours[m].close_interval;

          data.start_of_day =
            Number(timeStamp) + Number(i * 86400) + open_interval;
          data.day_modifier = i;
          data.is_day_off = workhours[m].is_day_off;

          break;
        }
      }
      if (data.is_day_off === true) {
        continue;
      }

      /*
      timeslots
      */
      open_interval = open_interval + timeStamp + i * 86400;
      close_interval = close_interval + timeStamp + i * 86400;

      let timeslots: Array<Timeslot> = [];
      let timeslot: any = {};
      let dayEvents = events.filter((el: Timeslot) => {
        return el.begin_at >= open_interval && el.begin_at < close_interval;
      });
      // events 더미데이터를 하루의 구간으로 필터링함

      dayEvents.sort((a: event, b: event) => {
        return a.begin_at - b.end_at;
      });
      // 오름차순 정렬

      while (open_interval + timeslot_interval <= close_interval) {
        timeslot.begin_at = open_interval;
        timeslot.end_at = open_interval + timeslot_interval;
        if (dayEvents.length > 0) {
          if (
            (dayEvents[0].begin_at >= open_interval &&
              dayEvents[0].begin_at < close_interval) ||
            (dayEvents[0].end_at > open_interval &&
              dayEvents[0].end_at <= close_interval)
          ) {
            open_interval = open_interval + timeslot_interval;
            continue;
          }
          if (dayEvents[0].end_at <= open_interval) {
            dayEvents.shift();
          }
        }
        timeslots.push({ ...timeslot });
        open_interval = open_interval + timeslot_interval;
      }
      data.timeslots = timeslots;
      result.push(data);
    }
  }
  res.status(200).json(result);
});

app.get('/', (req: Request, res: Response): void => {
  res.send('hello world!');
});

app.listen(port, () => {
  console.log('localhost ' + port + ' opened!');
});
