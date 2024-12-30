/**
 * 建筑相关配置
 */
export const CONSTRUCTION_CONFIG = {
  // Extension 相关配置
  EXTENSION: {
    // Extension 分布配置
    DISTRIBUTION: {
      SPAWN_CLUSTER: {
        COUNT: 10,           // Spawn 周围的 Extension 数量
        MIN_DISTANCE: 2,     // 距离 Spawn 的最小距离
        MAX_DISTANCE: 5      // 距离 Spawn 的最大距离
      },
      SOURCE_CLUSTER: {
        COUNT_PER_SOURCE: 5, // 每个能量源周围的 Extension 数量
        MIN_DISTANCE: 2,     // 距离能量源的最小距离
        MAX_DISTANCE: 4      // 距离能量源的最大距离
      }
    },
    // 建筑间距配置
    SPACING: {
      MIN_SPACE_TO_SPAWN: 2,    // 与 Spawn 的最小间距
      MIN_SPACE_TO_SOURCE: 2,   // 与能量源的最小间距
      MIN_SPACE_BETWEEN: 1      // Extension 之间的最小间距
    },
    // 搜索和检查配置
    SEARCH_RANGE: 7,            // 搜索范围
    NEARBY_CHECK_RANGE: 1,      // 检查周围建筑的范围
    MAX_NEARBY_STRUCTURES: 4,   // 周围允许的最大建筑数量
    MIN_FREE_DIRECTIONS: 3      // 需要保持空闲的最小方向数
  },

  // Extension 数量配置
  EXTENSION_COUNT: {
    0: 0,   // RCL 0
    1: 0,   // RCL 1
    2: 5,   // RCL 2
    3: 10,  // RCL 3
    4: 20,  // RCL 4
    5: 30,  // RCL 5
    6: 40,  // RCL 6
    7: 50,  // RCL 7
    8: 60   // RCL 8
  } as const,

  // 道路相关配置
  ROAD: {
    MIN_SITES_FOR_ROAD: 5,     // 触发道路建设的最小建筑工地数量
    EXTENSION_ROAD_INTERVAL: 2  // Extension 群之间的道路间隔
  },

  // 修理相关配置
  REPAIR: {
    WALL_HITS_LIMIT: 10000     // 墙和城墙的生命值上限
  }
} as const;
