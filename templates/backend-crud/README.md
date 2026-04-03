# 后端 CRUD 真代码样板

这套样板用于给新项目或新模块提供一个可直接复制改名的 Nest + Prisma 起点。

## 使用方式

1. 复制 `example` 目录到目标聚合模块下，例如 `server/src/module/system/example`
2. 把文件名中的 `example`、类名中的 `Example` 替换成你的业务名
3. 按照真实表结构修改 Prisma model 名称、字段和查询条件
4. 在对应聚合模块中注册 `ExampleModule`
5. 补菜单权限、操作日志覆盖测试和最小 service 测试

## 样板覆盖内容

- `controller + service + dto + module`
- 列表、详情、新增、更新、删除
- `@RequirePermission`
- `@Operlog`
- `parsePagination`
- Prisma `where` 构建

## 刻意没有放进去的内容

- 导出能力
- 字典映射
- Redis 缓存
- 复杂联表

这些能力建议在复制样板后，参考仓库内同类真实模块按需补充。
