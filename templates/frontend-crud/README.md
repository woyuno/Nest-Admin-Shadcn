# 前端 CRUD 真代码样板

这套样板用于给新页面提供一个可直接复制改名的 React 管理页起点。

## 使用方式

1. 复制 `example-view` 到 `admin-shadcn/src/views/<domain>`
2. 复制 `example-route.index.tsx` 到 `admin-shadcn/src/routes/_authenticated/<group>/<page>/index.tsx`
3. 参考 `page-registry.entry.ts` 把页面登记到 `page-registry.ts`
4. 把 `Example`、`example`、权限点和接口路径替换成真实业务名
5. 按需补对话框、行操作、导出、批量删除

## 样板覆盖内容

- 路由搜索参数 schema
- `AdminPageShell`
- TanStack Query 列表请求
- `api` 层
- `contract` 层
- 搜索栏 helper 模式
- `PermissionGuard`
- `page-registry` 接入示例

## 刻意没有放进去的内容

- 表单弹窗细节
- 行内复杂交互
- 多标签页状态同步
- 字典联动

这些能力建议复制样板后，参考 `configs`、`users`、`tasks` 等真实模块继续扩展。

如果你的页面需要顶部筛选栏，优先参考：

- `example-view/components/example-search-toolbar.helpers.ts`

这个 helper 模式已经覆盖了当前仓库里最常见的 4 件事：

- 从路由 search 构建本地草稿
- 提交搜索时重置回第一页
- 空字符串转成 `undefined`
- 日期区间不完整时自动丢弃
