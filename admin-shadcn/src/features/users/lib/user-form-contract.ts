type UserFormValues = {
  userId?: number
  userName: string
  nickName: string
  password: string
  confirmPassword: string
  deptId: string
  phonenumber: string
  email: string
  sex: string
  status: string
  postIds: string[]
  roleIds: string[]
  remark: string
}

type UserDetailResponse = {
  data: {
    userId: number
    userName: string
    nickName: string
    deptId?: number
    phonenumber?: string
    email?: string
    sex?: string
    status?: string
    remark?: string
  }
  postIds?: number[]
  roleIds?: number[]
}

type DeptTreeNode = {
  id: number
  label: string
  children?: DeptTreeNode[]
}

export function buildUserSavePayload(values: UserFormValues) {
  const payload = {
    ...(values.userId ? { userId: values.userId } : {}),
    userName: values.userName.trim(),
    nickName: values.nickName.trim(),
    ...(values.password ? { password: values.password } : {}),
    deptId: Number(values.deptId),
    phonenumber: values.phonenumber.trim(),
    email: values.email.trim(),
    sex: values.sex,
    status: values.status,
    postIds: values.postIds.map(Number),
    roleIds: values.roleIds.map(Number),
    remark: values.remark,
  }

  return payload
}

export function buildUserFormDefaults(detail: UserDetailResponse): UserFormValues {
  return {
    userId: detail.data.userId,
    userName: detail.data.userName,
    nickName: detail.data.nickName,
    password: '',
    confirmPassword: '',
    deptId: String(detail.data.deptId ?? ''),
    phonenumber: detail.data.phonenumber ?? '',
    email: detail.data.email ?? '',
    sex: detail.data.sex ?? '0',
    status: detail.data.status ?? '0',
    postIds: (detail.postIds ?? []).map(String),
    roleIds: (detail.roleIds ?? []).map(String),
    remark: detail.data.remark ?? '',
  }
}

export function flattenDeptOptions(
  nodes: DeptTreeNode[],
  parentLabels: string[] = []
): Array<{ label: string; value: string }> {
  return nodes.flatMap((node) => {
    const labels = [...parentLabels, node.label]
    const current = {
      label: labels.join(' / '),
      value: String(node.id),
    }

    return [current, ...flattenDeptOptions(node.children ?? [], labels)]
  })
}

export type { DeptTreeNode, UserDetailResponse, UserFormValues }
