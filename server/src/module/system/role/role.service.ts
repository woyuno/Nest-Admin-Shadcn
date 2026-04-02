import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { ResultData } from 'src/common/utils/result';
import { ListToTree, Uniq } from 'src/common/utils/index';
import { ExportTable } from 'src/common/utils/export';
import { DataScopeEnum } from 'src/common/enum/index';
import { MenuService } from '../menu/menu.service';
import { CreateRoleDto, UpdateRoleDto, ListRoleDto, ChangeStatusDto } from './dto/index';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly menuService: MenuService,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const { menuIds = [], deptIds = [], ...roleData } = createRoleDto;
    const res = await this.prisma.sysRole.create({
      data: this.normalizeRoleWriteData(roleData) as never,
    });

    await this.prisma.$transaction(async (tx) => {
      if (menuIds.length > 0) {
        await tx.sysRoleMenu.createMany({
          data: menuIds.map((menuId) => ({
            roleId: res.roleId,
            menuId,
          })),
        });
      }

      if (roleData.dataScope === DataScopeEnum.DATA_SCOPE_CUSTOM && deptIds.length > 0) {
        await tx.sysRoleDept.createMany({
          data: deptIds.map((deptId) => ({
            roleId: res.roleId,
            deptId,
          })),
        });
      }
    });

    return ResultData.ok(res);
  }

  async findAll(query: ListRoleDto) {
    const where = this.buildWhere(query);
    const findManyArgs: {
      where: Record<string, unknown>;
      skip?: number;
      take?: number;
      orderBy: Array<Record<string, 'asc' | 'desc'>>;
    } = {
      where,
      orderBy: [{ roleSort: 'asc' }, { roleId: 'asc' }],
    };

    if (query.pageSize && query.pageNum) {
      const pageSize = Number(query.pageSize);
      const pageNum = Number(query.pageNum);
      findManyArgs.skip = pageSize * (pageNum - 1);
      findManyArgs.take = pageSize;
    }

    const [list, total] = await Promise.all([
      this.prisma.sysRole.findMany(findManyArgs),
      this.prisma.sysRole.count({ where }),
    ]);

    return ResultData.ok({
      list,
      total,
    });
  }

  async findOne(roleId: number) {
    const res = await this.prisma.sysRole.findFirst({
      where: {
        roleId,
        delFlag: '0',
      },
    });
    return ResultData.ok(res);
  }

  async update(updateRoleDto: UpdateRoleDto) {
    const { roleId, menuIds = [], deptIds, ...roleData } = updateRoleDto;

    const res = await this.prisma.$transaction(async (tx) => {
      await tx.sysRoleMenu.deleteMany({
        where: {
          roleId,
        },
      });

      if (menuIds.length > 0) {
        await tx.sysRoleMenu.createMany({
          data: menuIds.map((menuId) => ({
            roleId,
            menuId,
          })),
        });
      }

      return tx.sysRole.update({
        where: {
          roleId,
        },
        data: this.normalizeRoleWriteData(roleData) as never,
      });
    });

    return ResultData.ok(res);
  }

  async dataScope(updateRoleDto: UpdateRoleDto) {
    const { roleId, deptIds = [], menuIds, ...roleData } = updateRoleDto;

    const res = await this.prisma.$transaction(async (tx) => {
      await tx.sysRoleDept.deleteMany({
        where: {
          roleId,
        },
      });

      if (roleData.dataScope === DataScopeEnum.DATA_SCOPE_CUSTOM && deptIds.length > 0) {
        await tx.sysRoleDept.createMany({
          data: deptIds.map((deptId) => ({
            roleId,
            deptId,
          })),
        });
      }

      return tx.sysRole.update({
        where: {
          roleId,
        },
        data: this.normalizeRoleWriteData(roleData) as never,
      });
    });

    return ResultData.ok(res);
  }

  async changeStatus(changeStatusDto: ChangeStatusDto) {
    const res = await this.prisma.sysRole.update({
      where: {
        roleId: changeStatusDto.roleId,
      },
      data: {
        status: changeStatusDto.status,
      },
    });
    return ResultData.ok(res);
  }

  async remove(roleIds: number[]) {
    const data = await this.prisma.sysRole.updateMany({
      where: {
        roleId: {
          in: roleIds,
        },
      },
      data: {
        delFlag: '1',
      },
    });
    return ResultData.ok(data);
  }

  async deptTree(roleId: number) {
    const res = await this.prisma.sysDept.findMany({
      where: {
        delFlag: '0',
      },
      orderBy: [{ parentId: 'asc' }, { orderNum: 'asc' }],
    });
    const tree = ListToTree(
      res,
      (m) => +m.deptId,
      (m) => m.deptName,
    );
    const deptIds = await this.prisma.sysRoleDept.findMany({
      where: { roleId },
      select: {
        deptId: true,
      },
    });
    const checkedKeys = deptIds.map((item) => item.deptId);
    return ResultData.ok({
      depts: tree,
      checkedKeys,
    });
  }

  async findRoles(where: Record<string, unknown>) {
    return this.prisma.sysRole.findMany({ where });
  }

  async getPermissionsByRoleIds(roleIds: number[]) {
    if (roleIds.includes(1)) {
      return [{ perms: '*:*:*' }];
    }

    if (roleIds.length === 0) {
      return [];
    }

    const list = await this.prisma.sysRoleMenu.findMany({
      where: {
        roleId: {
          in: roleIds,
        },
      },
      select: {
        menuId: true,
      },
    });
    const menuIds = Uniq(list.map((item) => item.menuId));
    if (menuIds.length === 0) {
      return [];
    }

    return this.menuService.findMany({
      delFlag: '0',
      status: '0',
      menuId: {
        in: menuIds,
      },
    });
  }

  async findRoleWithDeptIds(roleId: number) {
    const res = await this.prisma.sysRoleDept.findMany({
      select: {
        deptId: true,
      },
      where: {
        roleId,
      },
    });
    return res.map((item) => item.deptId);
  }

  async export(res: Response, body: ListRoleDto) {
    delete body.pageNum;
    delete body.pageSize;
    const list = await this.findAll(body);
    const options = {
      sheetName: '角色数据',
      data: list.data.list,
      header: [
        { title: '角色编号', dataIndex: 'roleId' },
        { title: '角色名称', dataIndex: 'roleName', width: 15 },
        { title: '权限字符', dataIndex: 'roleKey' },
        { title: '显示顺序', dataIndex: 'roleSort' },
        { title: '状态', dataIndex: 'status' },
        { title: '创建时间', dataIndex: 'createTime', width: 15 },
      ],
    };
    ExportTable(options, res);
  }

  private buildWhere(query: ListRoleDto) {
    const where: Record<string, unknown> = {
      delFlag: '0',
    };

    if (query.roleName) {
      where.roleName = { contains: query.roleName };
    }

    if (query.roleKey) {
      where.roleKey = { contains: query.roleKey };
    }

    if (query.roleId) {
      where.roleId = Number(query.roleId);
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.params?.beginTime && query.params?.endTime) {
      where.createTime = {
        gte: new Date(query.params.beginTime),
        lte: new Date(query.params.endTime),
      };
    }

    return where;
  }

  private normalizeRoleWriteData(roleData: Record<string, unknown>) {
    return {
      ...roleData,
      ...(roleData.menuCheckStrictly !== undefined
        ? {
            menuCheckStrictly: roleData.menuCheckStrictly ? 1 : 0,
          }
        : {}),
      ...(roleData.deptCheckStrictly !== undefined
        ? {
            deptCheckStrictly: roleData.deptCheckStrictly ? 1 : 0,
          }
        : {}),
    };
  }
}
