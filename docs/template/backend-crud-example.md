# 后端 CRUD 模块样板

这份样板用于在当前模板仓库中新增一个后端业务模块时，快速沿用既有 Nest + Prisma 结构，而不是临时拼一套新的实现方式。

## 推荐目录结构

以 `system/config` 为参考，建议保持：

```text
server/src/module/<domain>/<module>/
├─ dto/
│  └─ index.ts
├─ <module>.controller.ts
├─ <module>.service.ts
├─ <module>.service.spec.ts
└─ <module>.module.ts
```

如果模块属于已有聚合域：

- 系统管理：挂在 `server/src/module/system`
- 系统监控：挂在 `server/src/module/monitor`

## 最小职责拆分

- `dto/index.ts`
  放创建、更新、列表查询、导出所需 DTO
- `*.controller.ts`
  负责路由、权限装饰器、操作日志装饰器、请求参数接收
- `*.service.ts`
  负责 Prisma 查询与业务逻辑
- `*.module.ts`
  负责在当前聚合域中注册 controller 和 service
- `*.service.spec.ts`
  负责最小行为测试，优先覆盖列表查询、分页、关键业务分支

## 标准接口集合

一个典型 CRUD 模块至少应考虑以下接口：

- `GET /xxx/list`：列表
- `GET /xxx/:id`：详情
- `POST /xxx`：创建
- `PUT /xxx`：更新
- `DELETE /xxx/:ids`：删除
- `POST /xxx/export`：导出

如果模块存在状态切换、授权、清空缓存、清空日志等写操作，也应明确独立接口，而不是塞进列表或详情接口里。

## 权限与审计约定

### 权限

写法沿用现有装饰器：

```ts
@RequirePermission('system:config:list')
```

建议权限点命名与菜单权限保持一致，例如：

- `system:xxx:list`
- `system:xxx:query`
- `system:xxx:add`
- `system:xxx:edit`
- `system:xxx:remove`
- `system:xxx:export`

### 操作日志

所有有副作用的接口默认补 `@Operlog`，例如：

```ts
@Operlog({ businessType: BusinessType.INSERT })
@Operlog({ businessType: BusinessType.UPDATE })
@Operlog({ businessType: BusinessType.DELETE })
@Operlog({ businessType: BusinessType.EXPORT })
```

纯查询接口默认不加。

## Prisma 约定

当前模板后端数据库访问统一走 Prisma：

1. 先改 `server/prisma/schema.prisma`
2. 再执行 migration
3. 业务查询统一通过 `PrismaService`
4. 不新增 TypeORM 风格的 entity / repository / module

## 列表与分页约定

HTTP query 进入 Nest 时默认是字符串，例如：

- `pageNum=1`
- `pageSize=10`

进入 Prisma `skip/take` 前必须显式转成数字，推荐统一复用分页工具或统一转换逻辑，不要把字符串直接传给 Prisma。

列表接口建议统一返回：

```ts
ResultData.ok({
  list,
  total,
})
```

## 导出约定

导出接口建议复用列表筛选参数，但去掉分页限制：

```ts
delete body.pageNum;
delete body.pageSize;
```

然后基于筛选结果调用 `ExportTable(...)`。

## 新增模块建议顺序

1. 先确认该模块属于 `system` 还是 `monitor`
2. 修改 Prisma schema
3. 新建 dto、service、controller、module
4. 在聚合模块中注册
5. 补权限点与操作日志
6. 补 service 级测试
7. 如果需要前端页面，再补前端 route、view、page-registry、菜单数据
