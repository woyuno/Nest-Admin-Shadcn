import { Injectable } from '@nestjs/common';
import { ListJobLogDto } from './dto/create-job.dto';
import { ResultData } from 'src/common/utils/result';
import { ExportTable } from 'src/common/utils/export';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JobLogService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 查询任务日志列表
   */
  async list(query: ListJobLogDto) {
    const where = this.buildWhere(query);
    const findManyArgs: {
      where: Record<string, unknown>;
      skip?: number;
      take?: number;
      orderBy: Array<Record<string, 'asc' | 'desc'>>;
    } = {
      where,
      orderBy: [{ createTime: 'desc' }],
    };

    if (query.pageSize && query.pageNum) {
      const pageSize = Number(query.pageSize);
      const pageNum = Number(query.pageNum);
      findManyArgs.skip = pageSize * (pageNum - 1);
      findManyArgs.take = pageSize;
    }

    const [list, total] = await Promise.all([
      this.prisma.sysJobLog.findMany(findManyArgs),
      this.prisma.sysJobLog.count({ where }),
    ]);

    return ResultData.ok({
      list,
      total,
    });
  }

  /**
   * 添加任务日志
   */
  async addJobLog(jobLog: Record<string, unknown>) {
    await this.prisma.sysJobLog.create({
      data: jobLog as never,
    });
    return ResultData.ok();
  }

  /**
   * 清空日志
   */
  async clean() {
    await this.prisma.sysJobLog.deleteMany();
    return ResultData.ok();
  }

  /**
   * 导出调度日志为xlsx文件
   * @param res
   */
  async export(res: Response, body: ListJobLogDto) {
    delete body.pageNum;
    delete body.pageSize;
    const list = await this.list(body);
    const options = {
      sheetName: '调度日志',
      data: list.data.list,
      header: [
        { title: '日志编号', dataIndex: 'jobLogId' },
        { title: '任务名称', dataIndex: 'jobName' },
        { title: '任务组名', dataIndex: 'jobGroup' },
        { title: '调用目标字符串', dataIndex: 'invokeTarget' },
        { title: '日志信息', dataIndex: 'jobMessage' },
        { title: '执行时间', dataIndex: 'createTime' },
      ],
      dictMap: {
        status: {
          '0': '成功',
          '1': '失败',
        },
        jobGroup: {
          SYSTEM: '系统',
          DEFAULT: '默认',
        },
      },
    };
    ExportTable(options, res);
  }

  private buildWhere(query: ListJobLogDto) {
    const where: Record<string, unknown> = {};

    if (query.jobName) {
      where.jobName = {
        contains: query.jobName,
      };
    }

    if (query.jobGroup) {
      where.jobGroup = query.jobGroup;
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
}
