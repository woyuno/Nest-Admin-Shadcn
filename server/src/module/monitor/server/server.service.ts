import { Injectable } from '@nestjs/common';
import { ResultData } from 'src/common/utils/result';
import os, { networkInterfaces } from 'os';
import path from 'path';
import { execSync } from 'child_process';
import * as nodeDiskInfo from 'node-disk-info';

@Injectable()
export class ServerService {
  async getInfo() {
    // 获取CPU信息
    const cpu = this.getCpuInfo();
    const mem = this.getMemInfo();
    const sys = {
      computerName: os.hostname(),
      computerIp: this.getServerIP(),
      userDir: path.resolve(__dirname, '..', '..', '..', '..'),
      osName: os.platform(),
      osArch: os.arch(),
    };
    const sysFiles = await this.getDiskStatus();
    const data = {
      cpu,
      mem,
      sys,
      sysFiles,
    };
    return ResultData.ok(data);
  }

  async getDiskStatus() {
    const disks = await nodeDiskInfo.getDiskInfoSync();
    const windowsDriveTypes = this.getWindowsDriveTypes();
    const sysFiles = disks.map((disk: any) => {
      return {
        dirName: disk._mounted,
        typeName: this.resolveDiskTypeName({
          mounted: disk._mounted,
          rawTypeName: disk._filesystem,
          windowsDriveTypes,
        }),
        total: this.bytesToGB(disk._blocks) + 'GB',
        used: this.bytesToGB(disk._used) + 'GB',
        free: this.bytesToGB(disk._available) + 'GB',
        usage: ((disk._used / disk._blocks || 0) * 100).toFixed(2),
      };
    });
    return sysFiles;
  }

  getWindowsDriveTypes() {
    if (os.platform() !== 'win32') {
      return {};
    }

    try {
      const output = execSync(
        'wmic logicaldisk get Caption,DriveType /format:list',
        {
          windowsHide: true,
          encoding: 'buffer',
        },
      ).toString('utf8');

      return this.parseWindowsDriveTypeOutput(output);
    } catch {
      return {};
    }
  }

  parseWindowsDriveTypeOutput(output: string) {
    const driveTypes: Record<string, string> = {};
    let caption = '';
    let driveType = '';

    output.split(/\r?\n/).forEach((line) => {
      const normalizedLine = line.replace(/\r/g, '').trim();

      if (!normalizedLine) {
        if (caption) {
          driveTypes[caption] = this.mapWindowsDriveType(driveType);
        }

        caption = '';
        driveType = '';
        return;
      }

      const [key, ...rest] = normalizedLine.split('=');
      const value = rest.join('=').trim();

      if (key === 'Caption') {
        caption = value;
      }

      if (key === 'DriveType') {
        driveType = value;
      }
    });

    if (caption) {
      driveTypes[caption] = this.mapWindowsDriveType(driveType);
    }

    return driveTypes;
  }

  mapWindowsDriveType(driveType: string) {
    const driveTypeMap: Record<string, string> = {
      '0': '未知设备',
      '1': '无根目录',
      '2': '可移动磁盘',
      '3': '本地固定磁盘',
      '4': '网络磁盘',
      '5': '光驱',
      '6': '内存磁盘',
    };

    return driveTypeMap[driveType] ?? '未知磁盘';
  }

  resolveDiskTypeName({
    mounted,
    rawTypeName,
    windowsDriveTypes,
  }: {
    mounted: string;
    rawTypeName?: string;
    windowsDriveTypes?: Record<string, string>;
  }) {
    const normalizedMounted = mounted?.trim();

    if (normalizedMounted && windowsDriveTypes?.[normalizedMounted]) {
      return windowsDriveTypes[normalizedMounted];
    }

    return rawTypeName?.trim() || '-';
  }

  // 获取服务器IP地址
  getServerIP() {
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        // 选择外部可访问的IPv4地址
        if (net.family === 'IPv4' && !net.internal) {
          return net.address;
        }
      }
    }
  }

  getCpuInfo() {
    const cpus = os.cpus();
    const cpuInfo = cpus.reduce(
      (info: any, cpu) => {
        info.cpuNum += 1;
        info.user += cpu.times.user;
        info.sys += cpu.times.sys;
        info.idle += cpu.times.idle;
        info.total += cpu.times.user + cpu.times.sys + cpu.times.idle;
        return info;
      },
      { user: 0, sys: 0, idle: 0, total: 0, cpuNum: 0 },
    );
    const cpu = {
      cpuNum: cpuInfo.cpuNum,
      total: cpuInfo.total,
      sys: ((cpuInfo.sys / cpuInfo.total) * 100).toFixed(2),
      used: ((cpuInfo.user / cpuInfo.total) * 100).toFixed(2),
      wait: 0.0,
      free: ((cpuInfo.idle / cpuInfo.total) * 100).toFixed(2),
    };
    return cpu;
  }

  getMemInfo() {
    // 获取总内存
    const totalMemory = os.totalmem();
    // 获取空闲内存
    const freeMemory = os.freemem();
    // 已用内存 = 总内存 - 空闲内存
    const usedMemory = totalMemory - freeMemory;
    // 使用率 = 1 - 空闲内存 / 总内存
    const memoryUsagePercentage = (((totalMemory - freeMemory) / totalMemory) * 100).toFixed(2);
    const mem = {
      total: this.bytesToGB(totalMemory),
      used: this.bytesToGB(usedMemory),
      free: this.bytesToGB(freeMemory),
      usage: memoryUsagePercentage,
    };
    return mem;
  }

  /**
   * 将字节转换为GB。
   * @param bytes {number} 要转换的字节数。
   * @returns {string} 返回转换后的GB数，保留两位小数。
   */
  bytesToGB(bytes) {
    // 计算字节到GB的转换率
    const gb = bytes / (1024 * 1024 * 1024);
    // 将结果四舍五入到小数点后两位
    return gb.toFixed(2);
  }
}
