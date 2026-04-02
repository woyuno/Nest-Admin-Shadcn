# Prisma 全量替换 TypeORM Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `server` 后端从 TypeORM 一次性迁移到 Prisma，删除代码生成器遗留功能，并保持管理端核心业务可用。

**Architecture:** 数据库结构真相来源从 TypeORM 实体和 SQL 脚本切换为 `prisma/schema.prisma` 与 Prisma migrations。Nest 侧引入 `PrismaModule` 与 `PrismaService` 统一提供数据库访问，各业务模块逐步将 Repository 和 QueryBuilder 重写为 Prisma Client 查询。迁移完成后删除 TypeORM 依赖、实体类、代码生成器模块及其前端入口。

**Tech Stack:** NestJS 10, Prisma, MySQL, Redis, Jest, React 19, Vite 8, TanStack Router, pnpm, yarn

---

## File Structure

### 新增文件

- `server/prisma/schema.prisma`：Prisma 数据模型、字段映射、关系、索引和生成器配置
- `server/prisma/migrations/`：Prisma migration 目录，首个基线迁移会在此生成
- `server/src/prisma/prisma.module.ts`：Prisma 模块导出
- `server/src/prisma/prisma.service.ts`：Prisma Client 生命周期与连接封装
- `server/src/prisma/prisma.service.spec.ts`：PrismaService 单元测试
- `docs/superpowers/plans/2026-04-02-prisma-migration.md`：本执行计划

### 重点修改文件

- `server/package.json`：移除 TypeORM 依赖，新增 Prisma 依赖与命令
- `server/src/app.module.ts`：从 TypeORM 启动改为 Prisma 模块
- `server/src/module/system/system.module.ts`：删除 `tool` 代码生成器模块注册
- `server/src/module/monitor/monitor.module.ts`：校验监控模块依赖是否仍引用 TypeORM 内容
- `server/src/module/system/*/*.service.ts`：将业务查询重写为 Prisma
- `server/src/module/monitor/*/*.service.ts`：将业务查询重写为 Prisma
- `server/src/module/main/*/*.service.ts`：认证与动态路由相关查询切换到 Prisma
- `server/src/common/**`：删除或改写依赖 TypeORM 的实体基类与工具
- `admin-shadcn/src/features/gen/**`：删除代码生成器前端功能
- `admin-shadcn/src/routes/_authenticated/gen/**`：删除历史路由入口
- `admin-shadcn/src/routes/_authenticated/tool/gen/**`：删除历史路由入口
- `admin-shadcn/src/features/auth/lib/page-registry.ts`：移除代码生成器映射
- `server/db/nest-admin.sql`：重新定义为数据库初始化快照
- `AGENTS.md`、`README.md`：更新数据库维护方式与代码生成器已移除的说明

### 删除目录

- `server/src/module/system/tool`
- `admin-shadcn/src/features/gen`
- `admin-shadcn/src/routes/_authenticated/gen`
- `admin-shadcn/src/routes/_authenticated/tool/gen`
- `server/src/common/entities` 中纯 TypeORM 实体基类文件

## Task 1: 建立 Prisma 基础设施并替换启动入口

**Files:**
- Create: `server/prisma/schema.prisma`
- Create: `server/src/prisma/prisma.module.ts`
- Create: `server/src/prisma/prisma.service.ts`
- Create: `server/src/prisma/prisma.service.spec.ts`
- Modify: `server/package.json`
- Modify: `server/src/app.module.ts`
- Test: `server/src/prisma/prisma.service.spec.ts`

- [ ] **Step 1: 写 PrismaService 的失败测试**

```ts
import { Test } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  it('should be defined', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    expect(moduleRef.get(PrismaService)).toBeInstanceOf(PrismaService);
  });
});
```

- [ ] **Step 2: 运行测试，确认当前失败**

Run: `cd server && yarn test prisma.service.spec.ts --runInBand`  
Expected: FAIL，提示 `Cannot find module './prisma.service'` 或测试文件不存在

- [ ] **Step 3: 更新依赖和脚本**

```json
{
  "scripts": {
    "prisma:generate": "prisma generate",
    "prisma:migrate:dev": "prisma migrate dev",
    "prisma:migrate:deploy": "prisma migrate deploy",
    "prisma:db:pull": "prisma db pull",
    "prisma:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^6.0.0"
  },
  "devDependencies": {
    "prisma": "^6.0.0"
  }
}
```

