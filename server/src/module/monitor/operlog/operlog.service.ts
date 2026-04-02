import { Injectable, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { ResultData } from 'src/common/utils/result';
import { AxiosService } from 'src/module/common/axios/axios.service';
import { QueryOperLogDto } from './dto/operLog.dto';
import { ExportTable } from 'src/common/utils/export';
import { Response } from 'express';
import { DictService } from 'src/module/system/dict/dict.service';
import { isEmpty } from 'src/common/utils';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable({ scope: Scope.REQUEST })
export class OperlogService {
  constructor(
    @Inject(REQUEST)
    private readonly request: Request & { user: any },
    private readonly prisma: PrismaService,
    private readonly axiosService: AxiosService,
    @Inject(DictService)
    private readonly dictService: DictService,
  ) {}

  async findAll(query: QueryOperLogDto) {
    const where: Record<string, unknown> = {};
    if (!isEmpty(query.operId)) {
      where.operId = query.operId;
    }
    if (!isEmpty(query.title)) {
      where.title = query.title;
    }
    if (!isEmpty(query.businessType)) {
      where.businessType = query.businessType;
    }
    if (!isEmpty(query.requestMethod)) {
      where.requestMethod = query.requestMethod;
    }
    if (!isEmpty(query.operatorType)) {
      where.operatorType = `${query.operatorType}`;
    }
    if (!isEmpty(query.operName)) {
      where.operName = { contains: query.operName };
    }
    if (!isEmpty(query.deptName)) {
      where.deptName = { contains: query.deptName };
    }
    if (!isEmpty(query.operUrl)) {
      where.operUrl = query.operUrl;
    }
    if (!isEmpty(query.operLocation)) {
      where.operLocation = query.operLocation;
    }
    if (!isEmpty(query.operParam)) {
      where.operParam = query.operParam;
    }
    if (!isEmpty(query.jsonResult)) {
      where.jsonResult = query.jsonResult;
    }
    if (!isEmpty(query.errorMsg)) {
      where.errorMsg = query.errorMsg;
    }
    if (!isEmpty(query.method)) {
      where.method = query.method;
    }
    if (!isEmpty(query.operIp)) {
      where.operIp = query.operIp;
    }
    if (!isEmpty(query.params?.beginTime) && !isEmpty(query.params?.endTime)) {
      where.operTime = {
        gte: new Date(query.params.beginTime),
        lte: new Date(query.params.endTime),
      };
    }
    if (!isEmpty(query.status)) {
      where.status = query.status;
    }

    const orderBy = query.orderByColumn && query.isAsc ? { [query.orderByColumn]: query.isAsc === 'ascending' ? 'asc' : 'desc' } : undefined;
    const pageSize = Number(query.pageSize);
    const pageNum = Number(query.pageNum);
    const select = {
      operId: true,
      title: true,
      businessType: true,
      requestMethod: true,
      operatorType: true,
      operName: true,
      deptName: true,
      operUrl: true,
      operLocation: true,
      operParam: true,
      jsonResult: true,
      errorMsg: true,
      method: true,
      operIp: true,
      operTime: true,
      status: true,
      costTime: true,
    };
    const [list, total] = await Promise.all([
      this.prisma.sysOperLog.findMany({
        where,
        select,
        ...(orderBy ? { orderBy } : {}),
        ...(query.pageNum && query.pageSize
          ? {
              skip: pageSize * (pageNum - 1),
              take: pageSize,
            }
          : {}),
      }),
      this.prisma.sysOperLog.count({ where }),
    ]);

    return ResultData.ok({
      list,
      total,
    });
  }

  async findOne(id: number) {
    const res = await this.prisma.sysOperLog.findUnique({
      where: {
        operId: id,
      },
    });
    return ResultData.ok(res);
  }

  async removeAll() {
    await this.prisma.sysOperLog.deleteMany();
    return ResultData.ok();
  }

  async remove(operId: number) {
    await this.prisma.sysOperLog.delete({ where: { operId } });
    return ResultData.ok();
  }

  /**
   * @description: 录入日志
   */
  async logAction({
    resultData,
    costTime,
    title,
    handlerName,
    errorMsg,
    businessType,
  }: {
    resultData?: any;
    costTime: number;
    title: string;
    handlerName: string;
    errorMsg?: string;
    businessType: number;
  }) {
    const { originalUrl, method, ip, body, query } = this.request;
    const { user } = this.request.user;
    const operLocation = await this.axiosService.getIpAddress(ip);

    const params = {
      title,
      method: handlerName,
      operName: user.nickName,
      deptName: user.deptName,
      operUrl: originalUrl,
      requestMethod: method.toUpperCase(),
      operIp: ip,
      costTime: costTime,
      operLocation: operLocation,
      operParam: JSON.stringify({ ...body, ...query }),
      jsonResult: JSON.stringify(resultData),
      errorMsg,
      businessType,
      operatorType: '1',
      operTime: new Date(),
      status: errorMsg ? '1' : '0',
    };

    await this.prisma.sysOperLog.create({
      data: params,
    });
  }

  /**
   * 导出操作日志数据为xlsx
   * @param res
   */
  async export(res: Response, body: QueryOperLogDto) {
    delete body.pageNum;
    delete body.pageSize;
    const list = await this.findAll(body);
    const { data: operatorTypeDict } = await this.dictService.findOneDataType('sys_oper_type');
    const operatorTypeDictMap = {};
    operatorTypeDict.forEach((item) => {
      operatorTypeDictMap[item.dictValue] = item.dictLabel;
    });
    const options = {
      sheetName: '操作日志数据',
      data: list.data.list,
      header: [
        { title: '日志编号', dataIndex: 'operId' },
        { title: '系统模块', dataIndex: 'title', width: 15 },
        { title: '操作类型', dataIndex: 'businessType' },
        { title: '操作人员', dataIndex: 'operName' },
        { title: '主机', dataIndex: 'operIp' },
        { title: '操作状态', dataIndex: 'status' },
        { title: '操作时间', dataIndex: 'operTime', width: 15 },
        {
          title: '消耗时间',
          dataIndex: 'costTime',
          formateStr(value) {
            return value + 'ms';
          },
        },
      ],
      dictMap: {
        status: {
          '0': '成功',
          '1': '失败',
        },
        businessType: operatorTypeDictMap,
      },
    };
    ExportTable(options, res);
  }
}
