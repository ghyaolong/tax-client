// 统一请求路径前缀在libs/axios.js中修改
import { getRequest, formPostRequest, postRequest, putRequest, deleteRequest, uploadFileRequest } from '@/libs/axios';

// 登陆
export const login = (params) => {
    return formPostRequest('/login', params)
}
// 获取用户登录信息
export const userInfo = (params) => {
    return getRequest('/user/info', params)
}
// 注册
export const regist = (params) => {
    return postRequest('/user/regist', params)
}
// 初始化验证码
export const initCaptcha = (params) => {
    return getRequest('/common/captcha/init', params)
}
// 发送短信验证码
export const sendSms = (mobile, params) => {
    return getRequest(`/common/captcha/sendSms/${mobile}`, params)
}
// 短信验证码登录
export const smsLogin = (params) => {
    return postRequest('/user/smsLogin', params)
}
// IP天气信息
export const ipInfo = (params) => {
    return getRequest('/common/ip/info', params)
}
// 个人中心编辑
export const userInfoEdit = (params) => {
    return postRequest('/user/edit', params)
}
// 个人中心修改密码
export const changePass = (params) => {
    return postRequest('/user/editPassword', params)
}
// 解锁
export const unlock = (params) => {
    return postRequest('/user/unlock', params)
}



// github登录
export const githubLogin = (params) => {
    return getRequest('/social/github/login', params)
}
// qq登录
export const qqLogin = (params) => {
    return getRequest('/social/qq/login', params)
}
// 微博登录
export const weiboLogin = (params) => {
    return getRequest('/social/weibo/login', params)
}
// 绑定账号
export const relate = (params) => {
    return postRequest('/social/relate', params)
}
// 获取JWT
export const getJWT = (params) => {
    return getRequest('/social/getJWT', params)
}



// 获取绑定账号信息
export const relatedInfo = (username, params) => {
    return getRequest(`/relate/getRelatedInfo/${username}`, params)
}
// 解绑账号
export const unRelate = (params) => {
    return postRequest('/relate/delByIds', params)
}
// 分页获取绑定账号信息
export const getRelatedListData = (params) => {
    return getRequest('/relate/findByCondition', params)
}

// 获取所有公司
export const getAllCompany = params => {
    return getRequest('/company/getAll', params)
}
// 获取该用户所属公司
export const getCompanyByUser = userId => {
    return getRequest(`/company/userId/${userId}`)
}
// 获取未被分配的公司列表
export const getUnAssignCompany = params => {
    return getRequest('/company/getUnAssign', params)
}
// 分页获取公司列表
export const getCompanyListData = params => {
    return postRequest('/company/getAllPage', params)
}
// 获取公司列表
export const getCompanyByName = params => {
    return postRequest('/company/getByName', params)
}

// 添加税种
export const getAssignTaxes = params => {
    return postRequest('/company/assignTaxes', params)
}

// 添加公司
export const addCompany = params => {
    return postRequest('/company/add', params)
}
// 编辑公司
export const editCompany = params => {
    return postRequest('/company/edit', params)
}
// 编辑公司
export const deleteCompany = (id, params) => {
    return deleteRequest(`company/del/${id}`, params)
}

// 获取字典列表
export const getDictListData = params => {
    return postRequest('/dict/getAllPage', params)
}
// 添加字典
export const addDict = params => {
    return postRequest('/dict/add', params)
}
// 编辑字典
export const editDict = params => {
    return postRequest('/dict/edit', params)
}
// 编辑字典
export const deleteDict = (id, params) => {
    return deleteRequest(`/dict/del/${id}`, params)
}
// 通过类型查询字典集合
export const getDictListDataByType = (typeId, params) => {
    return getRequest(`/dict/getByType/${typeId}`, params)
}

// 获取用户数据 多条件
export const getUserListData = (params) => {
    return postRequest('/user/all', params)
}
// 获取全部用户数据
export const getAllUserData = (params) => {
    return getRequest('/user/getAll', params)
}
// 添加用户
export const addUser = (params) => {
    return postRequest('/user/add', params)
}
// 编辑用户
export const editUser = (params) => {
    return postRequest('/user/edit', params)
}
// 启用用户
export const enableUser = (id, params) => {
    return postRequest(`/user/admin/enable/${id}`, params)
}
// 禁用用户
export const disableUser = (id, params) => {
    return postRequest(`/user/admin/disable/${id}`, params)
}
// 删除用户
export const deleteUser = (ids, params) => {
    return deleteRequest(`/user/delByIds/${ids}`, params)
}



// 获取一级部门
export const initDepartment = (params) => {
    return getRequest('/department/getAll/0', params)
}
// 加载部门子级数据
export const loadDepartment = (id, params) => {
    return getRequest(`/department/getAll/${id}`, params)
}
// 添加部门
export const addDepartment = (params) => {
    return postRequest('/department/add', params)
}
// 编辑部门
export const editDepartment = (params) => {
    return postRequest('/department/edit', params)
}
// 删除部门
export const deleteDepartment = (ids, params) => {
    return deleteRequest(`/department/del/${ids}`, params)
}



// 获取全部角色数据
export const getAllRoleList = (params) => {
    return getRequest('/role/all', params)
}
// 分页获取角色数据
export const getRoleList = (params) => {
    return postRequest('/role/all/page', params)
}
// 添加角色
export const addRole = (params) => {
    return postRequest('/role/add', params)
}
// 编辑角色
export const editRole = (params) => {
    return postRequest('/role/edit', params)
}
// 设为或取消注册角色
export const setDefaultRole = (params) => {
    return postRequest('/role/setDefault', params)
}
// 分配角色权限
/* export const editRolePerm = (id, params) => {
    return postRequest(`/role/editRolePerm/${id}`, params)
} */
export const editRolePerm = (params) => {
    return postRequest(`/role/assignPermission`, params)
}
// 删除角色
export const deleteRole = (ids, params) => {
    return deleteRequest(`/role/del/${ids}`, params)
}



