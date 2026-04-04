import { readFileSync } from 'fs';
import { resolve } from 'path';

const projectRoot = resolve(__dirname, '..', '..');

const legacyPatterns = [
  'gen_table',
  'gen_table_column',
  "'生成代码', '8', 'sys_oper_type'",
  'tool:gen:list',
  'tool:gen:query',
  'tool:gen:edit',
  'tool:gen:remove',
  'tool:gen:import',
  'tool:gen:preview',
  'tool:gen:code',
];

function readProjectFile(relativePath: string) {
  return readFileSync(resolve(projectRoot, relativePath), 'utf8');
}

describe('template baseline cleanup', () => {
  it('does not keep legacy code generator tables or seed data in template assets', () => {
    const files = [
      'prisma/schema.prisma',
      'prisma/migrations/20260402131244_baseline/migration.sql',
      'db/nest-admin.sql',
      'db/nest-admin.mysql57.sql',
    ];

    for (const file of files) {
      const content = readProjectFile(file);

      for (const pattern of legacyPatterns) {
        expect(content).not.toContain(pattern);
      }
    }
  });
});