- [ ] **Step 4: 新增 Prisma schema 与 Nest 封装**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

```ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

```ts
import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
```

- [ ] **Step 5: 将 `app.module.ts` 改为接入 PrismaModule，移除 TypeORM 根注册**

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 6: 运行测试并生成 Prisma Client**

Run: `cd server && yarn prisma:generate && yarn test prisma.service.spec.ts --runInBand`  
Expected: PASS，输出 `1 passed`

- [ ] **Step 7: 提交**

```bash
git add server/package.json server/prisma/schema.prisma server/src/prisma server/src/app.module.ts
git commit -m "新增 Prisma 基础设施"
```

## Task 2: 建立 Prisma schema 基线并替换数据库配置来源

**Files:**
- Modify: `server/prisma/schema.prisma`
- Create: `server/prisma/migrations/` 下的首个基线迁移文件
- Modify: `server/src/config/dev.yml`
- Modify: `server/db/nest-admin.sql`
- Test: `server/prisma/schema.prisma`

- [ ] **Step 1: 从现有数据库结构拉取第一版 schema**

Run: `cd server && yarn prisma:db:pull`  
Expected: 成功生成各表模型到 `prisma/schema.prisma`

- [ ] **Step 2: 手工整理 schema，统一 generator、datasource、映射和关系**

```prisma
model SysUser {
  userId      Int       @id @default(autoincrement()) @map("user_id")
  deptId      Int?      @map("dept_id")
  userName    String    @db.VarChar(30) @map("user_name")
  nickName    String    @db.VarChar(30) @map("nick_name")
  status      String    @default("0") @db.Char(1)
  delFlag     String    @default("0") @map("del_flag") @db.Char(1)
  createTime  DateTime? @map("create_time")
  updateTime  DateTime? @map("update_time")

  dept        SysDept?  @relation(fields: [deptId], references: [deptId])
  roles       SysRole[] @relation("SysUserRoles")

  @@map("sys_user")
}
```

- [ ] **Step 3: 将数据库连接改为 `DATABASE_URL` 驱动**

```yaml
mysql:
  url: ${DATABASE_URL}
