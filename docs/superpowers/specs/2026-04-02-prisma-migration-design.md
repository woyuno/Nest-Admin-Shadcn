# Prisma 全量替换 TypeORM 设计文档

- 日期：2026-04-02
- 主题：后端 ORM 从 TypeORM 一次性迁移到 Prisma
- 适用范围：`server` 后端应用及与其耦合的前端管理端功能入口

## 1. 背景与目标

当前仓库后端基于 NestJS 10 + TypeORM + MySQL，TypeORM 已深入到应用启动、实体定义、仓储注入、复杂查询、裸 SQL 调用以及系统代码生成模块中。该结构可以支撑传统开发，但对于以 vibecoding 为主的后续迭代，存在以下问题：

- 数据结构事实来源分散在实体类、数据库脚本和运行时查询代码中
- 查询风格不统一，存在 `Repository`、`QueryBuilder`、`DataSource.query()` 等多种写法
- AI 和协作者理解成本高，新增或修改数据模型时容易遗漏联动点
- 遗留代码生成器继续输出 TypeORM 代码，会持续把旧方案重新带回仓库

本次迁移目标是一次性完成后端数据层收敛，形成更适合 vibecoding 的统一模型：

- 使用 Prisma 彻底替换 TypeORM
- 使用 `schema.prisma` + Prisma migration 作为数据库结构单一事实来源
- 保持数据库仍为 MySQL
- 保持现有接口协议、登录认证、权限机制和绝大部分业务行为稳定
- 删除不再需要的代码生成器相关功能，避免遗留模块继续污染新架构

## 2. 非目标

本次迁移不包含以下内容：

- 不更换数据库类型，仍使用 MySQL
- 不重构前端整体架构、路由体系和权限展示方式
- 不改造 JWT + Redis 登录态方案
- 不主动重设计全部数据库模型，只在必要时做小范围结构校准
- 不保留 TypeORM 与 Prisma 并存状态，不设计长期过渡层

## 3. 目标架构

迁移完成后，后端数据层架构统一为：

- `prisma/schema.prisma`：数据库模型、字段映射、索引、关系、枚举定义
- `prisma/migrations/*`：数据库结构演进历史
- `PrismaModule`：Nest 中统一的数据访问模块
- `PrismaService`：封装 Prisma Client 生命周期、连接管理与应用关闭逻辑
- 各业务模块 Service：直接通过 `PrismaService` 访问数据库

TypeORM 相关内容全部退出：

- `@nestjs/typeorm`
- `typeorm`
- `TypeOrmModule.forRoot/forFeature`
- `@InjectRepository`
- `Repository<T>`
- `QueryBuilder`
- `DataSource`
- 所有 TypeORM 实体类和实体基类

数据库结构管理方式调整为：

- `schema.prisma` 是模型真相来源
- 结构变更通过 Prisma migration 执行
- `server/db/nest-admin.sql` 不再作为主结构来源，而是作为开发初始化快照或导出产物维护

## 4. 兼容性原则

为了降低迁移阵痛，本次迁移采用“兼容优先，必要校准”的数据库策略：

- 尽量保留现有表名、字段名、主键名
- 优先通过 Prisma 的 `@map` 和 `@@map` 适配历史命名
- 仅在以下情况允许调整表结构：
  - 当前定义会导致 Prisma schema 与真实数据库长期漂移
  - 缺失必要约束，明显影响关系建模、类型安全或后续迁移稳定性
  - 历史设计会持续拖累后续开发与 vibecoding 效率

不为了“看起来更现代”而进行大规模表结构美化，不引入与业务无关的重命名或大重构。

## 5. 迁移范围

### 5.1 必须迁移的内容

- `server/src/app.module.ts` 中的数据库初始化逻辑
- 所有业务模块中的数据库读写逻辑
- 软删除、状态字段、创建更新审计字段等共性字段处理方式
- 原有实体目录、基类和与实体强耦合的工具代码
- 使用 TypeORM 条件构造的分页、筛选、排序、树结构和关联查询
- 使用 `DataSource.query()` 的裸 SQL 查询
- 数据库初始化文档和开发说明

