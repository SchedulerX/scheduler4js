import { EventEmitter } from "events";
import { IScheduler } from "./types/scheduler";

export class Scheduler extends EventEmitter implements IScheduler {}
