# Nest-Admin-Shadcn

这是一个面向中国区后台场景的前后端分离基础模板，目标不是单纯展示 UI，而是作为一个可复制、可继续 vibecoding 的后台基座。

仓库包含两个子应用：

- `server`：NestJS 10 后端，使用 Prisma + MySQL + Redis
- `admin-shadcn`：React 19 管理端，使用 Vite 8 + TanStack Router + TanStack Query + shadcn/ui

## 模板定位

这个仓库适合拿来作为新项目起点，继续扩展用户、角色、菜单、字典、参数、通知、日志、缓存、任务调度等后台能力。

模板强调 5 件事：

- 能快速跑起来
- agent 和协作者能快速读懂真实结构
- 新增模块时尽量沿用现有模式
- 菜单、权限、路由这类联动点有清晰约定
- 前后端都保留足够完整的后台基础能力

## 仓库结构

```text
Nest-Admin-Shadcn/
├─ server/                        # NestJS 后端
│  ├─ src/
│  │  ├─ module/main             # 登录、退出、验证码、当前用户、动态路由
│  │  ├─ module/system           # 用户/角色/菜单/部门/岗位/字典/配置/通知
│  │  ├─ module/monitor          # 在线用户/登录日志/操作日志/任务/缓存/服务监控
│  │  ├─ module/upload           # 上传相关
│  │  ├─ common                  # 守卫、装饰器、过滤器、工具
│  │  └─ config                  # yml 环境配置
│  ├─ prisma/                    # Prisma schema 与 migrations
│  └─ db/nest-admin.sql          # 初始化数据快照
├─ admin-shadcn/                 # React 管理端
│  ├─ src/routes                 # TanStack Router 文件路由
│  ├─ src/views                  # 按业务域组织的页面与逻辑
│  ├─ src/components             # 通用组件、表格、布局
│  ├─ src/lib                    # 请求、工具、下载等基础能力
│  └─ src/stores                 # Zustand 状态
├─ docs/                         # 设计、计划、模板文档
├─ openspec/                     # OpenSpec 相关配置
├─ AGENTS.md                     # 给 agent 与协作者的真实约定
└─ package.json                  # 根目录统一工作流命令
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
- TanStack Table
- Zustand
- Tailwind CSS 4
- shadcn/ui + Radix UI
- React Hook Form + Zod

## 已内置的核心能力

- 账号密码登录、退出、验证码
- 基于 JWT + Redis 的登录态校验
- 后端角色与权限点控制
- 后端动态菜单
- 前端页面权限与按钮权限控制
- 用户、角色、菜单、部门、岗位、字典、参数、通知管理
- 在线用户、登录日志、操作日志、定时任务、缓存、服务监控
- 文件上传
- Swagger 文档和 OpenAPI 文件导出

## 快速开始

### 1. 安装依赖

推荐直接在根目录执行：

```bash
npm run bootstrap
```

等价命令是：

```bash
cd server && yarn
cd ../admin-shadcn && pnpm install
```

### 2. 准备环境变量

先复制样例文件：

```bash
cp server/.env.example server/.env.local
cp admin-shadcn/.env.example admin-shadcn/.env.local
```

如果在 Windows PowerShell 下，可以手工创建对应文件并填入相同内容。

前端最关键的本地变量是：

```env
VITE_API_BASE_URL=http://localhost:8080
```

后端优先支持通过 `DATABASE_URL` 连接数据库；如果未设置，则回退到 `server/src/config/dev.yml` 中的开发配置。

### 3. 准备 MySQL 和 Redis

开发环境默认配置位于：

- `server/src/config/dev.yml`

当前默认开发配置是：

- MySQL：`127.0.0.1:3306`
- 数据库名：`nest-admin`
- Redis：`localhost:6379`

### 4. 初始化数据库

先生成 Prisma Client，再执行 migration：

```bash
cd server
yarn prisma:generate
yarn prisma:migrate:deploy
```

如果需要快速导入完整示例数据，可使用：

- `server/db/nest-admin.sql`

数据库结构的真实来源是：

- `server/prisma/schema.prisma`
- `server/prisma/migrations`

### 5. 启动前后端

后端：

```bash
npm run dev:server
```

前端：

```bash
npm run dev:admin
```

默认地址：

- 后端：`http://localhost:8080`
- Swagger：`http://localhost:8080/swagger-ui/`
- 前端：`http://localhost:5173`

## 根目录统一命令

为了降低模板使用成本，根目录提供统一命令：

