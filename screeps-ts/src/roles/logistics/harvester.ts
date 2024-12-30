import { Role } from '../base/role.interface';
import { EnergyManager } from '../../managers/energy/energy-manager';

interface HarvesterMemory extends CreepMemory {
  harvesting: boolean;
  role: string;
}

export class HarvesterRole implements Role {
  public run(creep: Creep): void {
    const memory = creep.memory as HarvesterMemory;

    // 状态切换
    if (!memory.harvesting && creep.store[RESOURCE_ENERGY] === 0) {
      memory.harvesting = true;
      creep.say('⛏️ 采集');
    }
    if (memory.harvesting && creep.store.getFreeCapacity() === 0) {
      memory.harvesting = false;
      creep.say('🔄 存储');
    }

    if (memory.harvesting) {
      const sources = creep.room.find(FIND_SOURCES);
      // 根据 creep 名字来分配不同的能量源
      const sourceIndex = parseInt(creep.name.split('_')[1]) % sources.length;
      if (creep.harvest(sources[sourceIndex]) === ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[sourceIndex], { 
          visualizePathStyle: { stroke: '#ffaa00' },
          reusePath: 20
        });
      }
    } else {
      // 获取最近的需要能量的建筑
      const target = EnergyManager.getClosestNeedEnergyStructure(creep.pos);
      
      if (target) {
        if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(target, { 
            visualizePathStyle: { stroke: '#ffffff' },
            reusePath: 20
          });
        }
      } else {
        // 如果没有需要能量的建筑，显示空闲状态
        creep.say('💤 空闲');
      }
    }
  }
}