### 5.2 明确删除的内容

代码生成器为此前 vibecoding 残留功能，后续不再使用，因此本次不迁移而是直接删除：

- 后端代码生成模块、模板与入口
- 与代码生成模块相关的菜单、权限点和前端页面入口
- 该模块对 TypeORM 的任何依赖链

### 5.3 明确保持不变的内容

- 前端 `admin-shadcn` 的主体架构
- JWT + Redis 登录态链路
- `JwtAuthGuard`、`RolesGuard`、`PermissionGuard`
- `@Operlog` 审计机制及其业务要求
- 已公开的接口路径与主要响应结构

## 6. 执行策略

本次采用“一次性交付，但分阶段收敛”的迁移策略。最终不会留下双 ORM 并存状态，但在实现过程里会按顺序替换，确保每个阶段都可验证。

### 阶段 1：建立 Prisma 基础设施

- 安装 Prisma 运行时和 CLI 依赖
- 新增 `prisma/schema.prisma`
- 建立 Prisma 生成脚本与开发命令
- 新增 `PrismaModule`、`PrismaService`
- 在 Nest 中接入 Prisma 生命周期管理

目标：让后端具备使用 Prisma 连接 MySQL 的能力，但此时业务模块仍未整体切换。

### 阶段 2：基于现有数据库构建 Prisma Schema

- 从现有 MySQL 结构反推第一版 schema
- 手工整理表、字段、索引、唯一约束、关联关系
- 为历史命名补 `@map` / `@@map`
- 明确少量需要校准的表结构，并形成 migration 基线

目标：得到一份可读、可维护、可长期演进的 `schema.prisma`，同时与现有数据库保持高度兼容。

### 阶段 3：按模块替换业务数据访问

按耦合度与风险分批迁移，建议顺序如下：

1. 低耦合基础模块：配置、上传、日志类模块
2. 监控类模块：登录日志、操作日志、任务
3. 系统管理核心模块：字典、岗位、部门、角色、菜单、用户
4. 主认证链路依赖的用户信息、菜单与权限读取

每个模块迁移时统一处理：

- 删除 `@InjectRepository` 与 Repository 注入
- 将 CRUD 查询改为 Prisma Client 写法
- 将原 TypeORM 条件对象、查询构造器映射到 Prisma `where/orderBy/select/include`
- 将批量更新、批量删除、关联表写入改为 Prisma 事务或批处理

目标：在不改变接口协议的前提下，让所有业务模块完成底层数据访问替换。

### 阶段 4：处理复杂查询与特殊场景

对于以下场景，优先选择“可维护”而不是“强行纯 Prisma”：

- 树结构查询
- 复杂分页筛选
- 批量关系绑定/解绑
- 历史系统表或监控报表类 SQL

处理原则：

- Prisma 能清晰表达的，优先用 Prisma
- 为了可读性和性能，必要时使用 `$queryRaw` / `$executeRaw`
- 原生 SQL 统一通过 Prisma 承载，不再保留 TypeORM `DataSource`

### 阶段 5：删除 TypeORM 与遗留生成器

在所有模块完成迁移并通过验证后，一次性移除：

- `typeorm`、`@nestjs/typeorm`
- 所有 TypeORM 实体与实体基类
- TypeORM 配置代码
- 代码生成器模块及其前后端入口
- 与上述内容相关的无用文档、菜单、权限点和模板文件

目标：仓库中只剩一套 Prisma 数据访问体系，不留旧依赖回流入口。

### 阶段 6：建立新的数据库维护方式

- 固化 migration 基线
- 更新数据库初始化说明
- 明确如何从 Prisma migration 和真实数据库导出初始化 SQL
- 更新仓库文档，约定后续新增字段、加表、改结构的标准流程

## 7. 数据库 SQL 导出策略

