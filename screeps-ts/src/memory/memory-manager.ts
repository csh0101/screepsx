export class MemoryManager {
  public static clean(): void {
    // 清理死亡 creep 的内存
    for (const name in Memory.creeps) {
      if (!(name in Game.creeps)) {
        delete Memory.creeps[name];
      }
    }

    // 清理旧命名格式的 creep
    for (const name in Game.creeps) {
      if (!name.includes('_')) {
        console.log(`Recycling old format creep: ${name}`);
        Game.creeps[name].suicide();
      }
    }
  }
}
