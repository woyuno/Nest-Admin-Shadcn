import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { ResultData } from 'src/common/utils/result';
import { CreateMenuDto, UpdateMenuDto, ListDeptDto } from './dto/index';
import { ListToTree, Uniq } from 'src/common/utils/index';
import { UserService } from '../user/user.service';
import { buildMenus } from './utils';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MenuService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async create(createMenuDto: CreateMenuDto) {
    const res = await this.prisma.sysMenu.create({
      data: createMenuDto,
    });
    return ResultData.ok(res);
  }

  async findAll(query: ListDeptDto) {
    const where = this.buildWhere(query);
    const res = await this.prisma.sysMenu.findMany({
      where,
      orderBy: [{ parentId: 'asc' }, { orderNum: 'asc' }],
    });
    return ResultData.ok(res);
  }

  async treeSelect() {
    const res = await this.prisma.sysMenu.findMany({
      where: {
        delFlag: '0',
      },
      orderBy: [{ parentId: 'asc' }, { orderNum: 'asc' }],
    });
    const tree = ListToTree(
      res,
      (m) => m.menuId,
      (m) => m.menuName,
    );
    return ResultData.ok(tree);
  }

  async roleMenuTreeselect(roleId: number): Promise<any> {
    const res = await this.prisma.sysMenu.findMany({
      where: {
        delFlag: '0',
      },
      orderBy: [{ parentId: 'asc' }, { orderNum: 'asc' }],
    });
    const tree = ListToTree(
      res,
      (m) => m.menuId,
      (m) => m.menuName,
    );
    const menuIds = await this.prisma.sysRoleMenu.findMany({
      where: { roleId },
      select: {
        menuId: true,
      },
    });
    const checkedKeys = menuIds.map((item) => item.menuId);
    return ResultData.ok({
      menus: tree,
      checkedKeys,
    });
  }

  async findOne(menuId: number) {
    const res = await this.prisma.sysMenu.findFirst({
      where: {
        menuId,
        delFlag: '0',
      },
    });
    return ResultData.ok(res);
  }

  async update(updateMenuDto: UpdateMenuDto) {
    const { menuId, ...data } = updateMenuDto;
    const res = await this.prisma.sysMenu.update({
      where: { menuId },
      data,
    });
    return ResultData.ok(res);
  }

  async remove(menuId: number) {
    const data = await this.prisma.sysMenu.update({
      where: { menuId },
      data: {
        delFlag: '1',
      },
    });
    return ResultData.ok(data);
  }

  async findMany(where: Record<string, unknown>) {
    return this.prisma.sysMenu.findMany({ where });
  }

  async getMenuListByUserId(userId: number) {
    const roleIds = await this.userService.getRoleIds([userId]);
    let menuIds: number[] = [];

    if (roleIds.includes(1)) {
      const menuList = await this.prisma.sysMenu.findMany({
        where: {
          delFlag: '0',
          status: '0',
        },
        select: {
          menuId: true,
        },
      });
      menuIds = menuList.map((item) => item.menuId);
    } else if (roleIds.length > 0) {
      const menuWidthRoleList = await this.prisma.sysRoleMenu.findMany({
        where: {
          roleId: {
            in: roleIds,
          },
        },
        select: {
          menuId: true,
        },
      });
      menuIds = menuWidthRoleList.map((item) => item.menuId);
    }

    const uniqueMenuIds = Uniq(menuIds);
    if (uniqueMenuIds.length === 0) {
      return [];
    }

    const menuList = await this.prisma.sysMenu.findMany({
      where: {
        delFlag: '0',
        status: '0',
        menuId: {
          in: uniqueMenuIds,
        },
      },
      orderBy: [{ parentId: 'asc' }, { orderNum: 'asc' }],
    });
    return buildMenus(menuList);
  }

  private buildWhere(query: ListDeptDto) {
    const where: Record<string, unknown> = {
      delFlag: '0',
    };

    if (query.menuName) {
      where.menuName = { contains: query.menuName };
    }

    if (query.status) {
      where.status = query.status;
    }

    return where;
  }
}
