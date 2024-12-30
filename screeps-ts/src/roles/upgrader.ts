import { Role } from './base/role.interface';

interface UpgraderMemory extends CreepMemory {
  upgrading: boolean;
  role: string;
}

export class UpgraderRole implements Role {
  public run(creep: Creep): void {
    const memory = creep.memory as UpgraderMemory;

    // 状态切换
    if (memory.upgrading && creep.store[RESOURCE_ENERGY] === 0) {
      memory.upgrading = false;
      creep.say('🔄 获取能量');
    }
    if (!memory.upgrading && creep.store.getFreeCapacity() === 0) {
      memory.upgrading = true;
      creep.say('⚡ 升级');
    }

    if (memory.upgrading) {
      // 升级控制器
      if (creep.room.controller) {
        if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
          creep.moveTo(creep.room.controller, { 
            visualizePathStyle: { stroke: '#ffffff' },
            reusePath: 20
          });
        }
      }
    } else {
      // 获取能量的优先级：
      // 1. 从最近的 Spawn/Extension 获取能量
      const structures = creep.room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => {
          return (structure.structureType === STRUCTURE_SPAWN ||
                 structure.structureType === STRUCTURE_EXTENSION) &&
                 structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
        }
      });

      if (structures.length > 0) {
        // 找到最近的能量建筑
        const closestStructure = creep.pos.findClosestByPath(structures);
        if (closestStructure) {
          if (creep.withdraw(closestStructure, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(closestStructure, { 
              visualizePathStyle: { stroke: '#ffaa00' },
              reusePath: 20
            });
          }
          return;
        }
      }

      // 2. 如果没有可用的建筑，从最近的能量源采集
      if (creep.room.controller) {
        // 找到离控制器最近的能量源
        const sources = creep.room.find(FIND_SOURCES);
        const closestSource = creep.room.controller.pos.findClosestByPath(sources);
        
        if (closestSource) {
          if (creep.harvest(closestSource) === ERR_NOT_IN_RANGE) {
            creep.moveTo(closestSource, { 
              visualizePathStyle: { stroke: '#ffaa00' },
              reusePath: 20
            });
          }
        }
      }
    }
  }
}