// 获取全部权限数据
export const getAllPermissionList = (params) => {
    return getRequest('/permission/getAllList', params)
}
// 添加权限
export const addPermission = (params) => {
    return postRequest('/permission/add', params)
}
// 编辑权限
export const editPermission = (params) => {
    return postRequest('/permission/edit', params)
}
// 删除权限
export const deletePermission = (ids, params) => {
    return deleteRequest(`/permission/delByIds/${ids}`, params)
}



// 分页获取日志数据
export const getLogListData = (params) => {
    // return getRequest('/log/getAllByPage', params)
    return postRequest('/logInfo/allPage', params)
}
// 搜索获取日志数据
export const getSearchLogData = (params) => {
    return getRequest('/log/search', params)
}
// 删除日志
export const deleteLog = (ids, params) => {
    return deleteRequest(`/logInfo/delByIds/${ids}`, params)
}
// 清空日志
export const deleteAllLog = (params) => {
    return deleteRequest('/logInfo/delAll', params)
}



// 分页获取定时任务数据
export const getQuartzListData = (params) => {
    return getRequest('/quartzJob/getAllByPage', params)
}
// 添加定时任务
export const addQuartz = (params) => {
    return postRequest('/quartzJob/add', params)
}
// 编辑定时任务
export const editQuartz = (params) => {
    return postRequest('/quartzJob/edit', params)
}
// 暂停定时任务
export const pauseQuartz = (params) => {
    return postRequest('/quartzJob/pause', params)
}
// 恢复定时任务
export const resumeQuartz = (params) => {
    return postRequest('/quartzJob/resume', params)
}
// 删除定时任务
export const deleteQuartz = (ids, params) => {
    return deleteRequest(`/quartzJob/delByIds/${ids}`, params)
}



// 分页获取消息数据
export const getMessageData = (params) => {
    return getRequest('/message/getByCondition', params)
}
// 添加消息
export const addMessage = (params) => {
    return postRequest('/message/add', params)
}
// 编辑消息
export const editMessage = (params) => {
    return postRequest('/message/edit', params)
}
// 删除消息
export const deleteMessage = (ids, params) => {
    return deleteRequest(`/message/delByIds/${ids}`, params)
}
// 分页获取消息推送数据
export const getMessageSendData = (params) => {
    return getRequest('/messageSend/getByCondition', params)
}
// 编辑发送消息
export const editMessageSend = (params) => {
    return putRequest('/messageSend/update', params)
}
// 删除发送消息
export const deleteMessageSend = (ids, params) => {
    return deleteRequest(`/messageSend/delByIds/${ids}`, params)
}

// 税金申请
export const taxAdd = (params) => {
    return postRequest('/tax/add', params)
}
// 待提申请
export const taxReadyCommit = params => {
    return postRequest('/tax/readyCommit', params)
}
// 获取申请详情
export const taxDetail = (id, params) => {
    return getRequest(`/tax/get/${id}`, params)
}
// 税金申请编辑
export const taxEdit = params => {
    return postRequest('/tax/edit', params)
}
// 删除税金申请
export const taxDel = id => {
    return deleteRequest(`/tax/delById/${id}`)
}
// 待办申请
export const taxReadyHandle = params => {
    return postRequest('/process/list', params)
}
// 已办申请
export const taxAlreadyHandle = params => {
    return postRequest('/tax/alreadyHandle', params)
}

//查询流程详情
export const getTaxAuditLog = (flowNum,params) => {
    return getRequest(`/tax/getTaxAuditLog/${flowNum}`, params)
}

// 补充税金申请
export const taxReplenishment = params => {
    return postRequest('/tax/replenishment', params)
}
// 获取当前登录用户的上级审核人
export const getReviewer = params => {
    return getRequest('/user/getReviewer', params)
}

// 上传文件
export const uploadFile = params => {
    return uploadFileRequest('/file/upload', params);
}
// 下载文件
export const downloadFile = name => {
    return `/api//file/download/${name}`
}
// 预览文件
export const previewFile = name => {
    return `/api/file/${name}`
}
// 查询资料
export const getFilesList = params => {
    return postRequest('/material/getAllPage', params);
}
// 增加调度
export const addSchedualList = params => {
    return postRequest('/schedual/add', params)
}

// 编辑调度
export const editSchedualList = params => {
    return postRequest('/schedual/edit', params)
}

// 查询调度
export const getSchedualList = params => {
    return postRequest('/schedual/getAllByPage', params)
}

// 暂停调度
export const schedualPause = params => {
    return postRequest('/schedual/pause', params)
}
// 恢复调度
export const schedualResume = params => {
    return postRequest('/schedual/resume', params)
}
// 删除调度
export const schedualDel = (ids, params) => {
    return deleteRequest(`/schedual/delByIds/${ids}`, params);
}

// 统计分析
export const getStatistics = params => {
    return postRequest('/statistics/findAll', params)
}

// 税金申请--提交
export const submitJJSQ = params => {
    return postRequest('/process/start', params)
}

// 代办任务--处理同意||决绝
export const dbrwAudit=params=>{
  return postRequest('/process/audit',params)
}
// 代办任务---查看流程图
export const lookLiuchengtu=params=>{
  return postRequest('/process/image',params)
}