```bash
npm run bootstrap
npm run dev:server
npm run dev:admin
npm run verify:template
npm run build:server
npm run build:admin
npm run test:server
npm run test:admin
npm run lint:server
npm run lint:admin
```

## 新项目复制后建议先做的 5 步

1. 修改 `README.md`、项目名称、默认文案与 branding。
2. 根据新项目环境调整 `server/.env.local` 或 `server/src/config/*.yml`。
3. 在前端 `admin-shadcn/.env.local` 中确认 `VITE_API_BASE_URL`。
4. 检查数据库初始化数据，尤其是管理员账号、密码、菜单和角色。
5. 先跑通登录、菜单、用户管理、定时任务和 Swagger 五条基础链路。

如果你更想按一页指引快速进入状态，直接看：

- `docs/template/template-onboarding.md`

## 模板约定

### 1. 后端默认没有 API 前缀

开发环境下 `app.prefix` 为空，接口直接挂在根路径，例如：

- `POST /login`
- `GET /getInfo`
- `GET /getRouters`
- `GET /system/user/list`
- `GET /monitor/job/list`

不要默认假设存在 `/api`。

### 2. 登录态不只依赖 JWT

后端会同时检查：

- `Authorization: Bearer <token>`
- Redis 中的登录 token

所以只改 JWT 而不处理 Redis 登录态，往往会出现“令牌看起来有效，但接口仍判定未登录”的情况。

### 3. 菜单和页面不是单端控制

前端菜单受两套信息共同影响：

1. 后端 `GET /getRouters` 返回的菜单树
2. 前端 `admin-shadcn/src/views/auth/lib/page-registry.ts` 的映射

新增后台页面通常至少要同时处理：

1. 后端菜单数据
2. 前端路由文件
3. `page-registry.ts`
4. 页面内权限点

### 4. 当前后端 ORM 统一使用 Prisma

数据库变更的推荐顺序：

1. 修改 `server/prisma/schema.prisma`
2. 执行 Prisma migration
3. 业务查询统一通过 `PrismaService`

### 5. HTTP 查询参数与 Prisma 分页边界要显式转换

HTTP query 进入 Nest 时默认是字符串，例如 `pageNum=1&pageSize=10` 实际拿到的是字符串值。

这类参数在进入 Prisma `skip/take` 之前，必须显式转换成 `number`，不要把字符串直接传给 Prisma。

### 6. 可直接复制的真代码样板位于 templates

为了让新项目更容易继续 vibecoding，仓库额外提供了两套可直接复制改名的样板：

- `templates/backend-crud`
- `templates/frontend-crud`

## 新增模块建议路径

### 新增后端 CRUD 模块

建议顺序：

1. 找一个同类模块参考，例如 `server/src/module/system/config`
2. 新增 `controller + service + dto + module`
3. 在 Prisma schema 中维护数据模型
4. 在聚合模块中注册
5. 如需菜单权限，再补菜单数据和权限点

### 新增前端后台页面

建议顺序：

1. 在 `admin-shadcn/src/views/<domain>` 下建立业务目录
2. 在 `admin-shadcn/src/routes/_authenticated/...` 下建立路由文件
3. 在 `page-registry.ts` 中登记映射
4. 在 `src/views/<domain>/api` 中补接口
5. 页面按钮权限使用 `PermissionGuard`

## 验证建议

后端：

```bash
npm run build:server
npm run test:server
```

前端：

```bash
npm run build:admin
npm run test:admin
npm run lint:admin
```

模板级静态 smoke：

```bash
npm run verify:template
```

如果只改了菜单、权限或路由，至少人工验证：

1. 登录成功
2. 侧边栏出现目标菜单
3. 页面跳转命中正确路由
4. 权限按钮显示符合预期

模板复制后的建议验收清单见：

- `docs/template/template-smoke-checklist.md`
- `docs/template/template-onboarding.md`

## 哪些内容属于模板核心

- 登录、鉴权、权限点、动态菜单
- 用户/角色/菜单/部门/岗位/字典/参数/通知
- 在线用户、登录日志、操作日志、定时任务、缓存、服务监控
- 文件上传
- Prisma + MySQL + Redis 的后台基础设施

## 哪些内容更偏演示或过渡能力

- Clerk 相关前端演示路由
- 某些 demo 页面和占位页面

如果你是基于这个仓库复制新项目，建议先保留它们，等主链路跑通后再清理。

## 更多真实约定

在开始大改之前，建议先读：

- `AGENTS.md`

这个文件会补充当前仓库真实怎么工作、哪些链路必须一起改、哪些文件不要直接动，以及哪些约定更适合 agent 接手。
