import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { ResultData } from 'src/common/utils/result';
import { ExportTable } from 'src/common/utils/export';
import { CreateLoginlogDto, ListLoginlogDto } from './dto/index';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LoginlogService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建用户登录日志
   * @param createLoginlogDto
   * @returns
   */
  async create(createLoginlogDto: CreateLoginlogDto) {
    const {
      ipaddr,
      userName,
      loginLocation,
      browser,
      os,
      msg,
      status,
      dateTime,
    } = createLoginlogDto as CreateLoginlogDto & { dateTime?: string };

    return await this.prisma.sysLogininfor.create({
      data: {
        ipaddr,
        userName,
        loginLocation,
        browser,
        os,
        msg,
        status,
        loginTime: dateTime ? new Date(dateTime) : undefined,
      },
    });
  }

  /**
   * 日志列表-分页
   * @param query
   * @returns
   */
  async findAll(query: ListLoginlogDto) {
    const where: Record<string, unknown> = {
      delFlag: '0',
    };

    if (query.ipaddr) {
      where.ipaddr = { contains: query.ipaddr };
    }

    if (query.userName) {
      where.userName = { contains: query.userName };
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.params?.beginTime && query.params?.endTime) {
      where.loginTime = {
        gte: new Date(query.params.beginTime),
        lte: new Date(query.params.endTime),
      };
    }

    const orderBy = query.orderByColumn && query.isAsc ? { [query.orderByColumn]: query.isAsc === 'ascending' ? 'asc' : 'desc' } : undefined;
    const pageSize = Number(query.pageSize);
    const pageNum = Number(query.pageNum);
    const [list, total] = await Promise.all([
      this.prisma.sysLogininfor.findMany({
        where,
        ...(orderBy ? { orderBy } : {}),
        ...(query.pageSize && query.pageNum
          ? {
              skip: pageSize * (pageNum - 1),
              take: pageSize,
            }
          : {}),
      }),
      this.prisma.sysLogininfor.count({ where }),
    ]);

    return ResultData.ok({
      list,
      total,
    });
  }

  /**
   * 删除日志
   * @returns
   */
  async remove(ids: string[]) {
    const data = await this.prisma.sysLogininfor.updateMany({
      where: { infoId: { in: ids.map((id) => Number(id)) } },
      data: {
        delFlag: '1',
      },
    });
    return ResultData.ok(data);
  }

  /**
   * 删除全部日志
   * @returns
   */
  async removeAll() {
    await this.prisma.sysLogininfor.updateMany({
      data: {
        delFlag: '1',
      },
    });
    return ResultData.ok();
  }

  /**
   * 导出登录日志数据为xlsx
   * @param res
   */
  async export(res: Response, body: ListLoginlogDto) {
    delete body.pageNum;
    delete body.pageSize;
    const list = await this.findAll(body);
    const options = {
      sheetName: '登录日志',
      data: list.data.list,
      header: [
        { title: '序号', dataIndex: 'infoId' },
        { title: '用户账号', dataIndex: 'userName' },
        { title: '登录状态', dataIndex: 'status' },
        { title: '登录地址', dataIndex: 'ipaddr' },
        { title: '登录地点', dataIndex: 'loginLocation' },
        { title: '浏览器', dataIndex: 'browser' },
        { title: '操作系统', dataIndex: 'os' },
        { title: '提示消息', dataIndex: 'msg' },
        { title: '访问时间', dataIndex: 'loginTime' },
      ],
      dictMap: {
        status: {
          '0': '成功',
          '1': '失败',
        },
      },
    };
    ExportTable(options, res);
  }
}
