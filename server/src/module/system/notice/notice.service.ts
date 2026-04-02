import { Injectable } from '@nestjs/common';
import { ResultData } from 'src/common/utils/result';
import { CreateNoticeDto, UpdateNoticeDto, ListNoticeDto } from './dto/index';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NoticeService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}
  async create(createNoticeDto: CreateNoticeDto) {
    await this.prisma.sysNotice.create({
      data: createNoticeDto,
    });
    return ResultData.ok();
  }

  async findAll(query: ListNoticeDto) {
    const where: Record<string, unknown> = {
      delFlag: '0',
    };

    if (query.noticeTitle) {
      where.noticeTitle = { contains: query.noticeTitle };
    }

    if (query.createBy) {
      where.createBy = { contains: query.createBy };
    }

    if (query.noticeType) {
      where.noticeType = query.noticeType;
    }

    if (query.params?.beginTime && query.params?.endTime) {
      where.createTime = {
        gte: new Date(query.params.beginTime),
        lte: new Date(query.params.endTime),
      };
    }

    const findManyArgs: {
      where: Record<string, unknown>;
      skip?: number;
      take?: number;
    } = { where };

    if (query.pageSize && query.pageNum) {
      const pageSize = Number(query.pageSize);
      const pageNum = Number(query.pageNum);
      findManyArgs.skip = pageSize * (pageNum - 1);
      findManyArgs.take = pageSize;
    }

    const [list, total] = await Promise.all([this.prisma.sysNotice.findMany(findManyArgs), this.prisma.sysNotice.count({ where })]);

    return ResultData.ok({
      list,
      total,
    });
  }

  async findOne(noticeId: number) {
    const data = await this.prisma.sysNotice.findUnique({
      where: {
        noticeId,
      },
    });
    return ResultData.ok(data);
  }

  async update(updateNoticeDto: UpdateNoticeDto) {
    const { noticeId, ...data } = updateNoticeDto;
    await this.prisma.sysNotice.update({
      where: { noticeId },
      data,
    });
    return ResultData.ok();
  }

  async remove(noticeIds: number[]) {
    const data = await this.prisma.sysNotice.updateMany({
      where: { noticeId: { in: noticeIds } },
      data: {
        delFlag: '1',
      },
    });
    return ResultData.ok(data);
  }
}
