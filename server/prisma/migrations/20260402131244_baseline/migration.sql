-- CreateTable
CREATE TABLE `gen_table` (
    `table_id` INTEGER NOT NULL AUTO_INCREMENT,
    `table_name` VARCHAR(200) NOT NULL DEFAULT '',
    `table_comment` VARCHAR(500) NOT NULL DEFAULT '',
    `sub_table_name` VARCHAR(64) NULL,
    `sub_table_fk_name` VARCHAR(64) NULL,
    `class_name` VARCHAR(100) NOT NULL DEFAULT '',
    `tpl_category` VARCHAR(200) NOT NULL DEFAULT 'crud',
    `tpl_web_type` VARCHAR(30) NOT NULL DEFAULT 'element-plus',
    `package_name` VARCHAR(100) NOT NULL,
    `module_name` VARCHAR(30) NOT NULL,
    `business_name` VARCHAR(30) NOT NULL,
    `function_name` VARCHAR(50) NOT NULL,
    `function_author` VARCHAR(50) NOT NULL,
    `gen_type` CHAR(1) NOT NULL DEFAULT '0',
    `gen_path` VARCHAR(200) NOT NULL DEFAULT '/',
    `options` VARCHAR(1000) NOT NULL DEFAULT '',
    `status` CHAR(1) NOT NULL DEFAULT '0',
    `del_flag` CHAR(1) NOT NULL DEFAULT '0',
    `create_by` VARCHAR(64) NOT NULL DEFAULT '',
    `create_time` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
    `update_by` VARCHAR(64) NOT NULL DEFAULT '',
    `update_time` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `remark` VARCHAR(500) NULL,

    PRIMARY KEY (`table_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gen_table_column` (
    `column_id` INTEGER NOT NULL AUTO_INCREMENT,
    `table_id` INTEGER NOT NULL,
    `column_name` VARCHAR(200) NOT NULL,
    `column_comment` VARCHAR(500) NOT NULL,
    `column_type` VARCHAR(100) NOT NULL,
    `java_type` VARCHAR(500) NOT NULL,
    `java_field` VARCHAR(200) NOT NULL,
    `is_pk` CHAR(1) NOT NULL DEFAULT '0',
    `is_increment` CHAR(1) NOT NULL DEFAULT '0',
    `is_required` CHAR(1) NOT NULL DEFAULT '0',
    `is_insert` CHAR(1) NOT NULL DEFAULT '0',
    `is_edit` CHAR(1) NULL DEFAULT '0',
    `is_list` CHAR(1) NULL DEFAULT '0',
    `is_query` CHAR(1) NULL DEFAULT '1',
    `query_type` VARCHAR(200) NOT NULL DEFAULT 'EQ',
    `html_type` VARCHAR(200) NOT NULL DEFAULT '',
    `dict_type` VARCHAR(200) NOT NULL DEFAULT '',
    `column_default` VARCHAR(200) NULL,
    `sort` INTEGER NOT NULL,
    `status` CHAR(1) NOT NULL DEFAULT '0',
    `del_flag` CHAR(1) NOT NULL DEFAULT '0',
    `create_by` VARCHAR(64) NOT NULL DEFAULT '',
    `create_time` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
    `update_by` VARCHAR(64) NOT NULL DEFAULT '',
    `update_time` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `remark` VARCHAR(500) NULL,

    PRIMARY KEY (`column_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_config` (
    `config_id` INTEGER NOT NULL AUTO_INCREMENT,
    `config_name` VARCHAR(100) NOT NULL DEFAULT '',
    `config_key` VARCHAR(100) NOT NULL DEFAULT '',
    `config_value` VARCHAR(500) NOT NULL DEFAULT '',
    `config_type` CHAR(1) NOT NULL DEFAULT 'N',
    `create_by` VARCHAR(64) NOT NULL DEFAULT '',
    `create_time` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
    `update_by` VARCHAR(64) NOT NULL DEFAULT '',
    `update_time` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `remark` VARCHAR(500) NULL,
    `status` CHAR(1) NOT NULL DEFAULT '0',
    `del_flag` CHAR(1) NOT NULL DEFAULT '0',

    PRIMARY KEY (`config_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_dept` (
    `dept_id` INTEGER NOT NULL AUTO_INCREMENT,
    `parent_id` INTEGER NOT NULL DEFAULT 0,
    `ancestors` VARCHAR(50) NOT NULL DEFAULT '0',
    `dept_name` VARCHAR(30) NOT NULL,
    `order_num` INTEGER NOT NULL DEFAULT 0,
    `leader` VARCHAR(20) NOT NULL,
    `phone` VARCHAR(11) NOT NULL DEFAULT '',
    `email` VARCHAR(50) NOT NULL DEFAULT '',
    `status` CHAR(1) NOT NULL DEFAULT '0',
    `del_flag` CHAR(1) NOT NULL DEFAULT '0',
    `create_by` VARCHAR(64) NOT NULL DEFAULT '',
    `create_time` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
    `update_by` VARCHAR(64) NOT NULL DEFAULT '',
    `update_time` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `remark` VARCHAR(500) NULL,

    PRIMARY KEY (`dept_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_dict_data` (
    `dict_code` INTEGER NOT NULL AUTO_INCREMENT,
    `dict_sort` INTEGER NOT NULL DEFAULT 0,
    `dict_label` VARCHAR(100) NOT NULL,
    `dict_value` VARCHAR(100) NOT NULL,
    `dict_type` VARCHAR(100) NOT NULL,
    `css_class` VARCHAR(100) NOT NULL DEFAULT '',
    `list_class` VARCHAR(100) NOT NULL,
    `is_default` CHAR(1) NOT NULL DEFAULT 'N',
    `status` CHAR(1) NOT NULL DEFAULT '0',
    `create_by` VARCHAR(64) NOT NULL DEFAULT '',
    `create_time` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
    `update_by` VARCHAR(64) NOT NULL DEFAULT '',
    `update_time` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `remark` VARCHAR(500) NULL,
    `del_flag` CHAR(1) NOT NULL DEFAULT '0',

    PRIMARY KEY (`dict_code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_dict_type` (
    `dict_id` INTEGER NOT NULL AUTO_INCREMENT,
    `dict_name` VARCHAR(100) NOT NULL,
    `dict_type` VARCHAR(100) NOT NULL,
    `status` CHAR(1) NOT NULL DEFAULT '0',
    `create_by` VARCHAR(64) NOT NULL DEFAULT '',
    `create_time` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
    `update_by` VARCHAR(64) NOT NULL DEFAULT '',
    `update_time` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `remark` VARCHAR(500) NULL,
    `del_flag` CHAR(1) NOT NULL DEFAULT '0',

    UNIQUE INDEX `IDX_f4e4273658733a3bbe6a2479bf`(`dict_type`),
    PRIMARY KEY (`dict_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_job` (
    `job_id` INTEGER NOT NULL AUTO_INCREMENT,
    `job_name` VARCHAR(64) NOT NULL,
    `job_group` VARCHAR(64) NOT NULL DEFAULT 'DEFAULT',
    `invoke_target` VARCHAR(500) NOT NULL,
    `cron_expression` VARCHAR(255) NULL,
    `misfire_policy` VARCHAR(20) NULL DEFAULT '3',
    `concurrent` CHAR(1) NULL DEFAULT '1',
    `status` CHAR(1) NOT NULL DEFAULT '0',
    `create_by` VARCHAR(64) NOT NULL DEFAULT '',
    `create_time` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
    `update_by` VARCHAR(64) NOT NULL DEFAULT '',
    `update_time` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `remark` VARCHAR(500) NULL,
    `del_flag` CHAR(1) NOT NULL DEFAULT '0',

    PRIMARY KEY (`job_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_job_log` (
    `job_log_id` INTEGER NOT NULL AUTO_INCREMENT,
    `job_name` VARCHAR(64) NOT NULL,
    `job_group` VARCHAR(64) NOT NULL,
    `invoke_target` VARCHAR(500) NOT NULL,
    `job_message` VARCHAR(500) NULL,
    `status` CHAR(1) NOT NULL DEFAULT '0',
    `exception_info` VARCHAR(2000) NULL,
    `create_time` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    PRIMARY KEY (`job_log_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_logininfor` (
    `info_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_name` VARCHAR(50) NOT NULL DEFAULT '',
    `ipaddr` VARCHAR(128) NOT NULL DEFAULT '',
    `login_location` VARCHAR(255) NOT NULL DEFAULT '',
    `browser` VARCHAR(50) NOT NULL DEFAULT '',
    `os` VARCHAR(50) NOT NULL DEFAULT '',
    `status` CHAR(1) NOT NULL DEFAULT '0',
    `msg` VARCHAR(255) NOT NULL DEFAULT '',
    `del_flag` CHAR(1) NOT NULL DEFAULT '0',
    `login_time` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    PRIMARY KEY (`info_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_menu` (
    `menu_id` INTEGER NOT NULL AUTO_INCREMENT,
    `menu_name` VARCHAR(50) NOT NULL,
    `parent_id` INTEGER NOT NULL,
    `order_num` INTEGER NOT NULL DEFAULT 0,
    `path` VARCHAR(200) NOT NULL DEFAULT '',
    `component` VARCHAR(255) NULL,
    `query` VARCHAR(255) NOT NULL DEFAULT '',
    `is_frame` CHAR(1) NOT NULL DEFAULT '1',
    `is_cache` CHAR(1) NOT NULL DEFAULT '0',
    `menu_type` CHAR(1) NOT NULL DEFAULT 'M',
    `visible` CHAR(1) NOT NULL DEFAULT '0',
    `status` CHAR(1) NOT NULL DEFAULT '0',
    `perms` VARCHAR(100) NOT NULL DEFAULT '',
    `icon` VARCHAR(100) NOT NULL DEFAULT '',
    `create_by` VARCHAR(64) NOT NULL DEFAULT '',
    `create_time` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
    `update_by` VARCHAR(64) NOT NULL DEFAULT '',
    `update_time` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `remark` VARCHAR(500) NULL,
    `del_flag` CHAR(1) NOT NULL DEFAULT '0',

    PRIMARY KEY (`menu_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_notice` (
    `notice_id` INTEGER NOT NULL AUTO_INCREMENT,
    `notice_title` VARCHAR(50) NOT NULL DEFAULT '',
    `notice_type` CHAR(1) NOT NULL,
    `notice_content` LONGTEXT NULL,
    `status` CHAR(1) NOT NULL DEFAULT '0',
    `create_by` VARCHAR(64) NOT NULL DEFAULT '',
    `create_time` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
    `update_by` VARCHAR(64) NOT NULL DEFAULT '',
    `update_time` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `del_flag` CHAR(1) NOT NULL DEFAULT '0',
    `remark` VARCHAR(500) NULL,

    PRIMARY KEY (`notice_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_oper_log` (
    `oper_id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(50) NOT NULL DEFAULT '',
    `business_type` INTEGER NOT NULL DEFAULT 0,
    `request_method` VARCHAR(10) NOT NULL DEFAULT '',
    `oper_name` VARCHAR(50) NOT NULL DEFAULT '',
    `dept_name` VARCHAR(50) NOT NULL DEFAULT '',
    `oper_url` VARCHAR(255) NOT NULL DEFAULT '',
    `oper_location` VARCHAR(255) NOT NULL DEFAULT '',
    `oper_param` VARCHAR(2000) NOT NULL DEFAULT '',
    `json_result` VARCHAR(2000) NOT NULL DEFAULT '',
    `error_msg` VARCHAR(2000) NOT NULL DEFAULT '',
    `method` VARCHAR(100) NOT NULL DEFAULT '',
    `oper_ip` VARCHAR(255) NOT NULL DEFAULT '',
    `oper_time` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `status` CHAR(1) NOT NULL DEFAULT '0',
    `cost_time` INTEGER NOT NULL DEFAULT 0,
    `operator_type` VARCHAR(255) NOT NULL DEFAULT '0',

    PRIMARY KEY (`oper_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_post` (
    `post_id` INTEGER NOT NULL AUTO_INCREMENT,
    `post_code` VARCHAR(64) NOT NULL,
    `post_name` VARCHAR(50) NOT NULL,
    `post_sort` INTEGER NOT NULL DEFAULT 0,
    `status` CHAR(1) NOT NULL DEFAULT '0',
    `create_by` VARCHAR(64) NOT NULL DEFAULT '',
    `create_time` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
    `update_by` VARCHAR(64) NOT NULL DEFAULT '',
    `update_time` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `remark` VARCHAR(500) NULL,
    `del_flag` CHAR(1) NOT NULL DEFAULT '0',

    PRIMARY KEY (`post_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_role` (
    `role_id` INTEGER NOT NULL AUTO_INCREMENT,
    `role_name` VARCHAR(30) NOT NULL,
    `role_key` VARCHAR(100) NOT NULL,
    `role_sort` INTEGER NOT NULL DEFAULT 0,
    `data_scope` CHAR(1) NOT NULL DEFAULT '1',
    `menu_check_strictly` TINYINT NOT NULL DEFAULT 0,
    `dept_check_strictly` TINYINT NOT NULL DEFAULT 0,
    `status` CHAR(1) NOT NULL DEFAULT '0',
    `del_flag` CHAR(1) NOT NULL DEFAULT '0',
    `create_by` VARCHAR(64) NOT NULL DEFAULT '',
    `create_time` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
    `update_by` VARCHAR(64) NOT NULL DEFAULT '',
    `update_time` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `remark` VARCHAR(500) NULL,

    PRIMARY KEY (`role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_role_dept` (
    `role_id` INTEGER NOT NULL DEFAULT 0,
    `dept_id` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`role_id`, `dept_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_role_menu` (
    `role_id` INTEGER NOT NULL DEFAULT 0,
    `menu_id` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`role_id`, `menu_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_upload` (
    `upload_id` VARCHAR(255) NOT NULL,
    `status` CHAR(1) NOT NULL DEFAULT '0',
    `del_flag` CHAR(1) NOT NULL DEFAULT '0',
    `create_by` VARCHAR(64) NOT NULL DEFAULT '',
    `create_time` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
    `update_by` VARCHAR(64) NOT NULL DEFAULT '',
    `update_time` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `remark` VARCHAR(500) NULL,
    `size` INTEGER NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `new_file_name` VARCHAR(255) NOT NULL,
    `url` VARCHAR(255) NOT NULL,
    `ext` VARCHAR(255) NULL,

    PRIMARY KEY (`upload_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_user` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `dept_id` INTEGER NULL,
    `user_name` VARCHAR(30) NOT NULL,
    `nick_name` VARCHAR(30) NOT NULL,
    `user_type` VARCHAR(2) NOT NULL DEFAULT '00',
    `email` VARCHAR(50) NOT NULL DEFAULT '',
    `phonenumber` VARCHAR(11) NOT NULL DEFAULT '',
    `sex` CHAR(1) NOT NULL DEFAULT '0',
    `password` VARCHAR(200) NOT NULL DEFAULT '',
    `status` CHAR(1) NOT NULL DEFAULT '0',
    `del_flag` CHAR(1) NOT NULL DEFAULT '0',
    `login_ip` VARCHAR(128) NOT NULL DEFAULT '',
    `create_by` VARCHAR(64) NOT NULL DEFAULT '',
    `create_time` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
    `update_by` VARCHAR(64) NOT NULL DEFAULT '',
    `update_time` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `remark` VARCHAR(500) NULL,
    `avatar` VARCHAR(255) NOT NULL DEFAULT '',
    `login_date` TIMESTAMP(0) NULL,

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_user_post` (
    `user_id` INTEGER NOT NULL,
    `post_id` INTEGER NOT NULL,

    PRIMARY KEY (`user_id`, `post_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sys_user_role` (
    `user_id` INTEGER NOT NULL,
    `role_id` INTEGER NOT NULL,

    PRIMARY KEY (`user_id`, `role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
