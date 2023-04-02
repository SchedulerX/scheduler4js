export interface IJob {
  addToRunningJobs(): Promise<void>;
  addToFailedJobs(): Promise<void>;
  changeJobStatus(): Promise<void>;
  run(): Promise<void>;
  isExpired(): boolean;
}
