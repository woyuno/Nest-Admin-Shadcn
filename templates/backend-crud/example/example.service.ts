import { Injectable } from '@nestjs/common';
import { ResultData } from 'src/common/utils/result';
import { parsePagination } from 'src/common/utils/pagination';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateExampleDto,
  ListExampleDto,
  UpdateExampleDto,
} from './dto';

@Injectable()
export class ExampleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateExampleDto) {
    await this.prisma.bizExample.create({
      data: dto,
    });

    return ResultData.ok();
  }

  async findAll(query: ListExampleDto) {
    const where = this.buildWhere(query);
    const { skip, take } = parsePagination(query);

    const [list, total] = await Promise.all([
      this.prisma.bizExample.findMany({
        where,
        skip,
        take,
        orderBy: {
          createTime: 'desc',
        },
      }),
      this.prisma.bizExample.count({ where }),
    ]);

    return ResultData.ok({
      list,
      total,
    });
  }

  async findOne(exampleId: number) {
    const data = await this.prisma.bizExample.findUnique({
      where: { exampleId },
    });

    return ResultData.ok(data);
  }

  async update(dto: UpdateExampleDto) {
    const { exampleId, ...data } = dto;

    await this.prisma.bizExample.update({
      where: { exampleId },
      data,
    });

    return ResultData.ok();
  }

  async remove(exampleIds: number[]) {
    await this.prisma.bizExample.updateMany({
      where: {
        exampleId: { in: exampleIds },
      },
      data: {
        delFlag: '1',
      },
    });

    return ResultData.ok();
  }

  private buildWhere(query: ListExampleDto) {
    const where: Record<string, unknown> = {
      delFlag: '0',
    };

    if (query.exampleName) {
      where.exampleName = {
        contains: query.exampleName,
      };
    }

    if (query.status) {
      where.status = query.status;
    }

    return where;
  }
}
