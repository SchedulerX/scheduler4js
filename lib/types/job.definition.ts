export interface IJobOption {}

export interface IJobDefinition {
  name: string;
  cron: string;
  option: IJobOption;
  concurrency: number;
  running: number;
  data: any;
  fn: (...args: any[]) => any;
}
