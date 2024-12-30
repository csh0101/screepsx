// Memory extension samples
interface CreepMemory {
  role: string;
  room?: string;
  working?: boolean;
  targetId?: Id<any>;
  sourceId?: Id<Source>;
}

interface Memory {
  uuid: number;
  log: any;
}

// `global` extension samples
declare namespace NodeJS {
  interface Global {
    log: any;
  }
}
