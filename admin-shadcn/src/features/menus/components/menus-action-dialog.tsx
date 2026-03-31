'use client'

import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { TreeSelect, type TreeSelectNode } from '@/components/tree-select'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { SelectDropdown } from '@/components/select-dropdown'
import {
  createMenu,
  fetchMenuDetail,
  fetchMenuTreeOptions,
  menusQueryKey,
  updateMenu,
} from '../api/menus'
import { type Menu } from '../data/schema'
import { type MenuFormValues } from '../lib/menu-contract'
import { MenuIconField } from './menu-icon-field'

const formSchema = z
  .object({
    menuId: z.number().optional(),
    parentId: z.string().min(1, '上级菜单不能为空'),
    menuName: z.string().min(1, '菜单名称不能为空').max(50, '菜单名称最多 50 位'),
    orderNum: z.number().int().min(0, '显示排序不能小于 0'),
    path: z.string(),
    component: z.string(),
    query: z.string(),
    isFrame: z.union([z.literal('yes'), z.literal('no')]),
    isCache: z.union([z.literal('cache'), z.literal('noCache')]),
    visible: z.union([z.literal('show'), z.literal('hide')]),
    status: z.union([z.literal('active'), z.literal('inactive')]),
    menuType: z.union([z.literal('directory'), z.literal('menu'), z.literal('button')]),
    perms: z.string(),
    icon: z.string(),
  })
  .superRefine((value, context) => {
    if (value.menuType !== 'button' && !value.path.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['path'],
        message: '路由地址不能为空',
      })
    }
  })

const emptyValues: MenuFormValues = {
  parentId: '0',
  menuName: '',
  orderNum: 0,
  path: '',
  component: '',
  query: '',
  isFrame: 'no',
  isCache: 'cache',
  visible: 'show',
  status: 'active',
  menuType: 'directory',
  perms: '',
  icon: '',
}

