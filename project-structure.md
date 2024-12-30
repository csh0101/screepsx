# Screeps TypeScript Project Structure

```
src/
├── config/                     # 配置文件目录
│   ├── constants/             # 常量配置
│   │   ├── room.ts           # 房间相关常量
│   │   ├── creep.ts          # Creep相关常量
│   │   └── resource.ts       # 资源相关常量
│   └── settings.ts           # 用户设置
│
├── memory/                    # 内存管理系统
│   ├── interfaces/           # 内存接口定义
│   │   ├── memory.interface.ts
│   │   └── room-memory.interface.ts
│   ├── memory-manager.ts     # 内存管理器
│   └── garbage-collector.ts  # 内存清理
│
├── core/                     # 核心系统
│   ├── profiler/            # 性能分析
│   │   ├── profiler.ts
│   │   └── stats.ts
│   └── registry/            # 注册表系统
│       ├── room-registry.ts
│       └── creep-registry.ts
│
├── managers/                # 管理器
│   ├── base-manager.ts     # 基础管理器
│   ├── room/              # 房间管理
│   │   ├── room-manager.ts
│   │   ├── layout-manager.ts
│   │   └── visual-manager.ts
│   ├── resource/         # 资源管理
│   │   ├── energy-manager.ts
│   │   ├── mineral-manager.ts
│   │   ├── boost-manager.ts
│   │   └── factory-manager.ts
│   ├── market/          # 市场管理
│   │   ├── market-manager.ts
│   │   ├── order-manager.ts
│   │   └── terminal-manager.ts
│   ├── defense/         # 防御管理
│   │   ├── defense-manager.ts
│   │   ├── tower-manager.ts
│   │   └── wall-manager.ts
│   └── spawn/           # 孵化管理
│       ├── spawn-manager.ts
│       └── queue-manager.ts
│
├── roles/               # Creep角色
│   ├── base/           # 基础角色
│   │   ├── role.interface.ts
│   │   └── base-role.ts
│   ├── logistics/      # 物流角色
│   │   ├── harvester.ts
│   │   ├── carrier.ts
│   │   └── mineral-harvester.ts
│   ├── worker/         # 工作角色
│   │   ├── builder.ts
│   │   ├── repairer.ts
│   │   └── upgrader.ts
│   └── military/       # 军事角色
│       ├── defender.ts
│       ├── attacker.ts
│       └── healer.ts
│
├── structures/         # 建筑物
│   ├── base/
│   │   └── structure.interface.ts
│   ├── spawn.ts
│   ├── extension.ts
│   ├── tower.ts
│   ├── storage.ts
│   ├── terminal.ts
│   ├── lab.ts
│   ├── factory.ts
│   ├── link.ts
│   └── nuker.ts
│
├── tasks/             # 任务系统
│   ├── base/
│   │   ├── task.interface.ts
│   │   └── base-task.ts
│   ├── resource/      # 资源任务
│   │   ├── harvest-task.ts
│   │   └── transfer-task.ts
│   ├── build/         # 建造任务
│   │   ├── build-task.ts
│   │   └── repair-task.ts
│   └── combat/        # 战斗任务
│       ├── attack-task.ts
│       └── defend-task.ts
│
├── utils/            # 工具函数
│   ├── logger/
│   │   ├── logger.ts
│   │   └── error-handler.ts
│   ├── calculators/  # 计算工具
│   │   ├── path-calculator.ts
│   │   └── damage-calculator.ts
│   └── helpers/      # 辅助函数
│       ├── position-helper.ts
│       └── room-helper.ts
│
├── ai/              # AI决策系统
│   ├── strategy/    # 策略
│   │   ├── economy-strategy.ts
│   │   ├── defense-strategy.ts
│   │   └── expansion-strategy.ts
│   ├── planner/     # 规划
│   │   ├── room-planner.ts
│   │   └── base-planner.ts
│   └── analyzer/    # 分析
│       ├── threat-analyzer.ts
│       └── efficiency-analyzer.ts
│
├── types/           # 类型定义
│   ├── screeps.d.ts
│   └── global.d.ts
│
└── main.ts         # 入口文件

tests/              # 测试
├── unit/
├── integration/
└── e2e/

scripts/           # 构建脚本
├── build.js
├── deploy.js
└── analyze.js

# 配置文件
package.json
tsconfig.json
rollup.config.js
.eslintrc.js
jest.config.js
README.md

## 核心设计理念

1. **资源管理**
   - 多层次资源系统（能量、矿物、商品）
   - 资源优化分配
   - 市场交易策略

2. **模块化设计**
   - 职责分离
   - 接口驱动
   - 可测试性

3. **防御系统**
   - 多层防御策略
   - 主动和被动防御
   - 威胁分析

4. **AI决策**
   - 经济策略
   - 军事策略
   - 扩张规划

5. **性能优化**
   - CPU使用监控
   - 内存管理
   - 代码效率

## 关键特性

1. **资源系统**
   - 能量管理
   - 矿物开采
   - 商品生产
   - 市场交易

2. **防御体系**
   - 塔防系统
   - 城墙管理
   - 军事单位

3. **自动化**
   - 建筑布局
   - 单位生产
   - 任务分配

4. **扩张系统**
   - 房间评估
   - 扩张规划
   - 资源勘探

## 开发工具链

1. **构建系统**
   - TypeScript
   - Rollup
   - Source Maps

2. **测试框架**
   - Jest
   - Mock系统
   - E2E测试

3. **代码质量**
   - ESLint
   - Prettier
   - TypeScript严格模式

4. **CI/CD**
   - 自动测试
   - 自动部署
   - 性能监控
