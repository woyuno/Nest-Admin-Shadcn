import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Response } from 'express';
import { GenerateUUID, Uniq } from 'src/common/utils/index';
import { ExportTable } from 'src/common/utils/export';
import { CacheEnum, DelFlagEnum, StatusEnum, DataScopeEnum } from 'src/common/enum/index';
import { LOGIN_TOKEN_EXPIRESIN, SYS_USER_TYPE } from 'src/common/constant/index';
import { ResultData } from 'src/common/utils/result';
import { CreateUserDto, UpdateUserDto, ListUserDto, ChangeStatusDto, ResetPwdDto, AllocatedListDto, UpdateProfileDto, UpdatePwdDto } from './dto/index';
import { RegisterDto, LoginDto } from '../../main/dto/index';
import { AuthUserCancelDto, AuthUserCancelAllDto, AuthUserSelectAllDto } from '../role/dto/index';
import { SysPostEntity } from '../post/entities/post.entity';
import { SysDeptEntity } from '../dept/entities/dept.entity';
import { RoleService } from '../role/role.service';
import { DeptService } from '../dept/dept.service';
import { ConfigService } from '../config/config.service';
import { SysRoleEntity } from '../role/entities/role.entity';
import { SysMenuEntity } from '../menu/entities/menu.entity';
import { UserType } from './dto/user';
import { ClientInfoDto } from 'src/common/decorators/common.decorator';
import { RedisService } from 'src/module/common/redis/redis.service';
import { Cacheable, CacheEvict } from 'src/common/decorators/redis.decorator';
import { Captcha } from 'src/common/decorators/captcha.decorator';
import { buildAssignedUserRoles, mergeUsersWithRoles } from './user-list-role.helper';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserEntity } from './entities/sys-user.entity';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly roleService: RoleService,
    private readonly deptService: DeptService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const salt = bcrypt.genSaltSync(10);
    const password = createUserDto.password ? bcrypt.hashSync(createUserDto.password, salt) : createUserDto.password;
    const { postIds = [], roleIds = [], ...userData } = createUserDto;

    await this.prisma.$transaction(async (tx) => {
      const res = await tx.sysUser.create({
        data: {
          ...userData,
          password,
          userType: SYS_USER_TYPE.CUSTOM,
        },
      });

      if (postIds.length > 0) {
        await tx.sysUserPost.createMany({
          data: postIds.map((postId) => ({
            userId: res.userId,
            postId,
          })),
        });
      }

      if (roleIds.length > 0) {
        await tx.sysUserRole.createMany({
          data: roleIds.map((roleId) => ({
            userId: res.userId,
            roleId,
          })),
        });
      }
    });

    return ResultData.ok();
  }

  async findAll(query: ListUserDto, user: UserType['user']) {
    const where = await this.buildUserListWhere(query, user);
    const pagination = this.getPagination(query);

    const [list, total] = await Promise.all([
      this.prisma.sysUser.findMany({
        where,
        include: {
          dept: true,
        },
        ...(pagination ?? {}),
        orderBy: [{ deptId: 'asc' }, { userId: 'asc' }],
      }),
      this.prisma.sysUser.count({ where }),
    ]);
    const enrichedList = await this.attachRolesForUsers(list);

    return ResultData.ok({
      list: enrichedList,
      total,
    });
  }

  private async attachRolesForUsers<T extends { userId: number }>(users: T[]): Promise<Array<T & { roles: SysRoleEntity[] }>> {
    if (users.length === 0) {
      return [];
    }

    const userIds = users.map((item) => item.userId);
    const userRoleMappings = await this.prisma.sysUserRole.findMany({
      where: {
        userId: {
          in: userIds,
        },
      },
      select: {
        userId: true,
        roleId: true,
      },
    });

    if (userRoleMappings.length === 0) {
      return users.map((item) => ({
        ...item,
        roles: [],
      }));
    }

    const roleIds = Uniq(userRoleMappings.map((item) => item.roleId));
    const roles = await this.roleService.findRoles({
      delFlag: '0',
      roleId: {
        in: roleIds,
      },
    });
    return mergeUsersWithRoles(users, userRoleMappings as never, roles as never);
  }

  async findPostAndRoleAll() {
    const [posts, roles] = await Promise.all([
      this.prisma.sysPost.findMany({
        where: {
          delFlag: '0',
        },
        orderBy: [{ postSort: 'asc' }, { postId: 'asc' }],
      }),
      this.roleService.findRoles({
        delFlag: '0',
      }),
    ]);

    return ResultData.ok({
      posts,
      roles,
    });
  }

  @Cacheable(CacheEnum.SYS_USER_KEY, '{userId}')
  async findOne(userId: number) {
    const data = await this.prisma.sysUser.findUnique({
      where: {
        userId,
      },
      include: {
        dept: true,
      },
    });

    if (!data || data.delFlag !== '0') {
      return ResultData.ok(null);
    }

    const [postList, allPosts, roleIds, allRoles] = await Promise.all([
      this.prisma.sysUserPost.findMany({
        where: {
          userId,
        },
        select: {
          postId: true,
        },
      }),
      this.prisma.sysPost.findMany({
        where: {
          delFlag: '0',
        },
        orderBy: [{ postSort: 'asc' }, { postId: 'asc' }],
      }),
      this.getRoleIds([userId]),
      this.roleService.findRoles({
        delFlag: '0',
      }),
    ]);

    const result = {
      ...data,
      roles: allRoles.filter((item) => roleIds.includes(item.roleId)),
    };

    return ResultData.ok({
      data: result,
      postIds: postList.map((item) => item.postId),
      posts: allPosts,
      roles: allRoles,
      roleIds,
    });
  }

  @CacheEvict(CacheEnum.SYS_USER_KEY, '{updateUserDto.userId}')
  async update(updateUserDto: UpdateUserDto, userId: number) {
    if (updateUserDto.userId === 1) {
      throw new BadRequestException('非法操作！');
    }

    const roleIds = (updateUserDto.roleIds ?? []).filter((value) => value !== 1);
    const postIds = updateUserDto.postIds ?? [];

    if (updateUserDto.userId === userId) {
      delete updateUserDto.status;
    }

    const { userId: targetUserId, password, dept, roles, ...rest } = updateUserDto as UpdateUserDto & {
      dept?: unknown;
      roles?: unknown;
    };
    delete rest.roleIds;
    delete rest.postIds;

    const data = await this.prisma.$transaction(async (tx) => {
      const result = await tx.sysUser.update({
        where: {
          userId: targetUserId,
        },
        data: rest,
      });

      await tx.sysUserPost.deleteMany({
        where: {
          userId: targetUserId,
        },
      });

      if (postIds.length > 0) {
        await tx.sysUserPost.createMany({
          data: postIds.map((postId) => ({
            userId: targetUserId,
            postId,
          })),
        });
      }

      await tx.sysUserRole.deleteMany({
        where: {
          userId: targetUserId,
        },
      });

      if (roleIds.length > 0) {
        await tx.sysUserRole.createMany({
          data: roleIds.map((roleId) => ({
            userId: targetUserId,
            roleId,
          })),
        });
      }

      return result;
    });

    return ResultData.ok(data);
  }

  @CacheEvict(CacheEnum.SYS_USER_KEY, '{userId}')
  clearCacheByUserId(userId: number) {
    return userId;
  }

  @Captcha('user')
  async login(user: LoginDto, clientInfo: ClientInfoDto) {
    const data = await this.prisma.sysUser.findFirst({
      where: {
        userName: user.userName,
      },
      select: {
        userId: true,
        password: true,
      },
    });

    if (!data || !bcrypt.compareSync(user.password, data.password)) {
      return ResultData.fail(500, '帐号或密码错误');
    }

    this.clearCacheByUserId(data.userId);

    const userData = await this.getUserinfo(data.userId);
    if (!userData) {
      return ResultData.fail(500, '帐号或密码错误');
    }

    if (userData.delFlag === DelFlagEnum.DELETE) {
      return ResultData.fail(500, '您已被禁用，如需正常使用请联系管理员');
    }
    if (userData.status === StatusEnum.STOP) {
      return ResultData.fail(500, '您已被停用，如需正常使用请联系管理员');
    }

    const loginDate = new Date();
    await this.prisma.sysUser.update({
      where: {
        userId: data.userId,
      },
      data: {
        loginDate,
        loginIp: clientInfo.ipaddr,
      },
    });

    const uuid = GenerateUUID();
    const token = this.createToken({ uuid, userId: userData.userId });
    const permissions = await this.getUserPermissions(userData.userId);
    userData['deptName'] = userData.dept?.deptName || '';
    const roles = userData.roles.map((item) => item.roleKey);

    const userInfo = {
      browser: clientInfo.browser,
      ipaddr: clientInfo.ipaddr,
      loginLocation: clientInfo.loginLocation,
      loginTime: loginDate,
      os: clientInfo.os,
      permissions,
      roles,
      token: uuid,
      user: userData,
      userId: userData.userId,
      userName: userData.userName,
      deptId: userData.deptId,
    };

    await this.updateRedisToken(uuid, userInfo);

    return ResultData.ok(
      {
        token,
        userName: userData.userName,
      },
      '登录成功',
    );
  }

  async updateRedisUserRolesAndPermissions(uuid: string, userId: number) {
    const userData = await this.getUserinfo(userId);
    if (!userData) {
      return;
    }

    const permissions = await this.getUserPermissions(userId);
    const roles = userData.roles.map((item) => item.roleKey);

    await this.updateRedisToken(uuid, {
      permissions,
      roles,
    });
  }

  async updateRedisToken(token: string, metaData: Partial<UserType>) {
    const oldMetaData = await this.redisService.get(`${CacheEnum.LOGIN_TOKEN_KEY}${token}`);
    let newMetaData = metaData;
    if (oldMetaData) {
      newMetaData = Object.assign(oldMetaData, metaData);
    }

    await this.redisService.set(`${CacheEnum.LOGIN_TOKEN_KEY}${token}`, newMetaData, LOGIN_TOKEN_EXPIRESIN);
  }

  async getRoleIds(userIds: Array<number>) {
    if (!userIds || userIds.length === 0) {
      return [];
    }

    const roleList = await this.prisma.sysUserRole.findMany({
      where: {
        userId: {
          in: userIds,
        },
      },
      select: {
        roleId: true,
      },
    });
    return Uniq(roleList.map((item) => item.roleId));
  }

  async getUserPermissions(userId: number) {
    const roleIds = await this.getRoleIds([userId]);
    const list = await this.roleService.getPermissionsByRoleIds(roleIds);
    return Uniq(list.map((item: SysMenuEntity) => item.perms)).filter((item) => item);
  }

  async getUserinfo(userId: number): Promise<({ dept: SysDeptEntity; roles: Array<SysRoleEntity>; posts: Array<SysPostEntity> } & UserEntity) | null> {
    const data = await this.prisma.sysUser.findUnique({
      where: {
        userId,
      },
      include: {
        dept: true,
        roleBindings: {
          include: {
            role: true,
          },
        },
        postBindings: {
          include: {
            post: true,
          },
        },
      },
    });

    if (!data || data.delFlag !== DelFlagEnum.NORMAL) {
      return null;
    }

    const { roleBindings, postBindings, ...user } = data;

    return {
      ...(user as UserEntity),
      dept: data.dept as SysDeptEntity,
      roles: roleBindings.map((item) => item.role).filter((item) => item && item.delFlag === '0') as unknown as SysRoleEntity[],
      posts: postBindings.map((item) => item.post).filter((item) => item && item.delFlag === '0') as unknown as SysPostEntity[],
    };
  }

  async register(user: RegisterDto) {
    const password = user.password ? bcrypt.hashSync(user.password, bcrypt.genSaltSync(10)) : user.password;

    const checkUserNameUnique = await this.prisma.sysUser.findFirst({
      where: {
        userName: user.userName,
      },
      select: {
        userName: true,
      },
    });
    if (checkUserNameUnique) {
      return ResultData.fail(500, `保存用户'${user.userName}'失败，注册账号已存在`);
    }

    await this.prisma.sysUser.create({
      data: {
        ...user,
        password,
        loginDate: new Date(),
        nickName: user.userName,
        userType: SYS_USER_TYPE.CUSTOM,
      },
    });
    return ResultData.ok();
  }

  createToken(payload: { uuid: string; userId: number }): string {
    return this.jwtService.sign(payload);
  }

  parseToken(token: string) {
    try {
      if (!token) return null;
      return this.jwtService.verify(token.replace('Bearer ', ''));
    } catch (error) {
      return null;
    }
  }

  async resetPwd(body: ResetPwdDto) {
    if (body.userId === 1) {
      return ResultData.fail(500, '系统用户不能重置密码');
    }

    const password = body.password ? bcrypt.hashSync(body.password, bcrypt.genSaltSync(10)) : body.password;
    await this.prisma.sysUser.update({
      where: {
        userId: body.userId,
      },
      data: {
        password,
      },
    });
    return ResultData.ok();
  }

  async remove(ids: number[]) {
    const data = await this.prisma.sysUser.updateMany({
      where: {
        userId: {
          in: ids,
        },
        userType: {
          not: SYS_USER_TYPE.SYS,
        },
      },
      data: {
        delFlag: '1',
      },
    });
    return ResultData.ok(data);
  }

  async authRole(userId: number) {
    const allRoles = await this.roleService.findRoles({
      delFlag: '0',
    });

    const user = await this.prisma.sysUser.findUnique({
      where: {
        userId,
      },
      include: {
        dept: true,
      },
    });

    if (!user || user.delFlag !== '0') {
      return ResultData.ok({
        roles: allRoles,
        user: null,
      });
    }

    const roleIds = await this.getRoleIds([userId]);
    const userData = {
      ...user,
      roles: buildAssignedUserRoles(allRoles as never, roleIds),
    };

    return ResultData.ok({
      roles: allRoles,
      user: userData,
    });
  }

  async updateAuthRole(query) {
    const roleIds = (query.roleIds ? `${query.roleIds}`.split(',') : [])
      .map((id) => Number(id))
      .filter((value) => value && value !== 1);
    const userId = Number(query.userId);

    await this.prisma.$transaction(async (tx) => {
      await tx.sysUserRole.deleteMany({
        where: {
          userId,
        },
      });

      if (roleIds.length > 0) {
        await tx.sysUserRole.createMany({
          data: roleIds.map((roleId) => ({
            userId,
            roleId,
          })),
        });
      }
    });

    return ResultData.ok();
  }

  async changeStatus(changeStatusDto: ChangeStatusDto) {
    const userData = await this.prisma.sysUser.findUnique({
      where: {
        userId: changeStatusDto.userId,
      },
      select: {
        userType: true,
      },
    });
    if (userData?.userType === SYS_USER_TYPE.SYS) {
      return ResultData.fail(500, '系统角色不可停用');
    }

    const res = await this.prisma.sysUser.update({
      where: {
        userId: changeStatusDto.userId,
      },
      data: {
        status: changeStatusDto.status,
      },
    });
    return ResultData.ok(res);
  }

  async deptTree() {
    const tree = await this.deptService.deptTree();
    return ResultData.ok(tree);
  }

  async allocatedList(query: AllocatedListDto) {
    const roleWidthRoleList = await this.prisma.sysUserRole.findMany({
      where: {
        roleId: Number(query.roleId),
      },
      select: {
        userId: true,
      },
    });
    if (roleWidthRoleList.length === 0) {
      return ResultData.ok({
        list: [],
        total: 0,
      });
    }

    const userIds = roleWidthRoleList.map((item) => item.userId);
    const where = this.buildAllocatedWhere(query, {
      in: userIds,
    });
    const pagination = this.getPagination(query);

    const [list, total] = await Promise.all([
      this.prisma.sysUser.findMany({
        where,
        include: {
          dept: true,
        },
        ...(pagination ?? {}),
        orderBy: [{ userId: 'asc' }],
      }),
      this.prisma.sysUser.count({ where }),
    ]);

    return ResultData.ok({
      list,
      total,
    });
  }

  async unallocatedList(query: AllocatedListDto) {
    const roleWidthRoleList = await this.prisma.sysUserRole.findMany({
      where: {
        roleId: Number(query.roleId),
      },
      select: {
        userId: true,
      },
    });

    const userIds = roleWidthRoleList.map((item) => item.userId);
    const where = this.buildAllocatedWhere(
      query,
      userIds.length > 0
        ? {
            notIn: userIds,
          }
        : undefined,
    );
    const pagination = this.getPagination(query);

    const [list, total] = await Promise.all([
      this.prisma.sysUser.findMany({
        where,
        include: {
          dept: true,
        },
        ...(pagination ?? {}),
        orderBy: [{ userId: 'asc' }],
      }),
      this.prisma.sysUser.count({ where }),
    ]);

    return ResultData.ok({
      list,
      total,
    });
  }

  async authUserCancel(data: AuthUserCancelDto) {
    await this.prisma.sysUserRole.deleteMany({
      where: {
        userId: data.userId,
        roleId: data.roleId,
      },
    });
    return ResultData.ok();
  }

  async authUserCancelAll(data: AuthUserCancelAllDto) {
    const userIds = data.userIds.split(',').map((id) => +id);
    await this.prisma.sysUserRole.deleteMany({
      where: {
        userId: {
          in: userIds,
        },
        roleId: +data.roleId,
      },
    });
    return ResultData.ok();
  }

  async authUserSelectAll(data: AuthUserSelectAllDto) {
    const userIds = data.userIds.split(',').map((id) => Number(id));
    if (userIds.length > 0) {
      await this.prisma.sysUserRole.createMany({
        data: userIds.map((userId) => ({
          userId,
          roleId: +data.roleId,
        })),
        skipDuplicates: true,
      });
    }
    return ResultData.ok();
  }

  async profile(user) {
    return ResultData.ok(user);
  }

  async updateProfile(user: UserType, updateProfileDto: UpdateProfileDto) {
    await this.prisma.sysUser.update({
      where: {
        userId: user.user.userId,
      },
      data: updateProfileDto,
    });
    const userData = await this.redisService.get(`${CacheEnum.LOGIN_TOKEN_KEY}${user.token}`);
    userData.user = Object.assign(userData.user, updateProfileDto);
    await this.redisService.set(`${CacheEnum.LOGIN_TOKEN_KEY}${user.token}`, userData);
    return ResultData.ok();
  }

  async updatePwd(user: UserType, updatePwdDto: UpdatePwdDto) {
    if (updatePwdDto.oldPassword === updatePwdDto.newPassword) {
      return ResultData.fail(500, '新密码不能与旧密码相同');
    }
    if (!bcrypt.compareSync(updatePwdDto.oldPassword, user.user.password)) {
      return ResultData.fail(500, '修改密码失败，旧密码错误');
    }

    const password = bcrypt.hashSync(updatePwdDto.newPassword, bcrypt.genSaltSync(10));
    await this.prisma.sysUser.update({
      where: {
        userId: user.user.userId,
      },
      data: {
        password,
      },
    });
    return ResultData.ok();
  }

  async export(res: Response, body: ListUserDto, user: UserType['user']) {
    delete body.pageNum;
    delete body.pageSize;
    const list = await this.findAll(body, user);
    const options = {
      sheetName: '用户数据',
      data: list.data.list,
      header: [
        { title: '用户序号', dataIndex: 'userId' },
        { title: '登录名称', dataIndex: 'userName' },
        { title: '用户昵称', dataIndex: 'nickName' },
        { title: '用户邮箱', dataIndex: 'email' },
        { title: '手机号码', dataIndex: 'phonenumber' },
        { title: '用户性别', dataIndex: 'sex' },
        { title: '账号状态', dataIndex: 'status' },
        { title: '最后登录IP', dataIndex: 'loginIp' },
        { title: '最后登录时间', dataIndex: 'loginDate', width: 20 },
        { title: '部门', dataIndex: 'dept.deptName' },
        { title: '部门负责人', dataIndex: 'dept.leader' },
      ],
    };
    ExportTable(options, res);
  }

  private async buildUserListWhere(query: ListUserDto, user: UserType['user']) {
    const where: Record<string, unknown> = {
      delFlag: '0',
    };

    if (user) {
      const scope = await this.resolveUserScope(user);
      if (scope.deptIds) {
        where.deptId = {
          in: scope.deptIds,
        };
      }
      if (scope.selfOnly) {
        where.userId = user.userId;
      }
    }

    if (query.deptId) {
      const deptIds = await this.deptService.findDeptIdsByDataScope(+query.deptId, DataScopeEnum.DATA_SCOPE_DEPT_AND_CHILD);
      if (where.deptId && 'in' in (where.deptId as Record<string, unknown>)) {
        const scopedDeptIds = ((where.deptId as { in: number[] }).in ?? []).filter((deptId) => deptIds.includes(deptId));
        where.deptId = {
          in: scopedDeptIds,
        };
      } else {
        where.deptId = {
          in: deptIds,
        };
      }
    }

    if (query.userName) {
      where.userName = {
        contains: query.userName,
      };
    }

    if (query.phonenumber) {
      where.phonenumber = {
        contains: query.phonenumber,
      };
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

  private async resolveUserScope(user: UserType['user']) {
    const deptIds: number[] = [];
    let dataScopeAll = false;
    let dataScopeSelf = false;

    for (const role of user.roles || []) {
      if (role.dataScope === DataScopeEnum.DATA_SCOPE_ALL) {
        dataScopeAll = true;
        break;
      }

      if (role.dataScope === DataScopeEnum.DATA_SCOPE_CUSTOM) {
        deptIds.push(...(await this.roleService.findRoleWithDeptIds(role.roleId)));
      } else if (role.dataScope === DataScopeEnum.DATA_SCOPE_DEPT || role.dataScope === DataScopeEnum.DATA_SCOPE_DEPT_AND_CHILD) {
        deptIds.push(...(await this.deptService.findDeptIdsByDataScope(user.deptId, role.dataScope)));
      } else if (role.dataScope === DataScopeEnum.DATA_SCOPE_SELF) {
        dataScopeSelf = true;
      }
    }

    if (dataScopeAll) {
      return {
        deptIds: null,
        selfOnly: false,
      };
    }

    if (deptIds.length > 0) {
      return {
        deptIds: Uniq(deptIds),
        selfOnly: false,
      };
    }

    return {
      deptIds: null,
      selfOnly: dataScopeSelf,
    };
  }

  private getPagination(query: { pageSize?: number | string; pageNum?: number | string }) {
    if (!query.pageSize || !query.pageNum) {
      return null;
    }

    const pageSize = Number(query.pageSize);
    const pageNum = Number(query.pageNum);

    return {
      skip: pageSize * (pageNum - 1),
      take: pageSize,
    };
  }

  private buildAllocatedWhere(query: AllocatedListDto, userIdFilter?: { in?: number[]; notIn?: number[] }) {
    const where: Record<string, unknown> = {
      delFlag: '0',
      status: '0',
    };

    if (userIdFilter?.in) {
      where.userId = {
        in: userIdFilter.in,
      };
    }

    if (userIdFilter?.notIn) {
      where.userId = {
        notIn: userIdFilter.notIn,
      };
    }

    if (query.userName) {
      where.userName = {
        contains: query.userName,
      };
    }

    if (query.phonenumber) {
      where.phonenumber = {
        contains: query.phonenumber,
      };
    }

    return where;
  }
}
