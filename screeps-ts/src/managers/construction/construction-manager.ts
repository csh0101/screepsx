import { CONSTRUCTION_CONFIG } from "../../config/constants/construction";

/**
 * 建筑工地管理器
 */
export class ConstructionManager {
  // 建筑优先级映射
  private static readonly STRUCTURE_PRIORITY: Record<StructureConstant, number> = {
    // 核心建筑 - 最高优先级
    [STRUCTURE_SPAWN]: 8,      // Spawn: 用于创建 creep，是房间最重要的建筑
    [STRUCTURE_EXTENSION]: 7,  // Extension: 为 Spawn 提供额外能量，用于创建更强大的 creep
    [STRUCTURE_TOWER]: 6,      // Tower: 防御建筑，可以攻击敌人、治疗友军、维修建筑

    // 资源存储建筑 - 中高优先级
    [STRUCTURE_STORAGE]: 5,    // Storage: 大容量存储建筑，可以存储各种资源
    [STRUCTURE_CONTAINER]: 4,  // Container: 资源存储建筑，通常建在能量源旁边

    // 基础设施 - 中等优先级
    [STRUCTURE_ROAD]: 3,       // Road: 道路，提高 creep 移动速度
    [STRUCTURE_WALL]: 2,       // Wall: 城墙，用于防御
    [STRUCTURE_RAMPART]: 1,    // Rampart: 城墙，可以让友军穿过

    // 特殊建筑 - 按需建造，基础优先级为 0
    [STRUCTURE_LINK]: 0,       // Link: 用于远程传送能量
    [STRUCTURE_TERMINAL]: 0,   // Terminal: 用于跨房间交易资源
    [STRUCTURE_LAB]: 0,        // Lab: 用于生产和反应化合物
    [STRUCTURE_FACTORY]: 0,    // Factory: 用于生产商品
    [STRUCTURE_NUKER]: 0,      // Nuker: 超远程攻击建筑
    [STRUCTURE_OBSERVER]: 0,   // Observer: 用于侦察其他房间
    [STRUCTURE_POWER_SPAWN]: 0,// Power Spawn: 处理 Power 资源
    [STRUCTURE_EXTRACTOR]: 0,  // Extractor: 用于开采矿物
    
    // 系统建筑 - 不可建造，优先级为 0
    [STRUCTURE_CONTROLLER]: 0, // Controller: 房间控制器，不可建造
    [STRUCTURE_KEEPER_LAIR]: 0,// Keeper Lair: 守护者巢穴，自然生成
    [STRUCTURE_PORTAL]: 0,     // Portal: 传送门，自然生成
    [STRUCTURE_POWER_BANK]: 0, // Power Bank: 能量库，自然生成
    [STRUCTURE_INVADER_CORE]: 0// Invader Core: 入侵者核心，NPC建筑
  };

  // RCL等级对应的Extension数量
  private static readonly EXTENSION_COUNT: Record<number, number> = CONSTRUCTION_CONFIG.EXTENSION_COUNT;

  /**
   * 获取房间内所有建筑工地，按优先级排序
   */
  public static getConstructionSites(room: Room): ConstructionSite[] {
    const sites = room.find(FIND_CONSTRUCTION_SITES);
    
    // 按优先级排序
    return sites.sort((a, b) => {
      // 获取建筑类型的优先级
      const priorityA = this.STRUCTURE_PRIORITY[a.structureType];
      const priorityB = this.STRUCTURE_PRIORITY[b.structureType];
      
      // 优先级高的排在前面
      if (priorityA !== priorityB) {
        return priorityB - priorityA;
      }
      
      // 如果优先级相同，优先建造进度较高的
      return (b.progress / b.progressTotal) - (a.progress / a.progressTotal);
    });
  }

  /**
   * 获取最近的建筑工地
   */
  public static getClosestConstructionSite(pos: RoomPosition): ConstructionSite | null {
    const room = Game.rooms[pos.roomName];
    if (!room) return null;

    const sites = this.getConstructionSites(room);
    if (sites.length === 0) return null;

    return pos.findClosestByPath(sites);
  }

  /**
   * 获取建筑工地的总数
   */
  public static getConstructionSiteCount(room: Room): number {
    return room.find(FIND_CONSTRUCTION_SITES).length;
  }

