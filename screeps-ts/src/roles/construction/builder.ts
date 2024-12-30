import { Role } from '../base/role.interface';
import { EnergyManager } from '../../managers/energy/energy-manager';
import { ConstructionManager } from '../../managers/construction/construction-manager';

interface BuilderMemory extends CreepMemory {
  building: boolean;
  role: string;
}

export class BuilderRole implements Role {
  public run(creep: Creep): void {
    const memory = creep.memory as BuilderMemory;

    // 切换状态：当能量满时切换到建造模式，能量空时切换到采集模式
    if (memory.building && creep.store[RESOURCE_ENERGY] === 0) {
      memory.building = false;
      creep.say('🔄 获取能量');
    }
    if (!memory.building && creep.store.getFreeCapacity() === 0) {
      memory.building = true;
      creep.say('🚧 建造');
    }

    if (memory.building) {
      // 首先尝试修理建筑
      const repairTarget = ConstructionManager.getClosestRepairTarget(creep.pos);
      if (repairTarget) {
        if (creep.repair(repairTarget) === ERR_NOT_IN_RANGE) {
          creep.moveTo(repairTarget, { 
            visualizePathStyle: { stroke: '#ffffff' },
            reusePath: 20
          });
        }
        return;
      }

      // 如果没有需要修理的建筑，寻找建筑工地
      const constructionSite = ConstructionManager.getClosestConstructionSite(creep.pos);
      if (constructionSite) {
        if (creep.build(constructionSite) === ERR_NOT_IN_RANGE) {
          creep.moveTo(constructionSite, { 
            visualizePathStyle: { stroke: '#ffffff' },
            reusePath: 20
          });
        }
        return;
      }

      // 如果既没有需要修理的建筑，也没有建筑工地，闲置
      creep.say('🚬 idle');
    } else {
      // 从最近的能量提供者获取能量
      const energyProvider = EnergyManager.getClosestEnergyProvider(creep.pos);
      
      if (energyProvider) {
        if (creep.withdraw(energyProvider, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(energyProvider, { 
            visualizePathStyle: { stroke: '#ffaa00' },
            reusePath: 20
          });
        }
      } else {
        // 如果找不到能量提供者，从能量源获取能量
        const sources = creep.room.find(FIND_SOURCES);
        if (sources.length > 0) {
          const source = creep.pos.findClosestByPath(sources);
          if (source && creep.harvest(source) === ERR_NOT_IN_RANGE) {
            creep.moveTo(source, { 
              visualizePathStyle: { stroke: '#ffaa00' },
              reusePath: 20
            });
          }
        }
      }
    }
  }
}
