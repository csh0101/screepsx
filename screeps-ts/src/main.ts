import { ErrorMapper } from "./utils/ErrorMapper";
import { MemoryManager } from "./memory/memory-manager";
import { SpawnManager } from "./managers/spawn/spawn-manager";
import { HarvesterRole } from "./roles/logistics/harvester";
import { UpgraderRole } from "./roles/upgrader";
import { BuilderRole } from "./roles/construction/builder";
import { ROLES } from "./config/constants/creep";
import { ConstructionManager } from "./managers/construction/construction-manager";

// 角色映射
const roleMap = {
  [ROLES.HARVESTER]: new HarvesterRole(),
  [ROLES.UPGRADER]: new UpgraderRole(),
  [ROLES.BUILDER]: new BuilderRole()
};

export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`当前游戏时间: ${Game.time}`);

  try {
    // 清理内存
    MemoryManager.clean();

    // 遍历所有房间
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName];
      
      // 检查并创建 Extension
      ConstructionManager.checkAndCreateExtensions(room);
      
      // 检查并创建道路网络
      if (Game.time % 100 === 0) { // 每 100 ticks 检查一次
        ConstructionManager.checkAndCreateRoads(room);
      }

      // 清理堵塞的建筑工地
      if (Game.time % 50 === 0) { // 每 50 ticks 检查一次
        ConstructionManager.cleanupBlockingSites(room);
      }
      
      // 运行 Spawn 管理器
      for (const spawnName in Game.spawns) {
        SpawnManager.run(Game.spawns[spawnName]);
      }
    }

    // 运行 Creeps
    for (const name in Game.creeps) {
      const creep = Game.creeps[name];
      if (creep.memory.role in roleMap) {
        roleMap[creep.memory.role as keyof typeof roleMap].run(creep);
      }
    }
  } catch (error) {
    // ErrorMapper 会自动捕获这个错误并提供源映射
    throw error;
  }
});
