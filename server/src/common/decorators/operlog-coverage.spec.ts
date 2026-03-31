import { readFileSync } from 'fs';
import { resolve } from 'path';

type OperlogCoverageCase = {
  filePath: string;
  methodName: string;
  businessType: string;
};

const coverageCases: OperlogCoverageCase[] = [
  { filePath: 'module/system/user/user.controller.ts', methodName: 'create', businessType: 'INSERT' },
  { filePath: 'module/system/user/user.controller.ts', methodName: 'updateAuthRole', businessType: 'GRANT' },
  { filePath: 'module/system/user/user.controller.ts', methodName: 'changeStatus', businessType: 'UPDATE' },
  { filePath: 'module/system/user/user.controller.ts', methodName: 'update', businessType: 'UPDATE' },
  { filePath: 'module/system/user/user.controller.ts', methodName: 'resetPwd', businessType: 'UPDATE' },
  { filePath: 'module/system/user/user.controller.ts', methodName: 'remove', businessType: 'DELETE' },
  { filePath: 'module/system/user/user.controller.ts', methodName: 'export', businessType: 'EXPORT' },

  { filePath: 'module/system/role/role.controller.ts', methodName: 'create', businessType: 'INSERT' },
  { filePath: 'module/system/role/role.controller.ts', methodName: 'update', businessType: 'UPDATE' },
  { filePath: 'module/system/role/role.controller.ts', methodName: 'dataScope', businessType: 'GRANT' },
  { filePath: 'module/system/role/role.controller.ts', methodName: 'changeStatus', businessType: 'UPDATE' },
  { filePath: 'module/system/role/role.controller.ts', methodName: 'remove', businessType: 'DELETE' },
  { filePath: 'module/system/role/role.controller.ts', methodName: 'authUserCancel', businessType: 'GRANT' },
  { filePath: 'module/system/role/role.controller.ts', methodName: 'authUserCancelAll', businessType: 'GRANT' },
  { filePath: 'module/system/role/role.controller.ts', methodName: 'authUserSelectAll', businessType: 'GRANT' },
  { filePath: 'module/system/role/role.controller.ts', methodName: 'export', businessType: 'EXPORT' },

  { filePath: 'module/system/menu/menu.controller.ts', methodName: 'create', businessType: 'INSERT' },
  { filePath: 'module/system/menu/menu.controller.ts', methodName: 'update', businessType: 'UPDATE' },
  { filePath: 'module/system/menu/menu.controller.ts', methodName: 'remove', businessType: 'DELETE' },

  { filePath: 'module/system/dept/dept.controller.ts', methodName: 'create', businessType: 'INSERT' },
  { filePath: 'module/system/dept/dept.controller.ts', methodName: 'update', businessType: 'UPDATE' },
  { filePath: 'module/system/dept/dept.controller.ts', methodName: 'remove', businessType: 'DELETE' },

  { filePath: 'module/system/post/post.controller.ts', methodName: 'create', businessType: 'INSERT' },
  { filePath: 'module/system/post/post.controller.ts', methodName: 'update', businessType: 'UPDATE' },
  { filePath: 'module/system/post/post.controller.ts', methodName: 'remove', businessType: 'DELETE' },
  { filePath: 'module/system/post/post.controller.ts', methodName: 'export', businessType: 'EXPORT' },

  { filePath: 'module/system/config/config.controller.ts', methodName: 'create', businessType: 'INSERT' },
  { filePath: 'module/system/config/config.controller.ts', methodName: 'update', businessType: 'UPDATE' },
  { filePath: 'module/system/config/config.controller.ts', methodName: 'refreshCache', businessType: 'CLEAN' },
  { filePath: 'module/system/config/config.controller.ts', methodName: 'remove', businessType: 'DELETE' },
  { filePath: 'module/system/config/config.controller.ts', methodName: 'export', businessType: 'EXPORT' },

  { filePath: 'module/system/notice/notice.controller.ts', methodName: 'create', businessType: 'INSERT' },
  { filePath: 'module/system/notice/notice.controller.ts', methodName: 'update', businessType: 'UPDATE' },
  { filePath: 'module/system/notice/notice.controller.ts', methodName: 'remove', businessType: 'DELETE' },

  { filePath: 'module/system/dict/dict.controller.ts', methodName: 'createType', businessType: 'INSERT' },
  { filePath: 'module/system/dict/dict.controller.ts', methodName: 'refreshCache', businessType: 'CLEAN' },
  { filePath: 'module/system/dict/dict.controller.ts', methodName: 'deleteType', businessType: 'DELETE' },
  { filePath: 'module/system/dict/dict.controller.ts', methodName: 'updateType', businessType: 'UPDATE' },
  { filePath: 'module/system/dict/dict.controller.ts', methodName: 'createDictData', businessType: 'INSERT' },
  { filePath: 'module/system/dict/dict.controller.ts', methodName: 'deleteDictData', businessType: 'DELETE' },
  { filePath: 'module/system/dict/dict.controller.ts', methodName: 'updateDictData', businessType: 'UPDATE' },
  { filePath: 'module/system/dict/dict.controller.ts', methodName: 'export', businessType: 'EXPORT' },
  { filePath: 'module/system/dict/dict.controller.ts', methodName: 'exportData', businessType: 'EXPORT' },

  { filePath: 'module/monitor/job/job.controller.ts', methodName: 'add', businessType: 'INSERT' },
  { filePath: 'module/monitor/job/job.controller.ts', methodName: 'changeStatus', businessType: 'UPDATE' },
  { filePath: 'module/monitor/job/job.controller.ts', methodName: 'update', businessType: 'UPDATE' },
  { filePath: 'module/monitor/job/job.controller.ts', methodName: 'remove', businessType: 'DELETE' },
  { filePath: 'module/monitor/job/job.controller.ts', methodName: 'run', businessType: 'OTHER' },
  { filePath: 'module/monitor/job/job.controller.ts', methodName: 'export', businessType: 'EXPORT' },

  { filePath: 'module/monitor/job/job-log.controller.ts', methodName: 'clean', businessType: 'CLEAN' },
  { filePath: 'module/monitor/job/job-log.controller.ts', methodName: 'export', businessType: 'EXPORT' },

  { filePath: 'module/monitor/loginlog/loginlog.controller.ts', methodName: 'removeAll', businessType: 'CLEAN' },
  { filePath: 'module/monitor/loginlog/loginlog.controller.ts', methodName: 'remove', businessType: 'DELETE' },
  { filePath: 'module/monitor/loginlog/loginlog.controller.ts', methodName: 'export', businessType: 'EXPORT' },

  { filePath: 'module/monitor/operlog/operlog.controller.ts', methodName: 'removeAll', businessType: 'CLEAN' },
  { filePath: 'module/monitor/operlog/operlog.controller.ts', methodName: 'remove', businessType: 'DELETE' },
  { filePath: 'module/monitor/operlog/operlog.controller.ts', methodName: 'exportData', businessType: 'EXPORT' },

  { filePath: 'module/monitor/online/online.controller.ts', methodName: 'delete', businessType: 'FORCE' },

  { filePath: 'module/system/tool/tool.controller.ts', methodName: 'genImportTable', businessType: 'IMPORT' },
  { filePath: 'module/system/tool/tool.controller.ts', methodName: 'synchDb', businessType: 'UPDATE' },
  { filePath: 'module/system/tool/tool.controller.ts', methodName: 'genUpdate', businessType: 'UPDATE' },
  { filePath: 'module/system/tool/tool.controller.ts', methodName: 'remove', businessType: 'DELETE' },
  { filePath: 'module/system/tool/tool.controller.ts', methodName: 'batchGenCode', businessType: 'GENCODE' },
];

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

describe('operlog decorator coverage', () => {
  test.each(coverageCases)('$filePath::$methodName should declare @Operlog', ({ filePath, methodName, businessType }) => {
    const source = readFileSync(resolve(__dirname, '../../', filePath), 'utf8');
    const pattern = new RegExp(`@Operlog\\(\\{\\s*businessType:\\s*BusinessType\\.${escapeRegExp(businessType)}\\s*\\}\\)[\\s\\S]*?\\n\\s*(?:async\\s+)?${escapeRegExp(methodName)}\\s*\\(`);

    expect(source).toMatch(pattern);
  });
});
