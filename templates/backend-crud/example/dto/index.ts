import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { PagingDto } from 'src/common/dto';

export enum ExampleStatusEnum {
  ENABLED = '0',
  DISABLED = '1',
}

export class CreateExampleDto {
  @ApiProperty({ description: '示例名称' })
  @IsString()
  @Length(1, 100)
  exampleName: string;

  @ApiProperty({ description: '状态', required: false })
  @IsOptional()
  @IsString()
  @IsEnum(ExampleStatusEnum)
  status?: string;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  remark?: string;
}

export class UpdateExampleDto extends CreateExampleDto {
  @ApiProperty({ description: '主键' })
  @IsNumber()
  exampleId: number;
}

export class ListExampleDto extends PagingDto {
  @ApiProperty({ description: '示例名称', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  exampleName?: string;

  @ApiProperty({ description: '状态', required: false })
  @IsOptional()
  @IsString()
  @IsEnum(ExampleStatusEnum)
  status?: string;
}
