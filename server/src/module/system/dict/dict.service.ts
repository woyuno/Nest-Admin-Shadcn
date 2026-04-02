import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { ResultData } from 'src/common/utils/result';
import { CacheEnum } from 'src/common/enum/index';
import { ExportTable } from 'src/common/utils/export';
import { CreateDictTypeDto, UpdateDictTypeDto, ListDictType, CreateDictDataDto, UpdateDictDataDto, ListDictData } from './dto/index';
import { RedisService } from 'src/module/common/redis/redis.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DictService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async createType(createDictTypeDto: CreateDictTypeDto) {
    await this.prisma.sysDictType.create({
      data: createDictTypeDto,
    });
    return ResultData.ok();
  }

  async deleteType(dictIds: number[]) {
    await this.prisma.sysDictType.updateMany({
      where: {
        dictId: { in: dictIds },
      },
      data: {
        delFlag: '1',
      },
    });
    return ResultData.ok();
  }

  async updateType(updateDictTypeDto: UpdateDictTypeDto) {
    const { dictId, ...data } = updateDictTypeDto;
    await this.prisma.sysDictType.update({
      where: {
        dictId,
      },
      data,
    });
    return ResultData.ok();
  }

  async findAllType(query: ListDictType) {
    const where = this.buildTypeWhere(query);
    const findManyArgs: {
      where: Record<string, unknown>;
      skip?: number;
      take?: number;
      orderBy: Array<Record<string, 'asc' | 'desc'>>;
    } = {
      where,
      orderBy: [{ dictId: 'asc' }],
    };

    if (query.pageSize && query.pageNum) {
      const pageSize = Number(query.pageSize);
      const pageNum = Number(query.pageNum);
      findManyArgs.skip = pageSize * (pageNum - 1);
      findManyArgs.take = pageSize;
    }

    const [list, total] = await Promise.all([
      this.prisma.sysDictType.findMany(findManyArgs),
      this.prisma.sysDictType.count({ where }),
    ]);

    return ResultData.ok({
      list,
      total,
    });
  }

  async findOneType(dictId: number) {
    const data = await this.prisma.sysDictType.findFirst({
      where: {
        dictId,
        delFlag: '0',
      },
    });
    return ResultData.ok(data);
  }

  async findOptionselect() {
    const data = await this.prisma.sysDictType.findMany({
      where: {
        delFlag: '0',
      },
      orderBy: [{ dictId: 'asc' }],
    });
    return ResultData.ok(data);
  }

  async createDictData(createDictDataDto: CreateDictDataDto) {
    await this.prisma.sysDictData.create({
      data: createDictDataDto,
    });
    return ResultData.ok();
  }

  async deleteDictData(dictIds: number[]) {
    await this.prisma.sysDictData.updateMany({
      where: {
        dictCode: {
          in: dictIds,
        },
      },
      data: {
        delFlag: '1',
      },
    });
    return ResultData.ok();
  }

  async updateDictData(updateDictDataDto: UpdateDictDataDto) {
    const { dictCode, ...data } = updateDictDataDto;
    await this.prisma.sysDictData.update({
      where: {
        dictCode,
      },
      data,
    });
    return ResultData.ok();
  }

  async findAllData(query: ListDictData) {
    const where = this.buildDataWhere(query);
    const findManyArgs: {
      where: Record<string, unknown>;
      skip?: number;
      take?: number;
      orderBy: Array<Record<string, 'asc' | 'desc'>>;
    } = {
      where,
      orderBy: [{ dictSort: 'asc' }, { dictCode: 'asc' }],
    };

    if (query.pageSize && query.pageNum) {
      const pageSize = Number(query.pageSize);
      const pageNum = Number(query.pageNum);
      findManyArgs.skip = pageSize * (pageNum - 1);
      findManyArgs.take = pageSize;
    }

    const [list, total] = await Promise.all([
      this.prisma.sysDictData.findMany(findManyArgs),
      this.prisma.sysDictData.count({ where }),
    ]);

    return ResultData.ok({
      list,
      total,
    });
  }

  async findOneDataType(dictType: string) {
    let data = await this.redisService.get(`${CacheEnum.SYS_DICT_KEY}${dictType}`);

    if (data) {
      return ResultData.ok(data);
    }

    data = await this.prisma.sysDictData.findMany({
      where: {
        dictType,
        delFlag: '0',
      },
      orderBy: [{ dictSort: 'asc' }, { dictCode: 'asc' }],
    });

    await this.redisService.set(`${CacheEnum.SYS_DICT_KEY}${dictType}`, data);
    return ResultData.ok(data);
  }

  async findOneDictData(dictCode: number) {
    const data = await this.prisma.sysDictData.findFirst({
      where: {
        dictCode,
        delFlag: '0',
      },
    });
    return ResultData.ok(data);
  }

  async export(res: Response, body: ListDictType) {
    delete body.pageNum;
    delete body.pageSize;
    const list = await this.findAllType(body);
    const options = {
      sheetName: '字典数据',
      data: list.data.list,
      header: [
        { title: '字典主键', dataIndex: 'dictId' },
        { title: '字典名称', dataIndex: 'dictName' },
        { title: '字典类型', dataIndex: 'dictType' },
        { title: '状态', dataIndex: 'status' },
      ],
    };
    ExportTable(options, res);
  }

  async exportData(res: Response, body: ListDictType) {
    delete body.pageNum;
    delete body.pageSize;
    const list = await this.findAllData(body as ListDictData);
    const options = {
      sheetName: '字典数据',
      data: list.data.list,
      header: [
        { title: '字典主键', dataIndex: 'dictCode' },
        { title: '字典名称', dataIndex: 'dictLabel' },
        { title: '字典类型', dataIndex: 'dictValue' },
        { title: '备注', dataIndex: 'remark' },
      ],
    };
    ExportTable(options, res);
  }

  async resetDictCache() {
    await this.clearDictCache();
    await this.loadingDictCache();
    return ResultData.ok();
  }

  async clearDictCache() {
    const keys = await this.redisService.keys(`${CacheEnum.SYS_DICT_KEY}*`);
    if (keys && keys.length > 0) {
      await this.redisService.del(keys);
    }
  }

  async loadingDictCache() {
    const list = await this.prisma.sysDictType.findMany({
      where: {
        delFlag: '0',
      },
      include: {
        dictData: {
          where: {
            delFlag: '0',
          },
          orderBy: {
            dictSort: 'asc',
          },
        },
      },
    });

    list.forEach((item) => {
      if (item.dictType) {
        this.redisService.set(`${CacheEnum.SYS_DICT_KEY}${item.dictType}`, item.dictData);
      }
    });
  }

  private buildTypeWhere(query: ListDictType) {
    const where: Record<string, unknown> = {
      delFlag: '0',
    };

    if (query.dictName) {
      where.dictName = { contains: query.dictName };
    }

    if (query.dictType) {
      where.dictType = { contains: query.dictType };
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

  private buildDataWhere(query: ListDictData) {
    const where: Record<string, unknown> = {
      delFlag: '0',
    };

    if (query.dictLabel) {
      where.dictLabel = { contains: query.dictLabel };
    }

    if (query.dictType) {
      where.dictType = { contains: query.dictType };
    }

    if (query.status) {
      where.status = query.status;
    }

    return where;
  }
}
