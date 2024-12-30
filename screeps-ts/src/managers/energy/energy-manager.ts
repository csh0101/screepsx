/**
 * 能量管理器，负责管理房间内的能量分配优先级
 */
export class EnergyManager {
  /**
   * 获取需要能量的建筑列表，按优先级排序
   */
  public static getNeedEnergyStructures(room: Room): (StructureSpawn | StructureExtension | StructureTower)[] {
    const structures = room.find(FIND_STRUCTURES, {
      filter: (structure): structure is StructureSpawn | StructureExtension | StructureTower => {
        return (
          (structure.structureType === STRUCTURE_SPAWN ||
           structure.structureType === STRUCTURE_EXTENSION ||
           structure.structureType === STRUCTURE_TOWER) &&
          structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        );
      }
    });

    // 按优先级排序：SPAWN > EXTENSION > TOWER
    return structures.sort((a, b) => {
      const priority = {
        [STRUCTURE_SPAWN]: 3,
        [STRUCTURE_EXTENSION]: 2,
        [STRUCTURE_TOWER]: 1
      };
      return priority[b.structureType] - priority[a.structureType];
    });
  }

  /**
   * 获取最近的需要能量的建筑
   */
  public static getClosestNeedEnergyStructure(pos: RoomPosition): (StructureSpawn | StructureExtension | StructureTower) | null {
    const room = Game.rooms[pos.roomName];
    if (!room) return null;

    const structures = this.getNeedEnergyStructures(room);
    if (structures.length === 0) return null;

    return pos.findClosestByPath(structures);
  }

  /**
   * 获取有能量的建筑列表
   * 用于 Creep 获取能量
   */
  public static getEnergyProviders(room: Room): (StructureSpawn | StructureExtension)[] {
    return room.find(FIND_MY_STRUCTURES, {
      filter: (structure): structure is StructureSpawn | StructureExtension => {
        return (
          (structure.structureType === STRUCTURE_SPAWN ||
           structure.structureType === STRUCTURE_EXTENSION) &&
          structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0
        );
      }
    });
  }

  /**
   * 获取最近的能量提供者
   */
  public static getClosestEnergyProvider(pos: RoomPosition): (StructureSpawn | StructureExtension) | null {
    const room = Game.rooms[pos.roomName];
    if (!room) return null;

    const providers = this.getEnergyProviders(room);
    if (providers.length === 0) return null;

    return pos.findClosestByPath(providers);
  }
}
