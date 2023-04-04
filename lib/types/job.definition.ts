export interface IJobOption {
  name: string;
  type?: string;
  timezone?: string;
  cron: string;
  concurrency?: number;
  lockLimit?: number;
  data?: any;
  fn: (...args: any[]) => any;
}

export interface IJobDefinition {
  option: IJobOption;
  running: number;
  lock?: number;
}