迁移到 Prisma 后，数据库仍然是 MySQL，因此数据库导出 SQL 的能力不受影响：

- 可以继续使用 `mysqldump`、Navicat 或其他数据库工具导出建表与数据 SQL
- 可以继续从真实数据库导出完整备份

变化点仅在于项目内部“结构真相来源”的定义：

- 迁移前：实体定义、SQL 脚本、运行时查询共同描述数据库
- 迁移后：`schema.prisma` + Prisma migration 是主事实来源
- `server/db/nest-admin.sql` 作为初始化快照维护，而不是后续结构演进唯一依据

这保证了外部备份与导出能力不受影响，同时避免项目内出现双轨结构维护。

## 8. 风险与控制措施

### 8.1 行为一致性风险

风险：

- 分页、模糊搜索、排序、软删除过滤等行为可能在迁移后出现细微差异
- 树结构和关联表处理可能因查询方式变化而产生结果偏差

控制措施：

- 按模块迁移并逐步验证，不进行纯机械替换
- 以现有接口行为为基准进行回归
- 对关键列表接口保留请求参数与返回结构不变

### 8.2 数据库基线风险

风险：

- Prisma migration 基线处理不当，可能造成本地与目标环境不一致
- 现有数据库脚本与 schema 不一致时，后续迁移容易失败

控制措施：

- 先整理现有数据库结构，再生成正式 migration 基线
- 明确 `nest-admin.sql` 与 Prisma migration 的职责分工
- 在迁移结束前统一校验 schema、migration 与真实数据库

### 8.3 遗留功能残留风险

风险：

- 代码生成器删除不彻底，可能留下菜单、路由、权限点或后端引用

控制措施：

- 前后端与菜单权限联动删除
- 清理相关模块注册、接口入口和页面映射
- 通过登录后人工冒烟确认无残留入口报错

## 9. 验证策略

迁移完成后至少执行以下验证：

- 后端编译通过并可正常启动
- Prisma Client 生成正常，数据库连接正常
- 登录、获取当前用户、获取动态路由正常
- 用户、角色、菜单、部门、岗位、字典、配置等核心模块 CRUD 正常
- 登录日志、操作日志、任务、上传等支撑模块正常
- 权限守卫与操作日志写入保持有效
- 前端登录、菜单渲染、页面跳转、按钮权限基本正常
- 删除代码生成器后，无前后端残留入口导致的异常

建议验证命令包括但不限于：

- `cd server && yarn build`
- `cd server && yarn test`
- `cd admin-shadcn && pnpm build`
- `cd admin-shadcn && pnpm test`
- `cd admin-shadcn && pnpm lint`

## 10. 迁移完成后的开发约定

迁移完成后，后端统一采用以下工作方式：

- 新增表、改字段、加索引：先改 `schema.prisma`
- 数据库结构变更：通过 Prisma migration 执行
- 业务查询：统一通过 `PrismaService`
- 复杂查询：优先 Prisma，必要时用 `$queryRaw`
- 不再创建 TypeORM entity、repository 或相关模板
- 不再恢复代码生成器功能

这套约定的目标是让后续 vibecoding 的上下文足够集中：

- 数据结构看 `schema.prisma`
- 数据库演进看 migration
- 业务数据访问看 `PrismaService`

从而降低后续功能开发和维护的心智负担。

## 11. 最终结论

本次迁移采用以下最终方案：

- 后端一次性从 TypeORM 全量迁移到 Prisma
- 数据库结构管理同步切换到 Prisma migration
- 数据库仍使用 MySQL
- 现有接口协议、认证授权、审计链路保持稳定
- 代码生成器作为遗留 vibecoding 功能直接删除，不参与迁移
- 迁移过程按“先建 Prisma 模型，再模块化替换服务层，最后统一清理旧体系”的顺序执行

该方案不是追求最小改动，而是追求一次性把后续开发所需的数据层心智模型彻底收敛，避免仓库在未来继续同时背负两套 ORM 思路。
