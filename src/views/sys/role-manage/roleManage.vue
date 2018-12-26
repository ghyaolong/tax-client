<style lang="less">
@import "./roleManage.less";
</style>
<template>
    <div class="search">
        <Row>
            <Col>
                <Card>
                    <Row class="operation">
                        <Button @click="addRole" type="primary" icon="md-add">添加角色</Button>
                        <Button @click="delAll" icon="md-trash">批量删除</Button>
                        <Button @click="init" icon="md-refresh">刷新</Button>
                        <circleLoading v-if="operationLoading"/>
                    </Row>
                     <Row>
                        <Alert show-icon>
                            已选择 <span class="select-count">{{selectCount}}</span> 项
                            <a class="select-clear" @click="clearSelectAll">清空</a>
                        </Alert>
                    </Row>
                    <Row>
                        <Table :loading="loading" border :columns="columns" :data="data" ref="table" sortable="custom" @on-sort-change="changeSort" @on-selection-change="changeSelect"></Table>
                    </Row>
                    <Row type="flex" justify="end" class="page">
                        <Page :current="pageNumber" :total="total" :page-size="pageSize" @on-change="changePage" @on-page-size-change="changePageSize" :page-size-opts="[10,20,50]" size="small" show-total show-elevator show-sizer></Page>
                    </Row>
                </Card>
            </Col>
        </Row>
        <Modal :title="modalTitle" v-model="roleModalVisible" :mask-closable='false' :width="500">
          <Form ref="roleForm" :model="roleForm" :label-width="80" :rules="roleFormValidate">
            <FormItem label="角色名称" prop="name">
              <Input v-model="roleForm.name" placeholder=""/>
            </FormItem>
            <FormItem label="角色编码" prop="code">
              <Input v-model="roleForm.code"/>
            </FormItem>
            <FormItem label="角色对应节点" prop="processKey" :label-width="100">
              <Select v-model="roleForm.processKey" >
                <Option value="none" key="none">无</Option>
                <Option value="approvalProcess" key="approvalProcess">税金申报申请</Option>
                <Option value="reviewProcess" key="reviewProcess">复核申报</Option>
                <Option value="checkEntity" key="checkEntity">核查公司</Option>
                <Option value="examineEntity" key="examineEntity">审查公司</Option>
                <Option value="checkPay" key="checkPay">支付审批</Option>
                <Option value="approvalPay" key="approvalPay">审批支付</Option>
                <Option value="uploadPayFile" key="uploadPayFile">上传文件</Option>
              </Select>
            </FormItem>
          </Form>
          <div slot="footer">
            <Button type="text" @click="cancelRole">取消</Button>
            <Button type="primary" :loading="submitLoading" @click="submitRole">提交</Button>
          </div>
        </Modal>
        <Modal title="分配权限(点击选择)" v-model="permModalVisible" :mask-closable='false' :width="500" :styles="{top: '30px'}" class="permModal">
          <Tree ref="tree" :data="permData" multiple></Tree>
          <Spin size="large" v-if="treeLoading"></Spin>
          <div slot="footer">
            <Button type="text" @click="cancelPermEdit">取消</Button>
            <Button @click="selectTreeAll">全选/反选</Button>
            <Button type="primary" :loading="submitPermLoading" @click="submitPermEdit">提交</Button>
          </div>
        </Modal>
    </div>
</template>

