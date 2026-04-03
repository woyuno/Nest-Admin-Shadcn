# 模板 Onboarding

这份单页指引面向两类人：

- 刚把仓库复制为新项目起点的协作者
- 刚接手这个模板仓库的 agent

目标不是解释所有细节，而是让你在第一小时内走上正确路径。

## 第 0 步：先读这 2 个文件

1. [README.md](/e:/ai-workspace/Nest-Admin-Shadcn/README.md)
2. [AGENTS.md](/e:/ai-workspace/Nest-Admin-Shadcn/AGENTS.md)

`README.md` 负责讲模板全貌，`AGENTS.md` 负责讲真实约束和联动点。

## 第 1 步：准备本地环境

在仓库根目录执行：

```bash
npm run bootstrap
```

然后准备这两个本地文件：

```text
server/.env.local
admin-shadcn/.env.local
```

最少确认：

- `VITE_API_BASE_URL=http://localhost:8080`
- `DATABASE_URL=mysql://root:root@127.0.0.1:3306/nest-admin`

## 第 2 步：确认基础依赖

本地至少要有：

- MySQL 8
- Redis

默认开发配置参考：

- `server/src/config/dev.yml`

## 第 3 步：初始化数据库

先生成 Prisma Client，再跑 migration：

```bash
cd server
yarn prisma:generate
yarn prisma:migrate:deploy
```

如果你需要完整示例数据，再导入：

- `server/db/nest-admin.sql`

## 第 4 步：跑模板静态 smoke

回到根目录执行：

```bash
npm run verify:template
```

通过后，说明这几个关键骨架没有坏掉：

- 后端可构建
- Prisma 分页契约测试通过
- 前端可构建
- 页面壳和菜单注册约束测试通过

## 第 5 步：启动前后端

```bash
npm run dev:server
npm run dev:admin
```

默认地址：

- 后端：`http://localhost:8080`
- 前端：`http://localhost:5173`
- Swagger：`http://localhost:8080/swagger-ui/`

## 第 6 步：做最小人工验收

至少确认：

1. 能登录
2. 侧边栏菜单显示正常
3. 用户管理页面可打开
4. 定时任务页面可打开
5. Swagger 可访问

更细的清单见：

- `docs/template/template-smoke-checklist.md`

## 第 7 步：开始扩展新业务

后端新增模块优先参考：

- `server/src/module/system/config`
- `templates/backend-crud`

前端新增页面优先参考：

- `admin-shadcn/src/views/configs`
- `admin-shadcn/src/views/users`
- `templates/frontend-crud`

## 最容易踩坑的 5 件事

1. 后端默认没有 `/api` 前缀
2. JWT 之外还依赖 Redis 登录态
3. 菜单接入不是只改前端路由，还要同步 `page-registry`
4. HTTP query 进入 Prisma 前必须显式转 number
5. 新页面尽量沿用现有 `views + routes + page-registry + AdminPageShell` 模式