  /**
   * 检查是否需要 Builder
   * 当有建筑工地时返回 true
   */
  public static needBuilder(room: Room): boolean {
    return this.getConstructionSiteCount(room) > 0;
  }

  /**
   * 创建道路建筑工地
   * 在两点之间创建道路
   */
  public static createRoad(from: RoomPosition, to: RoomPosition): ScreepsReturnCode {
    const room = Game.rooms[from.roomName];
    if (!room) return ERR_NOT_FOUND;

    const path = room.findPath(from, to, {
      ignoreCreeps: true,
      swampCost: 1
    });

    let result: ScreepsReturnCode = OK;
    for (const pos of path) {
      const returnCode = room.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD);
      if (returnCode !== OK && result === OK) {
        result = returnCode;
      }
    }

    return result;
  }

  /**
   * 检查并创建主要道路网络
   * 在重要建筑之间创建道路
   */
  public static checkAndCreateRoads(room: Room): void {
    // 获取所有 spawn
    const spawns = room.find(FIND_MY_SPAWNS);
    if (spawns.length === 0) return;

    // 获取能量源
    const sources = room.find(FIND_SOURCES);
    
    // 获取控制器
    const controller = room.controller;

    // 在每个 Spawn 之间创建道路网络
    for (let i = 0; i < spawns.length; i++) {
      const spawn = spawns[i];
      
      // 连接到其他 Spawn
      for (let j = i + 1; j < spawns.length; j++) {
        this.createRoad(spawn.pos, spawns[j].pos);
      }

      // 连接到能量源
      for (const source of sources) {
        // 找到最近的 Spawn
        const closestSpawn = source.pos.findClosestByPath(spawns);
        // 如果当前 Spawn 是最近的，才创建道路
        if (closestSpawn && closestSpawn.id === spawn.id) {
          this.createRoad(spawn.pos, source.pos);
        }
      }

      // 连接到 Controller
      if (controller) {
        // 找到最近的 Spawn
        const closestSpawn = controller.pos.findClosestByPath(spawns);
        // 如果当前 Spawn 是最近的，才创建道路
        if (closestSpawn && closestSpawn.id === spawn.id) {
          this.createRoad(spawn.pos, controller.pos);
        }
      }
    }

    // 处理建筑工地
    const sites = room.find(FIND_CONSTRUCTION_SITES);
    if (sites.length >= CONSTRUCTION_CONFIG.ROAD.MIN_SITES_FOR_ROAD) {
      // 计算建筑工地的中心点
      const centerX = Math.floor(sites.reduce((sum, site) => sum + site.pos.x, 0) / sites.length);
      const centerY = Math.floor(sites.reduce((sum, site) => sum + site.pos.y, 0) / sites.length);
      const centerPos = new RoomPosition(centerX, centerY, room.name);
      
      // 找到最近的 Spawn
      const closestSpawn = centerPos.findClosestByPath(spawns);
      if (closestSpawn) {
        this.createRoad(closestSpawn.pos, centerPos);
      }
    }
  }

  /**
   * 检查一个位置是否适合建造 Extension
   */
  private static isValidExtensionPosition(
    room: Room,
    pos: RoomPosition,
    spawn: StructureSpawn,
    sources: Source[],
    terrain: RoomTerrain
  ): boolean {
    // 检查地形
    if (terrain.get(pos.x, pos.y) === TERRAIN_MASK_WALL) return false;

    // 检查是否已经有建筑或建筑工地
    const structures = room.lookForAt(LOOK_STRUCTURES, pos.x, pos.y);
    const sites = room.lookForAt(LOOK_CONSTRUCTION_SITES, pos.x, pos.y);
    if (structures.length > 0 || sites.length > 0) return false;

    // 检查与 Spawn 的距离
    if (pos.inRangeTo(spawn, CONSTRUCTION_CONFIG.EXTENSION.SPACING.MIN_SPACE_TO_SPAWN)) return false;

    // 检查与能量源的距离
    for (const source of sources) {
      if (pos.inRangeTo(source, CONSTRUCTION_CONFIG.EXTENSION.SPACING.MIN_SPACE_TO_SOURCE)) return false;
    }

    // 检查空闲方向数量
    const directions = [
      [0, 1], [1, 1], [1, 0], [1, -1],
      [0, -1], [-1, -1], [-1, 0], [-1, 1]
    ];
    let freeDirections = 0;
    for (const [dx, dy] of directions) {
      const px = pos.x + dx;
      const py = pos.y + dy;
      if (px < 1 || px > 48 || py < 1 || py > 48) continue;
      if (terrain.get(px, py) === TERRAIN_MASK_WALL) continue;
      const nearStructures = room.lookForAt(LOOK_STRUCTURES, px, py);
      const nearSites = room.lookForAt(LOOK_CONSTRUCTION_SITES, px, py);
      if (nearStructures.every(s => s.structureType === STRUCTURE_ROAD) && 
          nearSites.every(s => s.structureType === STRUCTURE_ROAD)) {
        freeDirections++;
      }
    }
    return freeDirections >= CONSTRUCTION_CONFIG.EXTENSION.MIN_FREE_DIRECTIONS;
  }

  /**
   * 为 Spawn 周围创建 Extension 集群
   */
  private static createSpawnClusterExtensions(
    room: Room,
    spawn: StructureSpawn,
    sources: Source[],
    terrain: RoomTerrain,
    maxExtensions: number
  ): number {
    let created = 0;
    const config = CONSTRUCTION_CONFIG.EXTENSION.DISTRIBUTION.SPAWN_CLUSTER;
    const targetCount = Math.min(config.COUNT, maxExtensions);

    // 在 Spawn 周围螺旋形搜索位置
    const spiral: Array<[number, number]> = [];
    for (let r = config.MIN_DISTANCE; r <= config.MAX_DISTANCE; r++) {
      for (let x = -r; x <= r; x++) {
        for (let y = -r; y <= r; y++) {
          if (Math.abs(x) === r || Math.abs(y) === r) {
            spiral.push([x, y]);
          }
        }
      }
    }

    // 随机打乱位置顺序，使布局更自然
    spiral.sort(() => Math.random() - 0.5);

    for (const [dx, dy] of spiral) {
      if (created >= targetCount) break;

      const x = spawn.pos.x + dx;
      const y = spawn.pos.y + dy;
      if (x < 1 || x > 48 || y < 1 || y > 48) continue;

      const pos = new RoomPosition(x, y, room.name);
      if (this.isValidExtensionPosition(room, pos, spawn, sources, terrain)) {
        const result = room.createConstructionSite(x, y, STRUCTURE_EXTENSION);
        if (result === OK) created++;
      }
    }

    return created;
  }

  /**
   * 检查一个位置是否适合在能量源附近建造 Extension
   */
  private static isValidSourceExtensionPosition(
    room: Room,
    pos: RoomPosition,
    source: Source,
    terrain: RoomTerrain,
    structures: Structure[]
  ): boolean {
    // 检查地形
    if (terrain.get(pos.x, pos.y) === TERRAIN_MASK_WALL) return false;

    // 检查是否已经有建筑或建筑工地
    const existingStructures = room.lookForAt(LOOK_STRUCTURES, pos.x, pos.y);
    const sites = room.lookForAt(LOOK_CONSTRUCTION_SITES, pos.x, pos.y);
    if (existingStructures.length > 0 || sites.length > 0) return false;

    // 检查与现有建筑的距离
    for (const structure of structures) {
      if (pos.inRangeTo(structure.pos, CONSTRUCTION_CONFIG.EXTENSION.SPACING.MIN_SPACE_BETWEEN)) {
        return false;
      }
    }

    // 检查与能量源的距离
    if (pos.inRangeTo(source, CONSTRUCTION_CONFIG.EXTENSION.SPACING.MIN_SPACE_TO_SOURCE)) return false;

    // 检查空闲方向数量
    const directions = [
      [0, 1], [1, 1], [1, 0], [1, -1],
      [0, -1], [-1, -1], [-1, 0], [-1, 1]
    ];
    let freeDirections = 0;
    for (const [dx, dy] of directions) {
      const px = pos.x + dx;
      const py = pos.y + dy;
      if (px < 1 || px > 48 || py < 1 || py > 48) continue;
      if (terrain.get(px, py) === TERRAIN_MASK_WALL) continue;
      const nearStructures = room.lookForAt(LOOK_STRUCTURES, px, py);
      const nearSites = room.lookForAt(LOOK_CONSTRUCTION_SITES, px, py);
      if (nearStructures.every(s => s.structureType === STRUCTURE_ROAD) && 
          nearSites.every(s => s.structureType === STRUCTURE_ROAD)) {
        freeDirections++;
      }
    }
    return freeDirections >= CONSTRUCTION_CONFIG.EXTENSION.MIN_FREE_DIRECTIONS;
  }

  /**
   * 为能量源周围创建 Extension 集群
   */
  private static createSourceClusterExtensions(
    room: Room,
    source: Source,
    terrain: RoomTerrain,
    maxExtensions: number
  ): number {
    let created = 0;
    const config = CONSTRUCTION_CONFIG.EXTENSION.DISTRIBUTION.SOURCE_CLUSTER;
    const targetCount = Math.min(config.COUNT_PER_SOURCE, maxExtensions);

    // 获取房间内所有建筑，用于检查间距
    const structures = room.find(FIND_STRUCTURES);

    // 在能量源周围螺旋形搜索位置
    const spiral: Array<[number, number]> = [];
    for (let r = config.MIN_DISTANCE; r <= config.MAX_DISTANCE; r++) {
      for (let x = -r; x <= r; x++) {
        for (let y = -r; y <= r; y++) {
          if (Math.abs(x) === r || Math.abs(y) === r) {
            spiral.push([x, y]);
          }
        }
      }
    }

    // 随机打乱位置顺序，使布局更自然
    spiral.sort(() => Math.random() - 0.5);

    for (const [dx, dy] of spiral) {
      if (created >= targetCount) break;

      const x = source.pos.x + dx;
      const y = source.pos.y + dy;
      if (x < 1 || x > 48 || y < 1 || y > 48) continue;

      const pos = new RoomPosition(x, y, room.name);
      if (this.isValidSourceExtensionPosition(room, pos, source, terrain, structures)) {
        const result = room.createConstructionSite(x, y, STRUCTURE_EXTENSION);
        if (result === OK) created++;
      }
    }

    return created;
  }

  /**
   * 检查并创建 Extension
   */
  public static checkAndCreateExtensions(room: Room): void {
    // 获取当前的 Extension 数量
    const extensions = room.find(FIND_MY_STRUCTURES, {
      filter: (structure): structure is StructureExtension => 
        structure.structureType === STRUCTURE_EXTENSION
    });

    // 获取当前等级允许的 Extension 数量
    const level = room.controller?.level || 0;
    const maxExtensions = (CONSTRUCTION_CONFIG.EXTENSION_COUNT as {[key: number]: number})[level] || 0;

    // 如果已经达到最大数量，不需要创建
    if (extensions.length >= maxExtensions) return;

    // 获取所有 Spawn
    const spawns = room.find(FIND_MY_SPAWNS);
    if (spawns.length === 0) return;

    // 获取能量源
    const sources = room.find(FIND_SOURCES);
    
    // 获取地形
    const terrain = room.getTerrain();

    // 计算还需要创建的数量
    let remainingExtensions = maxExtensions - extensions.length;

    // 首先在 Spawn 周围创建 Extension
    for (const spawn of spawns) {
      const created = this.createSpawnClusterExtensions(room, spawn, sources, terrain, remainingExtensions);
      remainingExtensions -= created;
      if (remainingExtensions <= 0) return;
    }

    // 然后在每个能量源周围创建 Extension
    for (const source of sources) {
      const created = this.createSourceClusterExtensions(room, source, terrain, remainingExtensions);
      remainingExtensions -= created;
      if (remainingExtensions <= 0) return;
    }
  }

  /**
   * 检查建筑工地是否阻塞了重要路径
   */
  private static isBlockingImportantPaths(
    room: Room,
    site: ConstructionSite,
    spawn: StructureSpawn,
    sources: Source[]
  ): boolean {
    // 临时移除建筑工地
    site.remove();
    let isBlocking = false;

    try {
      // 检查到 Spawn 的路径
      const pathToSpawn = room.findPath(site.pos, spawn.pos, {
        ignoreCreeps: true,
        maxOps: 200,
        ignoreDestructibleStructures: true
      });
      if (pathToSpawn.length === 0) {
        isBlocking = true;
        return true;
      }

      // 检查到能量源的路径
      for (const source of sources) {
        const pathToSource = room.findPath(spawn.pos, source.pos, {
          ignoreCreeps: true,
          maxOps: 200,
          ignoreDestructibleStructures: true
        });
        if (pathToSource.length === 0) {
          isBlocking = true;
          return true;
        }
      }

      // 检查 Extension 集群之间的连通性
      const extensions = room.find(FIND_MY_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_EXTENSION
      }) as StructureExtension[];

      // 将 Extension 按距离分组
      const clusters: { center: RoomPosition, extensions: StructureExtension[] }[] = [];
      const assignedExtensions = new Set<string>();

      for (const extension of extensions) {
        if (assignedExtensions.has(extension.id)) continue;

        // 找到这个 Extension 周围的其他 Extension
        const nearbyExtensions = extensions.filter(e => 
          !assignedExtensions.has(e.id) && 
          e.pos.inRangeTo(extension.pos, 3)
        );

        if (nearbyExtensions.length > 0) {
          // 计算集群中心
          const centerX = Math.floor(nearbyExtensions.reduce((sum, e) => sum + e.pos.x, extension.pos.x) / (nearbyExtensions.length + 1));
          const centerY = Math.floor(nearbyExtensions.reduce((sum, e) => sum + e.pos.y, extension.pos.y) / (nearbyExtensions.length + 1));
          const center = new RoomPosition(centerX, centerY, room.name);

          clusters.push({
            center,
            extensions: [extension, ...nearbyExtensions]
          });

          // 标记已分配的 Extension
          assignedExtensions.add(extension.id);
          nearbyExtensions.forEach(e => assignedExtensions.add(e.id));
        }
      }

      // 检查集群之间的路径
      for (let i = 0; i < clusters.length; i++) {
        for (let j = i + 1; j < clusters.length; j++) {
          const path = room.findPath(clusters[i].center, clusters[j].center, {
            ignoreCreeps: true,
            maxOps: 200,
            ignoreDestructibleStructures: true
          });
          if (path.length === 0) {
            isBlocking = true;
            return true;
          }
        }
      }

      return false;
    } finally {
      // 如果不是阻塞的，重新创建建筑工地
      if (!isBlocking) {
        room.createConstructionSite(site.pos.x, site.pos.y, site.structureType);
      } else {
        console.log(`Removed blocking construction site at ${site.pos}`);
      }
    }
  }

  /**
   * 清理阻塞通道的建筑工地
   */
  public static cleanupBlockingSites(room: Room): void {
    const spawns = room.find(FIND_MY_SPAWNS);
    if (spawns.length === 0) return;

    const sources = room.find(FIND_SOURCES);

    // 获取所有非道路建筑工地
    const sites = room.find(FIND_CONSTRUCTION_SITES, {
      filter: site => site.structureType !== STRUCTURE_ROAD
    });

    // 检查每个建筑工地是否阻塞了重要路径
    for (const site of sites) {
      this.isBlockingImportantPaths(room, site, spawns[0], sources);
    }
  }

  /**
   * 获取需要修理的建筑物，按优先级排序
   */
  public static getRepairTargets(room: Room): Structure[] {
    // 获取所有需要修理的建筑
    const structures = room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        // 墙和城墙只修理到一定程度
        if (structure.structureType === STRUCTURE_WALL || 
            structure.structureType === STRUCTURE_RAMPART) {
          return structure.hits < CONSTRUCTION_CONFIG.REPAIR.WALL_HITS_LIMIT;
        }
        // 其他建筑低于最大生命值时就修理
        return structure.hits < structure.hitsMax;
      }
    });

    // 按优先级和生命值百分比排序
    return structures.sort((a, b) => {
      const priorityA = this.STRUCTURE_PRIORITY[a.structureType];
      const priorityB = this.STRUCTURE_PRIORITY[b.structureType];

      // 首先按优先级排序
      if (priorityA !== priorityB) {
        return priorityB - priorityA;
      }

      // 同优先级的按生命值百分比排序
      const hitsPercentA = a.hits / a.hitsMax;
      const hitsPercentB = b.hits / b.hitsMax;
      return hitsPercentA - hitsPercentB;
    });
  }

  /**
   * 获取最近的需要修理的建筑物
   */
  public static getClosestRepairTarget(pos: RoomPosition): Structure | null {
    const room = Game.rooms[pos.roomName];
    if (!room) return null;

    const targets = this.getRepairTargets(room);
    return pos.findClosestByPath(targets);
  }
}
