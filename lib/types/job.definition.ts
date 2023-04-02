export interface IJobOption {}

export interface IJobDefinition {
  name: string;
  cron: string;
  option: IJobOption;
  fn: (...args: any[]) => any;
}