```

如果当前配置系统不支持直接透传，补一层适配逻辑，把现有 `host/port/username/password/database` 拼成 Prisma 所需连接字符串。

- [ ] **Step 4: 生成 baseline migration**

Run: `cd server && yarn prisma:migrate:dev --name baseline --create-only`  
Expected: 生成 `prisma/migrations/` 下以 `baseline` 结尾的首个 migration 文件

- [ ] **Step 5: 重新定义 `nest-admin.sql` 的职责**

```sql
-- 本文件为开发初始化快照，由当前 Prisma migration 对应数据库导出得到
-- 后续表结构变更请先修改 prisma/schema.prisma 并执行 Prisma migration
```

- [ ] **Step 6: 校验 schema 和 migration 一致性**

Run: `cd server && yarn prisma:generate && yarn prisma:migrate:deploy`  
Expected: `Prisma schema loaded`，migration 执行成功，无 drift 报错

- [ ] **Step 7: 提交**

```bash
git add server/prisma/schema.prisma server/prisma/migrations server/src/config server/db/nest-admin.sql
git commit -m "建立 Prisma 数据模型基线"
```

## Task 3: 迁移低耦合模块并删除实体基类

**Files:**
- Modify: `server/src/module/system/config/config.service.ts`
- Modify: `server/src/module/system/notice/notice.service.ts`
- Modify: `server/src/module/upload/upload.service.ts`
- Modify: `server/src/module/monitor/loginlog/loginlog.service.ts`
- Modify: `server/src/module/monitor/operlog/operlog.service.ts`
- Modify: `server/src/module/system/config/config.module.ts`
- Modify: `server/src/module/system/notice/notice.module.ts`
- Modify: `server/src/module/upload/upload.module.ts`
- Modify: `server/src/module/monitor/loginlog/loginlog.module.ts`
- Modify: `server/src/module/monitor/operlog/operlog.module.ts`
- Modify: `server/src/common/utils/index.ts`
- Delete: `server/src/common/entities/base.ts`
- Test: `server/src/module/system/config/*.spec.ts`

- [ ] **Step 1: 为一个低耦合服务写失败测试，以配置模块为样板**

```ts
it('should query config list with keyword filter', async () => {
  prisma.sysConfig.findMany = jest.fn().mockResolvedValue([]);
  await service.findAll({ configName: '系统' });
  expect(prisma.sysConfig.findMany).toHaveBeenCalledWith(
    expect.objectContaining({
      where: expect.objectContaining({
        configName: expect.objectContaining({ contains: '系统' }),
      }),
    }),
  );
});
```

- [ ] **Step 2: 运行测试确认 Repository 版实现尚未适配**

Run: `cd server && yarn test config.service.spec.ts --runInBand`  
Expected: FAIL，提示仍在依赖 TypeORM Repository 或 mock 不匹配

- [ ] **Step 3: 将低耦合模块改为 PrismaService 注入**

```ts
constructor(private readonly prisma: PrismaService) {}

async findAll(query: ConfigQueryDto) {
  return this.prisma.sysConfig.findMany({
    where: {
      delFlag: '0',
      ...(query.configName ? { configName: { contains: query.configName } } : {}),
    },
    orderBy: { configId: 'desc' },
  });
}
```

- [ ] **Step 4: 删除对应模块中的 `TypeOrmModule.forFeature(...)`**

```ts
@Module({
  controllers: [ConfigController],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
```

- [ ] **Step 5: 去掉对 TypeORM 实体基类和 `ValueTransformer` 的依赖**

```ts
export const bigintTransformer = {
  to: (value?: string | number | null) => value,
  from: (value?: string | number | null) => value?.toString() ?? value,
};
```

- [ ] **Step 6: 运行低耦合模块测试与后端编译**

Run: `cd server && yarn test config.service.spec.ts loginlog.service.spec.ts operlog.service.spec.ts --runInBand && yarn build`  
Expected: PASS，Nest 编译成功

- [ ] **Step 7: 提交**

```bash
git add server/src/module/system/config server/src/module/system/notice server/src/module/upload server/src/module/monitor/loginlog server/src/module/monitor/operlog server/src/common
git commit -m "迁移低耦合模块到 Prisma"
```

## Task 4: 迁移系统核心模块与认证链路

**Files:**
- Modify: `server/src/module/system/user/user.service.ts`
- Modify: `server/src/module/system/role/role.service.ts`
- Modify: `server/src/module/system/menu/menu.service.ts`
- Modify: `server/src/module/system/dept/dept.service.ts`
- Modify: `server/src/module/system/post/post.service.ts`
- Modify: `server/src/module/system/dict/**/*.service.ts`
- Modify: `server/src/module/system/auth/**/*.service.ts`
- Modify: `server/src/module/main/**/*.service.ts`
- Modify: `server/src/module/system/**/*.module.ts`
- Test: `server/src/module/main/**/*.spec.ts`

- [ ] **Step 1: 为登录与用户查询链路写失败测试**

```ts
it('should load active user with roles and posts for login', async () => {
  prisma.sysUser.findFirst = jest.fn().mockResolvedValue({
    userId: 1,
    userName: 'admin',
    status: '0',
    roles: [{ roleKey: 'admin' }],
  });

  const user = await service.findUserByUserName('admin');

  expect(prisma.sysUser.findFirst).toHaveBeenCalledWith(
    expect.objectContaining({
      where: { userName: 'admin', delFlag: '0' },
      include: expect.objectContaining({
        roles: true,
      }),
    }),
  );
  expect(user?.userName).toBe('admin');
});
```

- [ ] **Step 2: 运行核心链路测试，确认旧实现不满足新注入方式**

Run: `cd server && yarn test auth --runInBand`  
Expected: FAIL，提示 Repository mock 或依赖注入不匹配

- [ ] **Step 3: 重写用户、角色、菜单、部门、岗位、字典和主认证链路查询**

```ts
async findUserByUserName(userName: string) {
  return this.prisma.sysUser.findFirst({
    where: {
      userName,
      delFlag: '0',
    },
    include: {
      dept: true,
      roles: {
        where: { status: '0', delFlag: '0' },
      },
      posts: true,
    },
  });
}
```

```ts
await this.prisma.$transaction([
  this.prisma.sysUser.update({
    where: { userId },
    data: { nickName, email, phonenumber },
  }),
  this.prisma.sysUserRole.deleteMany({ where: { userId } }),
  this.prisma.sysUserRole.createMany({
    data: roleIds.map((roleId) => ({ userId, roleId })),
  }),
]);
```

- [ ] **Step 4: 将树结构和菜单构建逻辑改为 Prisma 可维护写法**

```ts
const depts = await this.prisma.sysDept.findMany({
  where: { delFlag: '0' },
  orderBy: [{ parentId: 'asc' }, { orderNum: 'asc' }],
});

