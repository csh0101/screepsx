import { filter } from 'lodash';
import { ROLES, CREEP_CONFIGS } from '../../config/constants/creep';
import { ConstructionManager } from '../construction/construction-manager';

export class SpawnManager {
  private static getRoleIcon(role: string): string {
    switch (role) {
      case ROLES.HARVESTER:
        return '⛏️'; // 采集者用镐子图标
      case ROLES.UPGRADER:
        return '⚡'; // 升级者用闪电图标
      case ROLES.BUILDER:
        return '🏗️'; // 建造者用建筑图标
      default:
        return '🛠️';
    }
  }

  public static run(spawn: StructureSpawn): void {
    // 获取所有角色的 creep 数量
    const harvesters = filter(Game.creeps, (creep) => creep.memory.role === ROLES.HARVESTER);
    const upgraders = filter(Game.creeps, (creep) => creep.memory.role === ROLES.UPGRADER);
    const builders = filter(Game.creeps, (creep) => creep.memory.role === ROLES.BUILDER);

    // 根据优先级创建 creeps
    if (harvesters.length < CREEP_CONFIGS[ROLES.HARVESTER].minCount) {
      // 1. Harvester 最优先 - 确保能量供应
      const newName = 'Harvester_' + harvesters.length + '_' + Game.time;
      spawn.spawnCreep(CREEP_CONFIGS[ROLES.HARVESTER].body, newName, {
        memory: { role: ROLES.HARVESTER }
      });
    } 
    else if (upgraders.length < CREEP_CONFIGS[ROLES.UPGRADER].minCount) {
      // 2. Upgrader 次优先 - 提升 RCL
      console.log('Upgraders length:', upgraders.length);
      console.log('Upgrader minCount:', CREEP_CONFIGS[ROLES.UPGRADER].minCount);
      console.log('Condition result:', upgraders.length < CREEP_CONFIGS[ROLES.UPGRADER].minCount);
      const newName = 'Upgrader_' + upgraders.length + '_' + Game.time;
      spawn.spawnCreep(CREEP_CONFIGS[ROLES.UPGRADER].body, newName, {
        memory: { role: ROLES.UPGRADER }
      });
    }
    else if (ConstructionManager.needBuilder(spawn.room) && 
             builders.length < CREEP_CONFIGS[ROLES.BUILDER].minCount) {
      // 3. Builder 最后 - 只在有建筑工地时创建
      const newName = 'Builder_' + builders.length + '_' + Game.time;
      spawn.spawnCreep(CREEP_CONFIGS[ROLES.BUILDER].body, newName, {
        memory: { role: ROLES.BUILDER }
      });
    }

    // 显示正在生成的 creep 信息
    if (spawn.spawning) {
      const spawningCreep = Game.creeps[spawn.spawning.name];
      const roleIcon = SpawnManager.getRoleIcon(spawningCreep.memory.role);
      spawn.room.visual.text(
        `${roleIcon} ${spawningCreep.memory.role}`,
        spawn.pos.x + 1,
        spawn.pos.y,
        { align: 'left', opacity: 0.8 }
      );
    }
  }
}
