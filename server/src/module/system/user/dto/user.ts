import { SysDept, SysPost, SysRole, SysUser } from '@prisma/client';

export type UserType = {
  browser: string;
  ipaddr: string;
  loginLocation: string;
  loginTime: Date;
  os: string;
  permissions: string[];
  roles: string[];
  token: string;
  user: {
    dept: SysDept | null;
    roles: Array<SysRole>;
    posts: Array<SysPost>;
  } & SysUser;
  userId: number;
  userName: string;
  deptId: number;
};
