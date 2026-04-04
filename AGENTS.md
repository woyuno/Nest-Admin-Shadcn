# AGENTS.md

## 3 分钟摘要

如果你刚接手这个仓库，先记住下面几件事：

- 这是一个可复制的新项目后台模板，不是单纯的 UI 演示仓库
- 后端开发环境默认没有 `/api` 前缀，接口直接挂在根路径
- 登录态依赖 `JWT + Redis`，不要只改 JWT
- 前端菜单链路至少涉及后端 `getRouters`、前端路由、`page-registry.ts`、页面权限点
- 后端默认有 `JwtAuthGuard + RolesGuard + PermissionGuard` 三层守卫
- 后端写接口默认要补 `@Operlog`，并同步检查 `operlog-coverage.spec.ts`
- 数据库统一使用 Prisma，HTTP query 进入 Prisma 前注意 number 边界转换
- 主登录流是本仓库后端账号密码登录，Clerk 路由只是演示保留

## 项目概览

这是一个前后端分离的 Nest-Admin-Shadcn 仓库，目标不只是维护当前项目，也包括作为可复制的新项目后台模板。主要包含两个子应用：

- `server`：NestJS 10 后端，Prisma + MySQL + Redis
- `admin-shadcn`：React 19 管理端，Vite 8 + TanStack Router + TanStack Query + shadcn/ui

默认面向中国区用户，所有新增或修改的用户可见文案优先使用中文。

本文件的目标受众包括：

- 当前仓库协作者
- 需要接手本仓库的 agent
- 准备把本仓库复制为新项目模板的协作者

## 目录与入口

- `server/src`：后端源码
- `server/src/module/main`：登录、退出、验证码、当前用户、动态路由
- `server/src/module/system`：系统管理模块，含用户、角色、菜单、部门、岗位、字典、配置、通知
- `server/src/module/monitor`：系统监控模块，含在线用户、登录日志、操作日志、任务、缓存、服务监控
- `server/src/config/*.yml`：环境配置，按 `NODE_ENV` 映射
- `server/prisma/schema.prisma`：Prisma 数据模型真相来源
- `server/prisma/migrations`：数据库结构迁移历史
- `server/db/nest-admin.sql`：初始化数据库快照与示例数据
- `admin-shadcn/src/routes`：基于文件的前端路由
- `admin-shadcn/src/views`：按业务域组织的页面与逻辑
- `admin-shadcn/src/views/auth/lib/page-registry.ts`：后端菜单到前端页面的静态映射表
- `admin-shadcn/src/lib/request.ts`：统一 Axios 实例
- `admin-shadcn/src/stores/auth-store.ts`：登录态、菜单上下文、权限上下文

## 启动方式

根目录已经提供统一脚本，优先使用：

- `npm run bootstrap`
- `npm run dev:server`
- `npm run dev:admin`
- `npm run build:server`
- `npm run build:admin`
- `npm run test:server`
- `npm run test:admin`

如需分别进入子目录执行，也可以使用：

- 后端安装依赖：`cd server && yarn`
- 后端开发启动：`cd server && yarn start:dev`
- 前端安装依赖：`cd admin-shadcn && pnpm install`
- 前端开发启动：`cd admin-shadcn && pnpm dev`

默认端口：

- 后端：`http://localhost:8080`
- Swagger：`http://localhost:8080/swagger-ui/`
- 前端：`http://localhost:5173`

前端请求地址来自 `VITE_API_BASE_URL`。本地联调时优先在 `admin-shadcn/.env.local` 中显式设置：

- `VITE_API_BASE_URL=http://localhost:8080`

后端本地运行时，优先通过 `server/.env.local` 或系统环境变量显式提供：

- `NODE_ENV=development`
- `DATABASE_URL=mysql://root:root@127.0.0.1:3306/nest-admin`

## 运行前置条件

- MySQL 8，默认开发配置写在 `server/src/config/dev.yml`
- Redis，默认开发配置也写在 `server/src/config/dev.yml`
- 结构迁移来自 `server/prisma/schema.prisma` + `server/prisma/migrations`
- 演示数据快照来自 `server/db/nest-admin.sql`

注意：

- `server/src/config/test.yml` 和 `server/src/config/prod.yml` 被 `.gitignore` 忽略，需要自行创建
- `server/src/config/dev.yml` 当前包含本地开发凭据示例，不要把真实生产凭据继续硬编码进去