return buildDeptTree(depts);
```

- [ ] **Step 5: 运行核心链路测试与认证冒烟测试**

Run: `cd server && yarn test auth user menu role dept post dict --runInBand && yarn build`  
Expected: PASS，关键模块测试通过，编译成功

- [ ] **Step 6: 提交**

```bash
git add server/src/module/system server/src/module/main
git commit -m "迁移系统核心模块到 Prisma"
```

## Task 5: 迁移任务监控与复杂查询，统一原生 SQL 出口

**Files:**
- Modify: `server/src/module/monitor/job/job.service.ts`
- Modify: `server/src/module/monitor/job/job-log.service.ts`
- Modify: `server/src/module/monitor/cache/**/*.ts`
- Modify: `server/src/module/monitor/server/**/*.ts`
- Modify: `server/src/module/monitor/online/**/*.ts`
- Modify: `server/src/module/monitor/**/*.module.ts`
- Test: `server/src/module/monitor/job/*.spec.ts`

- [ ] **Step 1: 为任务模块的分页和筛选写失败测试**

```ts
it('should query job list with name filter and sort by jobId desc', async () => {
  prisma.sysJob.findMany = jest.fn().mockResolvedValue([]);
  await service.findAll({ jobName: '同步' });
  expect(prisma.sysJob.findMany).toHaveBeenCalledWith(
    expect.objectContaining({
      where: expect.objectContaining({
        jobName: expect.objectContaining({ contains: '同步' }),
      }),
      orderBy: { jobId: 'desc' },
    }),
  );
});
```

- [ ] **Step 2: 运行任务模块测试，确认迁移点存在**

Run: `cd server && yarn test job.service.spec.ts --runInBand`  
Expected: FAIL

- [ ] **Step 3: 将任务和监控模块改为 Prisma 查询或 Prisma 原生 SQL**

```ts
async findAll(query: JobQueryDto) {
  return this.prisma.sysJob.findMany({
    where: {
      ...(query.jobName ? { jobName: { contains: query.jobName } } : {}),
      ...(query.status ? { status: query.status } : {}),
    },
    orderBy: { jobId: 'desc' },
  });
}
```

```ts
return this.prisma.$queryRaw<
  Array<{ tableName: string; tableComment: string }>
>`SELECT table_name AS tableName, table_comment AS tableComment
  FROM information_schema.tables
  WHERE table_schema = DATABASE()`;
```

- [ ] **Step 4: 将所有 `DataSource.query()` 替换为 `$queryRaw` / `$executeRaw`**

```ts
await this.prisma.$executeRaw`
  DELETE FROM sys_job_log
  WHERE create_time < ${expiredAt}
`;
```

- [ ] **Step 5: 运行监控模块测试与后端全量测试**

Run: `cd server && yarn test job job-log monitor --runInBand && yarn build`  
Expected: PASS，无 TypeORM 相关注入异常

- [ ] **Step 6: 提交**

```bash
git add server/src/module/monitor
git commit -m "迁移监控与复杂查询到 Prisma"
```

## Task 6: 删除 TypeORM 与代码生成器遗留功能

**Files:**
- Delete: `server/src/module/system/tool/**`
- Modify: `server/src/module/system/system.module.ts`
- Modify: `server/src/app.module.ts`
- Modify: `server/package.json`
- Delete: `admin-shadcn/src/features/gen/**`
- Delete: `admin-shadcn/src/routes/_authenticated/gen/**`
- Delete: `admin-shadcn/src/routes/_authenticated/tool/gen/**`
- Modify: `admin-shadcn/src/features/auth/lib/page-registry.ts`
- Modify: `admin-shadcn/src/routeTree.gen.ts`（通过生成命令更新，不手改）
- Test: `admin-shadcn/src/features/auth/lib/page-registry.ts`

- [ ] **Step 1: 为前端页面映射写失败测试或断言，确保代码生成器入口被移除**

```ts
it('should not expose legacy code generator page mapping', () => {
  expect(pageRegistry['/tool/gen']).toBeUndefined();
  expect(pageRegistry['/gen']).toBeUndefined();
});
```

- [ ] **Step 2: 删除后端代码生成器模块及模块注册**

```ts
@Module({
  imports: [
    AuthModule,
    ConfigModule,
    DeptModule,
    DictModule,
    MenuModule,
    NoticeModule,
    PostModule,
    RoleModule,
    UserModule,
  ],
})
export class SystemModule {}
```

- [ ] **Step 3: 从依赖中移除 TypeORM**

```json
{
  "dependencies": {
    "@nestjs/typeorm": null,
    "typeorm": null
  }
}
```

- [ ] **Step 4: 删除前端 `gen` 功能目录和路由，并更新 page registry**

```ts
export const pageRegistry = {
  '/system/user': lazy(() => import('@/features/users')),
  '/system/role': lazy(() => import('@/features/roles')),
};
```

- [ ] **Step 5: 重新生成路由树并执行前端构建**

Run: `cd admin-shadcn && pnpm build`  
Expected: PASS，`routeTree.gen.ts` 自动更新，无 `gen` 路由残留

- [ ] **Step 6: 运行后端和前端构建确认 TypeORM 已彻底退出**

Run: `cd server && yarn build && cd ..\\admin-shadcn && pnpm build`  
Expected: PASS，搜索仓库不再存在业务代码中的 `@nestjs/typeorm` 和 `typeorm`

- [ ] **Step 7: 提交**

```bash
git add server admin-shadcn
git commit -m "删除 TypeORM 与代码生成器遗留功能"
```

## Task 7: 更新文档、冒烟验证并收口

**Files:**
- Modify: `AGENTS.md`
- Modify: `README.md`
- Modify: `server/db/nest-admin.sql`
- Modify: `docs/superpowers/specs/2026-04-02-prisma-migration-design.md`（如实现中出现必要偏差则同步）
- Test: 手工冒烟记录

- [ ] **Step 1: 更新仓库文档，明确 Prisma 是唯一数据层方案**

```md
- 后端 ORM：Prisma
- 数据结构真相来源：`server/prisma/schema.prisma` + `server/prisma/migrations`
- 代码生成器：已移除，不再维护
```

- [ ] **Step 2: 记录数据库初始化和 SQL 导出方式**

```md
本地初始化建议先执行 Prisma migration，再按需导入 `server/db/nest-admin.sql` 中的演示数据。
数据库备份与导出仍然通过 MySQL 工具链执行，例如 `mysqldump`。
```

- [ ] **Step 3: 运行完整验证命令**

Run: `cd server && yarn prisma:generate && yarn build && yarn test && cd ..\\admin-shadcn && pnpm lint && pnpm test && pnpm build`  
Expected: 全部 PASS

- [ ] **Step 4: 执行人工冒烟**

Run:

```bash
cd server && yarn start:dev
cd admin-shadcn && pnpm dev
```

Expected:
- 可以登录
- 侧边栏正常加载动态菜单
- 用户、角色、菜单、部门、岗位、字典、配置页面可访问
- 登录日志、操作日志、任务、上传页面可访问
- 不存在代码生成器入口

- [ ] **Step 5: 提交**

```bash
git add AGENTS.md README.md server/db/nest-admin.sql
git commit -m "补充 Prisma 迁移后的维护文档"
```

## Self-Review Checklist

- Spec coverage 已覆盖 Prisma 基础设施、schema 与 migration 基线、低耦合模块、系统核心模块、监控与复杂查询、TypeORM 与代码生成器删除、文档和验证收口。
- Placeholder scan 已处理路径和任务中的占位表达，计划可按文件与命令直接执行。
- Type consistency 已统一为 `PrismaService`、`$queryRaw/$executeRaw`、`schema.prisma + migrations` 三个核心约束。
