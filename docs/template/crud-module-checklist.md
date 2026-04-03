# CRUD 模块接入检查清单

这份清单用于新增一个业务模块时，快速确认当前改动是否已经走完模板约定中的关键联动点。

## 后端

1. `server/prisma/schema.prisma` 是否已经更新
2. 是否已执行 Prisma migration 或至少明确迁移计划
3. 是否已建立 `controller + service + dto + module`
4. 列表接口是否统一返回 `list + total`
5. 分页参数进入 Prisma 前是否已显式转成 `number`
6. 所有写接口是否已补 `@Operlog`
7. 权限点是否与菜单权限保持一致
8. 是否已补最小 service 级测试

## 前端

1. 是否已创建 `src/views/<domain>` 业务目录
2. 是否已创建 `src/routes/_authenticated/...` 路由文件
3. 是否已通过 `defineFrontendPageRegistry(...)` 在 `page-registry.ts` 中登记页面映射
4. 是否已补 `api/*.ts`
5. 是否已补 `lib/*-contract.ts`
6. 是否已为按钮或关键交互补 `PermissionGuard`
7. 是否已确认页面标题、按钮、表单文案为中文
8. 典型管理页是否优先复用 `AdminPageShell`

## 菜单与权限联动

1. 后端菜单数据是否存在
2. 后端菜单 path/component 是否与前端映射一致
3. 前端侧边栏是否能正常显示目标菜单
4. 页面跳转是否命中正确路由
5. 权限按钮显示是否符合预期

## 最小验证

1. 后端 `yarn build`
2. 前端 `pnpm build`
3. 能正常登录
4. 目标菜单可见
5. 目标页面可打开
6. 列表接口能正常返回
7. 根目录 `npm run verify:template` 能通过