type MenusActionDialogProps = {
  currentRow?: Menu
  parentRow?: Menu | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MenusActionDialog({
  currentRow,
  parentRow,
  open,
  onOpenChange,
}: MenusActionDialogProps) {
  const isEdit = !!currentRow?.menuId
  const queryClient = useQueryClient()
  const form = useForm<MenuFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyValues,
  })

  const menuType = form.watch('menuType')

  const treeOptionsQuery = useQuery({
    queryKey: ['menus', 'tree-options'],
    queryFn: fetchMenuTreeOptions,
    enabled: open,
  })

  const detailQuery = useQuery({
    queryKey: ['menus', 'detail', currentRow?.menuId],
    queryFn: () => fetchMenuDetail(currentRow!.menuId),
    enabled: open && isEdit,
  })

  useEffect(() => {
    if (!open) {
      form.reset(emptyValues)
      return
    }

    if (isEdit) {
      if (detailQuery.data) {
        form.reset(detailQuery.data)
      }
      return
    }

    form.reset({
      ...emptyValues,
      parentId: parentRow ? String(parentRow.menuId) : '0',
    })
  }, [detailQuery.data, form, isEdit, open, parentRow])

  const saveMutation = useMutation({
    mutationFn: async (values: MenuFormValues) => {
      if (values.menuId) {
        await updateMenu(values)
        return
      }
      await createMenu(values)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menusQueryKey })
      onOpenChange(false)
      form.reset(emptyValues)
    },
  })

  const menuOptionsTree = (treeOptionsQuery.data ?? []).filter(
    (option) => option.menuId !== currentRow?.menuId
  )
  const menuTreeSelectData: TreeSelectNode[] = menuOptionsTree.map(function mapMenuNode(
    node
  ): TreeSelectNode {
    return {
      id: String(node.menuId),
      label: node.menuName,
      children: (node.children ?? []).map(mapMenuNode),
    }
  })
  const loading = treeOptionsQuery.isLoading || (isEdit && detailQuery.isLoading)

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!saveMutation.isPending) {
          onOpenChange(state)
        }
      }}
    >
      <DialogContent className='sm:max-w-4xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? '修改菜单' : '新增菜单'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '更新菜单类型、路由信息、显隐状态和权限标识。' : '创建新菜单并设置上级菜单、类型和基础信息。'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className='flex h-48 items-center justify-center text-muted-foreground'>
            <Loader2 className='me-2 size-4 animate-spin' />
            正在加载菜单信息...
          </div>
        ) : (
          <Form {...form}>
            <form
              id='menu-form'
              onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
              className='space-y-5'
            >
              <FormField
                control={form.control}
                name='parentId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>上级菜单</FormLabel>
                    <TreeSelect
                      data={menuTreeSelectData}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder='请选择上级菜单'
                      rootOption={{ label: '主类目', value: '0' }}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='menuType'
                render={({ field }) => (
                  <FormItem className='space-y-3'>
                    <FormLabel>菜单类型</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className='flex flex-wrap gap-4'
                      >
                        <FormItem className='flex items-center gap-2'>
                          <FormControl>
                            <RadioGroupItem value='directory' />
                          </FormControl>
                          <FormLabel className='font-normal'>目录</FormLabel>
                        </FormItem>
                        <FormItem className='flex items-center gap-2'>
                          <FormControl>
                            <RadioGroupItem value='menu' />
                          </FormControl>
                          <FormLabel className='font-normal'>菜单</FormLabel>
                        </FormItem>
                        <FormItem className='flex items-center gap-2'>
                          <FormControl>
                            <RadioGroupItem value='button' />
                          </FormControl>
                          <FormLabel className='font-normal'>按钮</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid gap-4 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='menuName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>菜单名称</FormLabel>
                      <FormControl>
                        <Input placeholder='请输入菜单名称' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='orderNum'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>显示排序</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min={0}
                          placeholder='请输入显示排序'
                          value={String(field.value ?? 0)}
                          onChange={(event) => field.onChange(Number(event.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {menuType !== 'button' ? (
                <div className='grid gap-4 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='icon'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>菜单图标</FormLabel>
                      <FormControl>
                        <MenuIconField value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                  <FormField
                    control={form.control}
                    name='path'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>路由地址</FormLabel>
                        <FormControl>
                          <Input placeholder='请输入路由地址' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ) : null}

              <div className='grid gap-4 md:grid-cols-2'>
                {menuType !== 'button' ? (
                  <FormField
                    control={form.control}
                    name='isFrame'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>是否外链</FormLabel>
                        <SelectDropdown
                          key={`menu-frame-${field.value}`}
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          placeholder='请选择是否外链'
                          className='w-full'
                          items={[
                            { label: '是', value: 'yes' },
                            { label: '否', value: 'no' },
                          ]}
                          isControlled
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}

                {menuType === 'menu' ? (
                  <FormField
                    control={form.control}
                    name='component'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>组件路径</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='请输入组件路径，如 system/menu/index'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}
              </div>

              <div className='grid gap-4 md:grid-cols-2'>
                {menuType !== 'directory' ? (
                  <FormField
                    control={form.control}
                    name='perms'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>权限标识</FormLabel>
                        <FormControl>
                          <Input placeholder='请输入权限标识' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}

                {menuType === 'menu' ? (
                  <FormField
                    control={form.control}
                    name='query'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>路由参数</FormLabel>
                        <FormControl>
                          <Input placeholder='请输入路由参数' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}
              </div>

              {menuType === 'menu' ? (
                <FormField
                  control={form.control}
                  name='isCache'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>是否缓存</FormLabel>
                      <SelectDropdown
                        key={`menu-cache-${field.value}`}
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder='请选择是否缓存'
                        className='w-full'
                        items={[
                          { label: '缓存', value: 'cache' },
                          { label: '不缓存', value: 'noCache' },
                        ]}
                        isControlled
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}

              {menuType !== 'button' ? (
                <div className='grid gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='visible'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>显示状态</FormLabel>
                        <SelectDropdown
                          key={`menu-visible-${field.value}`}
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          placeholder='请选择显示状态'
                          className='w-full'
                          items={[
                            { label: '显示', value: 'show' },
                            { label: '隐藏', value: 'hide' },
                          ]}
                          isControlled
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='status'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>菜单状态</FormLabel>
                        <SelectDropdown
                          key={`menu-status-${field.value}`}
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          placeholder='请选择菜单状态'
                          className='w-full'
                          items={[
                            { label: '启用', value: 'active' },
                            { label: '停用', value: 'inactive' },
                          ]}
                          isControlled
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ) : null}
            </form>
          </Form>
        )}

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={saveMutation.isPending}
          >
            取消
          </Button>
          <Button type='submit' form='menu-form' disabled={saveMutation.isPending || loading}>
            {saveMutation.isPending ? '保存中...' : isEdit ? '保存修改' : '创建菜单'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
