import { Injectable } from '@nestjs/common';
import { ResultData } from 'src/common/utils/result';
import { CreateDeptDto, UpdateDeptDto, ListDeptDto } from './dto/index';
import { ListToTree } from 'src/common/utils/index';
import { CacheEnum, DataScopeEnum } from 'src/common/enum/index';
import { Cacheable, CacheEvict } from 'src/common/decorators/redis.decorator';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DeptService {
  constructor(private readonly prisma: PrismaService) {}

  @CacheEvict(CacheEnum.SYS_DEPT_KEY, '*')
  async create(createDeptDto: CreateDeptDto) {
    const data = {
      parentId: createDeptDto.parentId,
      deptName: createDeptDto.deptName,
      orderNum: createDeptDto.orderNum,
      leader: createDeptDto.leader ?? '',
      phone: createDeptDto.phone ?? '',
      email: createDeptDto.email ?? '',
      status: createDeptDto.status ?? '0',
      ancestors: undefined as string | undefined,
    };

    if (data.parentId) {
      const parent = await this.prisma.sysDept.findUnique({
        where: {
          deptId: data.parentId,
        },
        select: {
          ancestors: true,
          delFlag: true,
        },
      });

      if (!parent || parent.delFlag !== '0') {
        return ResultData.fail(500, '父级部门不存在');
      }

      data.ancestors = parent.ancestors ? `${parent.ancestors},${data.parentId}` : `${data.parentId}`;
    }

    await this.prisma.sysDept.create({
      data,
    });
    return ResultData.ok();
  }

  async findAll(query: ListDeptDto) {
    const where = this.buildWhere(query);
    const res = await this.prisma.sysDept.findMany({
      where,
      orderBy: [{ parentId: 'asc' }, { orderNum: 'asc' }],
    });
    return ResultData.ok(res);
  }

  @Cacheable(CacheEnum.SYS_DEPT_KEY, 'findOne:{deptId}')
  async findOne(deptId: number) {
    const data = await this.prisma.sysDept.findFirst({
      where: {
        deptId,
        delFlag: '0',
      },
    });
    return ResultData.ok(data);
  }

  @Cacheable(CacheEnum.SYS_DEPT_KEY, 'findDeptIdsByDataScope:{deptId}-{dataScope}')
  async findDeptIdsByDataScope(deptId: number, dataScope: DataScopeEnum) {
    if (dataScope === DataScopeEnum.DATA_SCOPE_SELF) {
      return [];
    }

    const where: Record<string, unknown> = {
      delFlag: '0',
    };

    if (dataScope === DataScopeEnum.DATA_SCOPE_DEPT) {
      where.deptId = deptId;
    } else if (dataScope === DataScopeEnum.DATA_SCOPE_DEPT_AND_CHILD) {
      where.OR = [
        { deptId },
        { ancestors: `${deptId}` },
        { ancestors: { startsWith: `${deptId},` } },
        { ancestors: { endsWith: `,${deptId}` } },
        { ancestors: { contains: `,${deptId},` } },
      ];
    }

    const list = await this.prisma.sysDept.findMany({
      where,
      select: {
        deptId: true,
      },
      orderBy: [{ parentId: 'asc' }, { orderNum: 'asc' }],
    });

    return list.map((item) => item.deptId);
  }

  @Cacheable(CacheEnum.SYS_DEPT_KEY, 'findListExclude')
  async findListExclude(id: number) {
    const data = await this.prisma.sysDept.findMany({
      where: {
        delFlag: '0',
      },
    });

    return ResultData.ok(data.filter((item) => item.deptId !== id && !item.ancestors.split(',').includes(`${id}`)));
  }

  @CacheEvict(CacheEnum.SYS_DEPT_KEY, '*')
  async update(updateDeptDto: UpdateDeptDto) {
    const data = {
      deptName: updateDeptDto.deptName,
      parentId: updateDeptDto.parentId,
      orderNum: updateDeptDto.orderNum,
      leader: updateDeptDto.leader ?? '',
      phone: updateDeptDto.phone ?? '',
      email: updateDeptDto.email ?? '',
      status: updateDeptDto.status ?? '0',
      ancestors: undefined as string | undefined,
    };

    if (updateDeptDto.parentId && updateDeptDto.parentId !== 0) {
      const parent = await this.prisma.sysDept.findUnique({
        where: {
          deptId: updateDeptDto.parentId,
        },
        select: {
          ancestors: true,
          delFlag: true,
        },
      });

      if (!parent || parent.delFlag !== '0') {
        return ResultData.fail(500, '父级部门不存在');
      }

      data.ancestors = parent.ancestors ? `${parent.ancestors},${updateDeptDto.parentId}` : `${updateDeptDto.parentId}`;
    }

    await this.prisma.sysDept.update({
      where: {
        deptId: updateDeptDto.deptId,
      },
      data,
    });
    return ResultData.ok();
  }

  @CacheEvict(CacheEnum.SYS_DEPT_KEY, '*')
  async remove(deptId: number) {
    const data = await this.prisma.sysDept.update({
      where: {
        deptId,
      },
      data: {
        delFlag: '1',
      },
    });
    return ResultData.ok(data);
  }

  @Cacheable(CacheEnum.SYS_DEPT_KEY, 'deptTree')
  async deptTree() {
    const res = await this.prisma.sysDept.findMany({
      where: {
        delFlag: '0',
      },
      orderBy: [{ parentId: 'asc' }, { orderNum: 'asc' }],
    });
    return ListToTree(
      res,
      (m) => m.deptId,
      (m) => m.deptName,
    );
  }

  private buildWhere(query: ListDeptDto) {
    const where: Record<string, unknown> = {
      delFlag: '0',
    };

    if (query.deptName) {
      where.deptName = { contains: query.deptName };
    }

    if (query.status) {
      where.status = query.status;
    }

    return where;
  }
}