## 必须先知道的架构事实

### 1. 后端没有 API 前缀

`server/src/main.ts` 中开发环境 `app.prefix` 为空，接口直接挂在根路径，例如：

- `POST /login`
- `GET /getInfo`
- `GET /getRouters`
- `GET /captchaImage`
- `GET /system/user/list`

不要想当然加上 `/api`，除非同步修改后端配置和前端请求。

### 2. 登录态依赖 JWT + Redis

- JWT 通过 `Authorization: Bearer <token>` 传递
- `AuthStrategy` 不只校验 JWT，还会检查 Redis 中的登录 token
- 只改 JWT 逻辑而不处理 Redis，会导致“token 看起来有效但请求仍被判定过期”

### 3. 权限控制是三层

后端全局挂载了：

- `JwtAuthGuard`
- `RolesGuard`
- `PermissionGuard`

新增接口时默认会被鉴权。匿名接口必须显式走现有免登录机制，不要只在前端放开。

### 4. 前端菜单不是纯静态

前端受两套信息共同约束：

- 后端 `GET /getRouters` 返回的菜单树
- 前端 `admin-shadcn/src/views/auth/lib/page-registry.ts` 中的映射和权限声明

新增后台页面通常至少要同时处理：

1. 后端菜单数据或菜单接口输出
2. 前端页面路由文件
3. `page-registry.ts` 映射
4. 必要时页面内 `PermissionGuard` 权限点

如果只改其中一层，常见结果是菜单出现但无法进入、页面存在但侧边栏不显示，或权限按钮异常。

### 5. `routeTree.gen.ts` 是生成文件

`admin-shadcn/src/routeTree.gen.ts` 由 TanStack Router 生成，不要手工维护。优先修改 `src/routes/**`。

### 6. HTTP query 与 Prisma number 边界要显式转换

HTTP 查询参数进入 Nest 时默认是字符串，例如：

- `pageNum=1`
- `pageSize=10`

在进入 Prisma 的 `skip`、`take` 或其他严格 number/int 字段前，必须显式做 `Number(...)` 转换，或走统一分页工具。不要把字符串直接传给 Prisma。

这条规则尤其适用于：

- 列表分页
- 导出过滤条件
- 依赖数字主键的 query 参数

### 7. OpenSpec 当前还不是完整启用状态

仓库当前保留了 `openspec/` 配置骨架，但如需使用完整的 OpenSpec 变更流，还需要先完成初始化，不要默认认为当前已经存在可直接使用的 changes 工作流。

## 强约束

### 1. 默认沿用仓库现有架构和实现方案

后续开发默认优先沿用本仓库现有的架构分层、目录组织、状态管理、请求封装、表格与表单模式、权限控制和 UI 组件体系，不要在无充分理由时引入第二套并行方案。

具体要求：

- 后端优先沿用现有 Nest 模块模式：`controller + service + dto + module`
- 前端优先沿用现有 `views` 分层、TanStack Router、TanStack Query、shadcn/ui、既有 data-table 与表单封装
- 新增功能前，先查找并参考同类模块实现，保持接口风格、交互模式、目录结构、命名方式一致
- 涉及菜单、权限、路由、审计日志、字典映射、图标注册等联动点时，必须按现有链路一起处理，不要只改其中一层
- 如无明确必要，不新增新的状态管理库、请求库、表格方案、表单方案、图标方案或自定义基础设施

如果确实需要偏离现有方案，必须先确认现有实现无法满足需求，再尽量将影响范围控制在最小，并在改动说明中明确写出原因。

当前后端数据库访问统一使用 Prisma：

- 表结构变更先改 `server/prisma/schema.prisma`
- 再通过 Prisma migration 演进数据库
- 业务查询统一通过 `PrismaService`
- 不再新增 TypeORM entity、repository 或 `TypeOrmModule` 用法

如果当前目标是把本仓库复制为新项目起点，默认也优先保留这套技术栈与目录结构，不要一开始就大规模替换基础设施。

### 2. 后端写接口默认必须接入操作日志

后端新增或修改有业务副作用的接口时，默认必须在 controller 方法上补 `@Operlog`，不要只做权限控制而遗漏审计。

默认应接入操作日志的范围包括：

