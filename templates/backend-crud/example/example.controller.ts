import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BusinessType } from 'src/common/constant/business.constant';
import { Operlog } from 'src/common/decorators/operlog.decorator';
import { RequirePermission } from 'src/common/decorators/require-premission.decorator';
import {
  CreateExampleDto,
  ListExampleDto,
  UpdateExampleDto,
} from './dto';
import { ExampleService } from './example.service';

@ApiTags('示例模块')
@Controller('system/example')
@ApiBearerAuth('Authorization')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @ApiOperation({ summary: '示例模块-列表' })
  @RequirePermission('system:example:list')
  @Get('/list')
  findAll(@Query() query: ListExampleDto) {
    return this.exampleService.findAll(query);
  }

  @ApiOperation({ summary: '示例模块-详情' })
  @RequirePermission('system:example:query')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exampleService.findOne(Number(id));
  }

  @ApiOperation({ summary: '示例模块-新增' })
  @ApiBody({ type: CreateExampleDto })
  @RequirePermission('system:example:add')
  @Operlog({ businessType: BusinessType.INSERT })
  @Post()
  create(@Body() dto: CreateExampleDto, @Request() req) {
    dto['createBy'] = req.user.userName;
    return this.exampleService.create(dto);
  }

  @ApiOperation({ summary: '示例模块-更新' })
  @ApiBody({ type: UpdateExampleDto })
  @RequirePermission('system:example:edit')
  @Operlog({ businessType: BusinessType.UPDATE })
  @Put()
  update(@Body() dto: UpdateExampleDto) {
    return this.exampleService.update(dto);
  }

  @ApiOperation({ summary: '示例模块-删除' })
  @RequirePermission('system:example:remove')
  @Operlog({ businessType: BusinessType.DELETE })
  @Delete(':id')
  remove(@Param('id') ids: string) {
    return this.exampleService.remove(
      ids.split(',').map((item) => Number(item))
    );
  }
}
