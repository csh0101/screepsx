export const ROLES = {
  HARVESTER: 'harvester',
  UPGRADER: 'upgrader',
  BUILDER: 'builder'
} as const;

/**
 * Creep 配置
 * 
 * RCL 1 (300能量):
 * - 4个 Harvester: 基础配置，分散采集两个能量源
 * - 2个 Upgrader: 双WORK部件，加速升级控制器
 * - 0个 Builder: RCL 1阶段不需要
 * 
 * TODO - RCL 2 (550能量 = 300 + 5个Extension*50):
 * - Harvester: [WORK, WORK, CARRY, CARRY, MOVE, MOVE] (400能量)
 *   - 2个WORK：每tick采集4能量
 *   - 2个CARRY：更大的能量储存
 *   - 2个MOVE：满载也能正常移动
 * 
 * - Upgrader: [WORK, WORK, WORK, CARRY, MOVE, MOVE] (500能量)
 *   - 3个WORK：每tick升级3点
 *   - 1个CARRY：储存能量
 *   - 2个MOVE：保持机动性
 * 
 * - Builder: [WORK, WORK, CARRY, CARRY, MOVE, MOVE] (400能量)
 *   - 用于建造Extension和其他建筑
 *   - 2个WORK加快建造速度
 *   - 2个CARRY提高效率
 */
export const CREEP_CONFIGS = {
  [ROLES.HARVESTER]: {
    minCount: 10,
    body: [WORK, CARRY, MOVE] as BodyPartConstant[]  // 200能量
  },
  [ROLES.UPGRADER]: {
    minCount: 0,
    body: [WORK, WORK, CARRY, MOVE] as BodyPartConstant[]  // 300能量，适合RCL 1
  },
  [ROLES.BUILDER]: {
    minCount: 3,  // 只需要1个建造者
    body: [WORK, CARRY, MOVE] as BodyPartConstant[] // 200能量，和harvester一样的配置
  }
} as const;
