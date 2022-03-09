interface RequestBody {
  start_day_identifier: string;
  timezone_identifier: string;
  service_duration: number;
  days?: number;
  timeslot_interval?: number;
  is_ignore_schedule?: boolean;
  is_ignore_workhour?: boolean;
}

type ResponseBody = DayTimetable[];

interface DayTimetable {
  start_of_day: number;
  day_modifier: number;
  is_day_off: boolean;
  timeslots: Timeslot[];
}

interface Timeslot {
  begin_at: number;
  end_at: number;
}

interface event {
  begin_at: number;
  end_at: number;
  created_at: number;
  updated_at: number;
}

interface workhour {
  close_interval: number;
  is_day_off: boolean;
  key: string;
  open_interval: number;
  weekday: number;
}

export { RequestBody, ResponseBody, DayTimetable, Timeslot, event, workhour };