<script>
import {
  getRoleList,
  getAllPermissionList,
  addRole,
  editRole,
  deleteRole,
  setDefaultRole,
  editRolePerm
} from "@/api/index";
import circleLoading from "../../my-components/circle-loading.vue";
export default {
  name: "role-manage",
  components: {
    circleLoading
  },
  data() {
    return {
      loading: true,
      treeLoading: true,
      operationLoading: false,
      submitPermLoading: false,
      sortColumn: "createTime",
      sortType: "desc",
      modalType: 0,
      roleModalVisible: false,
      permModalVisible: false,
      modalTitle: "",
      roleForm: {
        code: "",
        name: "",
        processKey: "none"
      },
      roleFormValidate: {
        name: [{ required: true, message: "角色名称不能为空", trigger: "blur" }],
        code: [{ required: true, message: "角色编码不能为空", trigger: "blur" }],
        processKey: [{ required: true, message: "流程KEY不能为空", trigger: "blur" }]
      },
      submitLoading: false,
      selectList: [],
      selectCount: 0,
      columns: [
        {
          type: "selection",
          width: 60,
          align: "center"
        },
        {
          type: "index",
          width: 60,
          align: "center"
        },
        {
          title: "角色名称",
          key: "name",
          // width: 190,
          sortable: true
        },
        {
          title: "角色编码",
          key: "code",
          width: 190,
          sortable: true
        },
        {
          title: "创建时间",
          key: "createTime",
          width: 160,
          sortable: true,
          sortType: "desc",
          render: (h, params) => {
            return h('div',params.row.createTime && new Date(params.row.createTime).format())
          }
        },
        {
          title: "角色对应节点",
          key: "processKey",
          width: 160,
          sortable: true,
          render: (h, params) => {
            return h('div',this.renderCnName(params.row.processKey))
          }
        },
        {
          title: "是否设置为注册用户默认角色",
          key: "defaultRole",
          align: "center",
          width: 180,
          render: (h, params) => {
            if (params.row.defaultRole) {
              return h("div", [
                h(
                  "Button",
                  {
                    props: {
                      type: "success",
                      size: "small"
                    },
                    style: {
                      marginRight: "5px"
                    },
                    on: {
                      click: () => {
                        this.cancelDefault(params.row);
                      }
                    }
                  },
                  "取消默认"
                )
              ]);
            } else {
              return h("div", [
                h(
                  "Button",
                  {
                    props: {
                      type: "info",
                      size: "small"
                    },
                    style: {
                      marginRight: "5px"
                    },
                    on: {
                      click: () => {
                        this.setDefault(params.row);
                      }
                    }
                  },
                  "设为默认"
                )
              ]);
            }
          }
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          width: 300,
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "warning",
                    size: "small"
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.editPerm(params.row);
                    }
                  }
                },
                "分配权限"
              ),
              h(
                "Button",
                {
                  props: {
                    type: "primary",
                    size: "small"
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.edit(params.row);
                    }
                  }
                },
                "编辑"
              ),
              h(
                "Button",
                {
                  props: {
                    type: "error",
                    size: "small"
                  },
                  on: {
                    click: () => {
                      this.remove(params.row);
                    }
                  }
                },
                "删除"
              )
            ]);
          }
        }
      ],
      data: [],
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      permData: [],
      editRolePermId: "",
      selectPermList: [],
      selectAllFlag: false
    };
  },
  methods: {
    // renderCnName
    renderCnName(key) {
      if(key) {
        let obj = {
          none:'无',
          approvalProcess:'税金申报申请',
          reviewProcess:'复核申报',
          checkEntity:'核查公司',
          examineEntity:'审查公司',
          checkPay:'支付审批',
          approvalPay:'审批支付',
          uploadPayFile:'上传文件',
        }
        return obj[key]
      }
    },
    init() {
      this.getRoleList();
      // 获取所有菜单权限树
      this.getPermList();
    },
    changePage(v) {
      this.pageNumber = v;
      this.getRoleList();
      this.clearSelectAll();
    },
    changePageSize(v) {
      this.pageSize = v;
      this.getRoleList();
    },
    changeSort(e) {
      this.sortColumn = e.key;
      this.sortType = e.order;
      if (e.order === "normal") {
        this.sortType = "";
      }
      this.getRoleList();
    },
    getRoleList() {
      this.loading = true;
      let params = {
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
        sort: this.sortColumn,
        order: this.sort
      };
      getRoleList(params).then(res => {
        this.loading = false;
        this.data = res.data.list;
        this.total = res.data.totalElements;
      }).catch(err => {
        this.loading = false;
      });
    },
    getPermList() {
      this.treeLoading = true;
      getAllPermissionList().then(res => {
        this.treeLoading = false;
        this.deleteDisableNode(res.data);
        this.permData = res.data;
      }).catch(err => {
        this.treeLoading = false;
      });
    },
    // 递归标记禁用节点
    deleteDisableNode(permData) {
      let that = this;
      permData.forEach(function(e) {
        if (e.status === -1) {
          e.title = "[已禁用] " + e.title;
          e.disabled = true;
        }
        if (e.children && e.children.length > 0) {
          that.deleteDisableNode(e.children);
        }
      });
    },
    cancelRole() {
      this.roleModalVisible = false;
    },
    submitRole() {
      let tempObj = {
        code: this.roleForm.code,
        name: this.roleForm.name,
        processKey: this.roleForm.processKey
      }
      if(JSON.stringify(this.tempObj)==JSON.stringify(tempObj)) {
        this.roleModalVisible = false;
        return;
      }
      this.$refs.roleForm.validate(valid => {
        if (valid) {
          this.submitLoading = true;
          let roleFn = this.modalType === 0 ? addRole : editRole;
          roleFn(this.roleForm).then(res => {
            this.submitLoading = false;
            this.$Message.success("操作成功");
            this.getRoleList();
            this.roleModalVisible = false;
          }).finally(() => {
            this.submitLoading = false;
          });
        }
      });
    },
    addRole() {
      this.modalType = 0;
      this.modalTitle = "添加角色";
      this.$refs.roleForm.resetFields();
      delete this.roleForm.id;
      this.roleModalVisible = true;
    },
    edit(v) {
      this.tempObj ={
        code: v.code,
        name: v.name,
        processKey: v.processKey
      }
      this.modalType = 1;
      this.modalTitle = "编辑角色";
      // 转换null为""
      for (let attr in v) {
        if (v[attr] === null) {
          v[attr] = "";
        }
      }
      let str = JSON.stringify(v);
      let roleInfo = JSON.parse(str);
      this.roleForm = roleInfo;
      this.roleModalVisible = true;
    },
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除角色 " + v.name + " ?",
        onOk: () => {
          this.operationLoading = true;
          deleteRole(v.id).then(res => {
            this.$Message.success("删除成功");
            this.getRoleList();
          }).finally(() => {
            this.operationLoading = false;
          });
        }
      });
    },
    setDefault(v) {
      this.$Modal.confirm({
        title: "确认设置",
        content: "您确认要设置所选的 " + v.name + " 为注册用户默认角色?",
        onOk: () => {
          let params = {
            id: v.id,
            isDefault: true
          };
          this.operationLoading = true;
          setDefaultRole(params).then(res => {
            this.operationLoading = false;
            this.$Message.success("操作成功");
            this.getRoleList();
          }).catch(() => {
            this.operationLoading = false;
          });
        }
      });
    },
    cancelDefault(v) {
      this.$Modal.confirm({
        title: "确认取消",
        content: "您确认要取消所选的 " + v.name + " 角色为默认?",
        onOk: () => {
          let params = {
            id: v.id,
            isDefault: false
          };
          this.operationLoading = true;
          setDefaultRole(params).then(res => {
            this.operationLoading = false;
            this.$Message.success("操作成功");
            this.getRoleList();
          }).catch(() => {
            this.operationLoading = false;
          });
        }
      });
    },
    clearSelectAll() {
      this.$refs.table.selectAll(false);
    },
    changeSelect(e) {
      this.selectList = e;
      this.selectCount = e.length;
    },
    delAll() {
      if (this.selectCount <= 0) {
        this.$Message.warning("您还未选择要删除的数据");
        return;
      }
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除所选的 " + this.selectCount + " 条数据?",
        onOk: () => {
          let ids = "";
          this.selectList.forEach(function(e) {
            ids += e.id + ",";
          });
          ids = ids.substring(0, ids.length - 1);
          this.operationLoading = true;
          deleteRole(ids).then(res => {
            this.operationLoading = false;
            this.$Message.success("删除成功");
            this.clearSelectAll();
            this.getRoleList();
          });
        }
      });
    },
    editPerm(v) {
      this.editRolePermId = v.id;
      // 匹配勾选
      let rolePerms = v.permissions;
      // 递归判断子节点
      this.checkPermTree(this.permData, rolePerms);
      this.permModalVisible = true;
    },
    // 递归判断子节点
    checkPermTree(permData, rolePerms) {
      let that = this;
      permData.forEach(function(p) {
        if (that.hasPerm(p, rolePerms)) {
          p.selected = true;
        } else {
          p.selected = false;
        }
        if (p.children && p.children.length > 0) {
          that.checkPermTree(p.children, rolePerms);
        }
      });
    },
    // 判断角色拥有的权限节点勾选
    hasPerm(p, rolePerms) {
      let flag = false;
      for (let i = 0; i < rolePerms.length; i++) {
        if (p.id === rolePerms[i].id) {
          flag = true;
          break;
        }
      }
      if (flag) {
        return true;
      }
      return false;
    },
    // 全选反选
    selectTreeAll() {
      this.selectAllFlag = !this.selectAllFlag;
      let select = this.selectAllFlag;
      this.selectedTreeAll(this.permData, select);
    },
    // 递归全选节点
    selectedTreeAll(permData, select) {
      let that = this;
      permData.forEach(function(e) {
        e.selected = select;
        if (e.children && e.children.length > 0) {
          that.selectedTreeAll(e.children, select);
        }
      });
    },
    submitPermEdit() {
      this.submitPermLoading = true;
      let permIds = "";
      let selectedNodes = this.$refs.tree.getSelectedNodes();
      selectedNodes.forEach(function(e) {
        permIds += e.id + ",";
      });
      permIds = permIds.substring(0, permIds.length - 1);
      editRolePerm({
        roleId: this.editRolePermId,
        permissionIds: permIds
      }).then(res => {
        this.submitPermLoading = false;
        this.$Message.success("操作成功");
        this.getRoleList();
        this.permModalVisible = false;
      });
    },
    cancelPermEdit() {
      this.permModalVisible = false;
    }
  },
  mounted() {
    this.init();
  }
};
</script>