- 新增、修改、删除
- 授权、分配、解绑
- 重置密码、状态切换、强退
- 导入、导出、清空缓存、清空日志等会改变系统状态或触发关键业务动作的接口

默认不接入的范围包括：

- 纯查询接口
- 仅返回详情、列表、树结构、下拉选项的接口
- 明确属于临时凭证获取、纯预览、纯上传且无业务审计要求的接口

新增写接口时，除了补 `@Operlog` 和合适的 `BusinessType`，还应同步更新 `server/src/common/decorators/operlog-coverage.spec.ts`。

### 3. Git 提交信息默认使用中文

在本仓库中执行 `git commit` 时，默认使用中文提交信息，并遵循：

- 格式：`中文类型: 主题`
- 常用类型：`新增`、`修复`、`调整`、`优化`、`重构`、`测试`、`文档`、`构建`、`忽略`
- 主题保持简洁，一次提交只写一个主题
- 不使用空泛描述，如 `update`、`fix bug`、`misc changes`

示例：

- `新增: 补充用户导出接口`
- `修复: 解决菜单路由跳转异常`
- `重构: 迁移前端 views 目录`

如果确实需要与外部规范对齐而使用英文提交信息，应在任务说明中明确提出，否则默认按中文提交。

### 4. 以下目录通常不应直接改

- `**/node_modules`
- `server/dist`
- `admin-shadcn/dist`
- `server/public/openApi.json`：运行后会重新生成

## 常见改动路径

### 新增后端 CRUD 模块

建议顺序：

1. 找一个同类模块参考，例如 `server/src/module/system/config`
2. 补 dto、service、controller、module，数据库模型统一维护在 Prisma schema 中
3. 在对应聚合模块注册，例如 `system.module.ts` 或 `monitor.module.ts`
4. 如需菜单权限，补数据库菜单数据或相应管理入口
5. 如需前端页面，再补前端 view、route、registry 映射

### 新增前端后台页面

优先参考已有模式，例如：

- `admin-shadcn/src/views/users`
- `admin-shadcn/src/views/roles`
- `admin-shadcn/src/views/configs`

建议顺序：

1. `src/views/<domain>` 下建业务目录
2. `src/routes/_authenticated/...` 下建路由文件
3. 在 `page-registry.ts` 中建立菜单路径或组件键映射
4. 如需接口，补 `src/views/<domain>/api/*.ts`
5. 如需权限按钮，使用现有 `PermissionGuard`

## 模板使用模式

如果当前任务是“把本仓库作为新项目模板继续开发”，默认遵循以下规则：

1. 优先保持已有目录结构和技术栈，不做大规模替换。
2. 新增业务模块时，先参考一个现有模块做等形扩展，不要重新发明一套分层。
3. 修改菜单、权限、路由时，必须同时检查后端菜单数据、前端路由文件、`page-registry.ts`、页面权限点。
4. 改分页查询时，必须检查 HTTP query 到 Prisma 的 number 边界转换。
5. 新协作者或 agent 开始前，优先阅读 `README.md`、`AGENTS.md`、`docs/template/template-onboarding.md`。

## 验证建议

后端常用：

- `cd server && yarn build`
- `cd server && yarn test`

前端常用：

- `cd admin-shadcn && pnpm build`
- `cd admin-shadcn && pnpm test`
- `cd admin-shadcn && pnpm lint`

模板级静态 smoke：

- `npm run verify:template`

如果只改了路由、权限或菜单映射，至少人工验证：

1. 登录是否成功
2. 侧边栏是否出现目标菜单
3. 页面跳转是否命中正确路由
4. 权限按钮是否按预期显示

## 已确认的本地事实

- 后端开发环境端口是 `8080`
- 前端开发环境端口是 `5173`
- Swagger 已启用并写出 OpenAPI 文件
- 数据库脚本中存在默认管理员数据，初始化密码相关配置为 `123456`
- 前端包含一套 Clerk 演示路由，但主登录流仍是本仓库后端的账号密码登录
- 代码生成器功能已移除，不再维护对应前后端入口

## 文档维护原则

- 保持中文为主，面向仓库协作者而不是外部营销文案
- 优先写“这个仓库真实怎么工作”，不要写通用模板话术
- README 与 AGENTS 发生冲突时，以代码真实结构为准，并尽快修正文档
- 当发现新的关键联动约束时，优先更新本文件

