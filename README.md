# Nest-Admin-Shadcn

这是一个前后端分离的后台管理系统仓库，包含：

- `server`：NestJS 10 服务端
- `admin-shadcn`：React 19 + shadcn/ui 管理端

项目目标不是单纯展示 UI，而是提供一套可运行的后台基础能力，包括登录鉴权、菜单权限、系统管理、监控、缓存、定时任务等模块。

## 仓库结构

```text
nest-admin/
├─ server/                # NestJS 后端
│  ├─ src/
│  │  ├─ module/main      # 登录、退出、验证码、当前用户、动态路由
│  │  ├─ module/system    # 用户/角色/菜单/部门/岗位/字典/配置/通知
│  │  ├─ module/monitor   # 在线用户/登录日志/操作日志/任务/缓存/服务监控
│  │  ├─ module/upload    # 文件上传
│  │  └─ config           # yml 环境配置
│  ├─ prisma/             # Prisma schema 与 migration
│  └─ db/nest-admin.sql   # 初始化数据库快照
├─ admin-shadcn/          # React 管理端
│  ├─ src/routes          # TanStack Router 文件路由
│  ├─ src/features        # 业务模块
│  ├─ src/components      # 通用组件与布局
│  └─ src/features/auth   # 登录、权限、菜单映射
├─ openspec/              # OpenSpec 配置
└─ AGENTS.md              # 给 agent 的协作说明
```

## 技术栈

### 后端

- NestJS 10
- Prisma 6
- MySQL 8
- Redis
- Passport JWT
- Swagger
- Schedule / Cron
- ExcelJS

### 前端

- React 19
- Vite 8
- TypeScript
- TanStack Router
- TanStack Query
- Zustand
- Tailwind CSS 4
- shadcn/ui + Radix UI
- React Hook Form + Zod

## 已实现的核心能力

- 账号密码登录、退出、验证码
- 基于 JWT + Redis 的登录态校验
- 基于角色和权限点的接口访问控制
- 后端动态菜单
- 前端菜单映射、页面路由访问控制、按钮级权限控制
- 用户、角色、菜单、部门、岗位、字典、参数、通知等系统管理模块
- 在线用户、登录日志、操作日志、定时任务、缓存、服务监控
- 文件上传
- Swagger 文档与 OpenAPI 文件导出

## 本地开发准备

### 1. 安装依赖

后端使用 `yarn`，前端使用 `pnpm`：

```bash
cd server
yarn
```

```bash
cd admin-shadcn
pnpm install
```

### 2. 准备 MySQL 和 Redis

开发环境配置位于：

- `server/src/config/dev.yml`

其中默认配置为：

- MySQL：`127.0.0.1:3307`
- 数据库名：`nest-admin`
- Redis：`localhost:6379`

### 3. 初始化数据库

先执行 Prisma migration，再按需导入 SQL 快照：

```bash
cd server
yarn prisma:generate
yarn prisma:migrate:deploy
```

快照文件位置：

- `server/db/nest-admin.sql`

数据库结构的真实来源是：

- `server/prisma/schema.prisma`
- `server/prisma/migrations`

快照中包含示例数据，例如：

- 管理员用户
- 角色、菜单、权限点
- 字典与系统配置
- 监控与任务样例数据

### 4. 可选环境变量

前端请求地址来自 `VITE_API_BASE_URL`。推荐在 `admin-shadcn/.env.local` 中显式声明：

```env
VITE_API_BASE_URL=http://localhost:8080
```

否则前端默认使用 `/` 作为请求根路径，直接运行 Vite 时可能请求到 5173 而不是 8080。

项目中还出现了这些可选变量：

- `VITE_ENABLE_DEVTOOLS`
- `VITE_DISABLE_CAPTCHA_LOGIN`
- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_ADMIN_VUE3_BASE_URL`

其中 Clerk 相关路由更偏演示或扩展用途，主业务链路仍以本仓库后端鉴权为主。

## 启动项目

### 启动后端

```bash
cd server
yarn start:dev
```

启动后可访问：

- 服务地址：`http://localhost:8080`
- Swagger：`http://localhost:8080/swagger-ui/`

### 启动前端

```bash
cd admin-shadcn
pnpm dev
```

启动后可访问：

- 前端地址：`http://localhost:5173`

## 开发约定

### 1. 后端接口默认无前缀

当前开发配置里 `app.prefix` 为空，所以接口直接挂根路径，例如：

- `POST /login`
- `GET /getInfo`
- `GET /getRouters`
- `GET /system/user/list`

前后端联调时不要默认假设存在 `/api`。

### 2. 登录态不是只靠 JWT

后端的 JWT Strategy 会同时检查 Redis 中的登录 token。也就是说：

- 只有 JWT 正确还不够
- Redis 登录态不存在时，仍会返回未登录

### 3. 菜单和页面需要双向对齐

前端菜单并不是写死的。真实显示逻辑依赖：

1. 后端 `GET /getRouters` 返回的菜单树
2. 前端 `admin-shadcn/src/features/auth/lib/page-registry.ts` 中的映射规则

新增页面时通常需要同步改这几类内容：

- 后端菜单数据
- 前端路由文件
- `page-registry.ts`
- 页面内权限点

### 4. 生成文件不要手改

这些文件或目录通常不应直接修改：

- `admin-shadcn/src/routeTree.gen.ts`
- `server/dist`
- `admin-shadcn/dist`
- `server/public/openApi.json`
- `**/node_modules`

## 常用命令

### 后端

```bash
cd server
yarn start:dev
yarn build
yarn test
yarn lint
```

### 前端

```bash
cd admin-shadcn
pnpm dev
pnpm build
pnpm test
pnpm lint
```

## 页面与模块地图

### 系统管理

- 用户管理
- 角色管理
- 菜单管理
- 部门管理
- 岗位管理
- 字典管理
- 参数设置
- 通知公告

### 系统监控

- 在线用户
- 登录日志
- 操作日志
- 定时任务
- 服务监控
- 缓存监控
- 缓存列表

## 默认数据说明

数据库脚本中包含管理员等示例数据，初始化密码相关配置默认是 `123456`。这适合本地体验，不适合直接带到共享或生产环境。

建议：

- 本地初始化后尽快修改管理员密码
- 生产环境使用独立配置文件
- 不要把真实数据库和 Redis 凭据继续提交到仓库

## 当前观察到的项目特征

- 仓库根目录没有统一的工作区脚本，需要分别管理前后端
- 后端会在启动时生成 Swagger 文档并写出 `public/openApi.json`
- 前端已经具备较完整的后台壳、权限控制和数据表格模式
- 仓库当前更像“正在并行迁移中的管理端”，部分页面、菜单和外链入口存在演示或过渡性质

## 给协作者的建议

- 先读根目录 `AGENTS.md`，里面总结了适合 agent 和开发者遵循的真实项目约束
- 改权限、菜单、路由时，不要只改一端
- 改登录逻辑时，务必一起检查 Redis 登录态逻辑
- 改数据库结构时，先改 `server/prisma/schema.prisma` 和 Prisma migration
- 代码生成器已经移除，不再作为后续开发路径
- 改环境配置时，优先把敏感信息移到本地私有配置
