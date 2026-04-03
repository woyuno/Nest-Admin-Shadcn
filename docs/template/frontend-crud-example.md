# 前端 CRUD 页面样板

这份样板用于在当前模板仓库中新增一个后台页面时，保持与现有 `views + routes + page-registry + TanStack Query` 模式一致，避免同仓库出现第二套页面组织方式。

## 推荐目录结构

以 `admin-shadcn/src/views/configs` 为参考，建议保持：

```text
admin-shadcn/src/views/<domain>/
├─ api/
│  └─ <domain>.ts
├─ components/
│  ├─ <domain>-table.tsx
│  ├─ <domain>-action-dialog.tsx
│  ├─ <domain>-delete-dialog.tsx
│  ├─ <domain>-multi-delete-dialog.tsx
│  ├─ <domain>-dialogs.tsx
│  └─ <domain>-primary-buttons.tsx
├─ data/
│  └─ schema.ts
├─ lib/
│  ├─ <domain>-contract.ts
│  └─ <domain>-contract.test.ts
└─ index.tsx
```

不是每个模块都必须把所有文件建满，但目录职责建议保持一致。

## 路由接入位置

页面路由放在：

```text
admin-shadcn/src/routes/_authenticated/<group>/<page>/index.tsx
```

例如：

- `/system/config`
- `/monitor/job`

路由文件职责通常只有三件事：

1. 定义 `createFileRoute(...)`
2. 声明搜索参数 schema
3. 在 `beforeLoad` 中调用 `assertRouteAccess(...)`

## 页面主体建议结构

页面 `index.tsx` 通常负责：

- 读取路由搜索参数
- 调用 TanStack Query 拉列表数据
- 管理对话框或抽屉开关状态
- 拼装页面头部、主要按钮、表格区域

查询、转换、接口映射尽量下沉到：

- `api/*.ts`
- `lib/*-contract.ts`

如果页面属于典型管理后台列表页，优先复用：

```text
admin-shadcn/src/components/layout/admin-page-shell.tsx
```

这个页面壳已经把以下公共结构收敛起来：

- 顶部 `Header`
- 搜索入口、主题切换、配置抽屉、个人菜单
- 页面标题区
- 主操作按钮区
- 可选的左侧筛选栏 + 右侧正文区布局

推荐做法是让页面本身只关注：

- 路由参数
- Query 请求
- 弹窗状态
- 表格与筛选组件装配

而不要在每个 CRUD 页面里重复拼装一遍头部和标题布局。

## API 层建议

`src/views/<domain>/api/*.ts` 负责：

- 调用 `request`
- 对后端返回结构做最小映射
- 暴露 `queryKey`
- 暴露列表、详情、创建、更新、删除、导出等函数

避免在页面组件里直接手写 Axios 请求。

## contract 层建议

`lib/*-contract.ts` 建议承载：

- 搜索条件与后端查询参数转换
- 列表项映射
- 表单默认值构建
- 保存 payload 构建
- 枚举值与标签映射

这样做的好处是页面层会更薄，也更适合写单元测试。

## 权限接入约定

按钮权限统一通过：

```tsx
<PermissionGuard permissions={['system:config:add']}>
  <Button>新增</Button>
</PermissionGuard>
```

不要把权限逻辑散落成字符串判断。

## 菜单与页面映射约定

新增后台页面时，通常至少要同时处理：

1. 后端菜单数据
2. 前端路由文件
3. `admin-shadcn/src/views/auth/lib/page-registry.ts`
4. 页面内权限点

如果只改一部分，常见结果包括：

- 菜单显示了，但进不去
- 页面存在，但侧边栏不显示
- 按钮权限异常

## 标准 CRUD 页的最小组成

一个典型页面通常包含：

- 标题区
- 主操作按钮
- 列表查询条件
- 数据表格
- 新增/编辑弹窗或抽屉
- 删除确认
- 导出入口

如果模块复杂度较低，也建议保留相同骨架，只减少具体能力，而不是换一套页面组织方式。
