<style lang="less">
@import "./userManage.less";
</style>
<template>
    <div class="search">
        <Row>
            <Col>
                <Card>
                    <Row>
                        <Form ref="searchForm" :model="searchForm" inline :label-width="120" class="search-form">
                            <Form-item label="用户名" prop="username">
                              <Input type="text" v-model="searchForm.username" clearable placeholder="请输入用户名" style="width: 200px" :maxlength="20"/>
                            </Form-item>
                            <Form-item label="E编码" prop="eCode">
                              <Input type="text" v-model="searchForm.eCode" clearable placeholder="请输入E编码" style="width: 200px" :maxlength="20"/>
                            </Form-item>
                            <Form-item label="角色" prop="roleids">
                              <Select v-model="searchForm.roleids" style="width: 200px">
                                <Option v-for="item in roleList" :value="item.id" :key="item.id" :label="item.name"></Option>
                              </Select>
                            </Form-item>
                            <span v-if="drop">
                              <Form-item label="创建开始时间">
                                <DatePicker v-model="searchForm.startDate" type="date"  clearable placeholder="选择开始时间" style="width: 200px"></DatePicker>
                              </Form-item>
                              <Form-item label="创建结束时间">
                                <DatePicker v-model="searchForm.endDate" type="date" :options="renderEndDate" clearable placeholder="选择结束时间" style="width: 200px"></DatePicker>
                              </Form-item>
                            </span>
                            <Form-item style="margin-left:-35px;" class="br">
                              <Button @click="handleSearch" type="primary" icon="ios-search">搜索</Button>
                              <Button @click="handleReset" >重置</Button>
                              <a class="drop-down" @click="dropDown">{{dropDownContent}}
                                <Icon :type="dropDownIcon"></Icon>
                              </a>
                            </Form-item>
                        </Form>
                    </Row>
                    <Row class="operation">
                        <Button @click="add" type="primary" icon="md-add">添加用户</Button>
                        <Button @click="delAll" icon="md-trash">批量删除</Button>
                        <Dropdown @on-click="handleDropdown">
                          <Button>
                              更多操作
                              <Icon type="md-arrow-dropdown" />
                          </Button>
                          <DropdownMenu slot="list">
                              <DropdownItem name="refresh">刷新</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                        <circleLoading v-if="operationLoading"/>
                    </Row>
                    <Row>
                        <Alert show-icon>
                            已选择 <span class="select-count">{{selectCount}}</span> 项
                            <a class="select-clear" @click="clearSelectAll">清空</a>
                        </Alert>
                    </Row>
                    <Row>
                        <Table :loading="loading" border :columns="columns" :data="data" sortable="custom" @on-sort-change="changeSort" @on-selection-change="showSelect" ref="table"></Table>
                    </Row>
                    <Row type="flex" justify="end" class="page">
                        <Page :current="searchForm.pageNumber" :total="total" :page-size="searchForm.pageSize" @on-change="changePage" @on-page-size-change="changePageSize" :page-size-opts="[10,20,50]" size="small" show-total show-elevator show-sizer></Page>
                    </Row>
                </Card>
            </Col>
        </Row>
        <Modal :title="modalTitle" v-model="userModalVisible" :mask-closable='false' :width="500" :styles="{top: '30px'}" @on-cancel="cancelUser">
            <Form ref="userForm" :model="userForm" :label-width="70" :rules="userFormValidate">
                <FormItem label="姓名" prop="username">
                    <Input v-model="userForm.username" :maxlength="15" autocomplete="off" />
                </FormItem>
                <FormItem label="密码" prop="password" v-if="modalType===0" :error="errorPass">
                    <Input type="password" v-model="userForm.password" autocomplete="off" :maxlength="20"/>
                </FormItem>
                <FormItem label="工号" prop="workNumber">
                    <Input v-model="userForm.workNumber" :maxlength="20"/>
                </FormItem>
                <FormItem label="E编码" prop="eCode">
                    <Input v-model="userForm.eCode" :maxlength="20"/>
                </FormItem>
                <!-- <FormItem label="所属公司" prop="companys">
                  <Select v-model="userForm.companys" multiple filterable v-if="modalType==0">
                      <Option v-for="item in companyList" :value="item.id" :key="item.id" :label="item.name">
                      </Option>
                  </Select>
                  <Select v-model="userForm.companys" multiple filterable v-if="modalType==1">
                      <Option v-for="item in allCompanys" :value="item.id" :key="item.id" :label="item.name">
                      </Option>
                  </Select>
                </FormItem> -->
                <FormItem label="角色分配" prop="roles">
                  <Select v-model="userForm.roles" multiple>
                      <Option v-for="item in roleList" :value="item.id" :key="item.id" :label="item.name">
                      </Option>
                  </Select>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" @click="cancelUser">取消</Button>
                <Button type="primary" :loading="submitLoading" @click="submitUser">提交</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
import {
  initDepartment,
  loadDepartment,
  getUserListData,
  getAllRoleList,
  getUnAssignCompany,
  addUser,
  editUser,
  enableUser,
  disableUser,
  deleteUser,
  getAllUserData,
  getAllCompany
} from "@/api/index";
import circleLoading from "../../my-components/circle-loading.vue";
export default {
  name: "user-manage",
  components: {
    circleLoading
  },
  data() {
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error("密码长度不得小于6位"));
      } else {
        callback();
      }
    };
    return {
      accessToken: {},
      loading: true,
      operationLoading: false,
      drop: false,
      dropDownContent: "展开",
      dropDownIcon: "ios-arrow-down",
      selectCount: 0,
      selectList: [],
      department: [],
      selectDep: [],
      dataDep: [],
      allCompanys:[],
      searchForm: {
        username: "",
        roleIds: "",
        status: "",
        pageNumber: 1,
        pageSize: 10,
        sort: "createTime",
        order: "desc",
        startDate: "",
        endDate: "",
        departmentTitle:"",
      },
      selectDate: null,
      modalType: 0,
      userModalVisible: false,
      modalTitle: "",
      userForm: {
        username: '',
        password: '',
        workNumber: "",
        roles: [],
        companys: [],
        departmentId: "",
        departmentTitle: "",
        eCode:""
      },
      userRoles: [],
      roleList: [],
      companyList: [],
      errorPass: "",
      userFormValidate: {
        username: [
          { required: true, message: "姓名不能为空", trigger: "blur" },
          {  max: 20, message: '最多输入20个字符', trigger: 'blur' }
        ],
        workNumber:[
          { required: true, message: "请输入工号", trigger: "blur" },
        ],
        password:[
            { required: true, message: "请输入密码", trigger: "blur" },
        ],
        eCode:[
          { required: true, message: "请输入E编码", trigger: "blur" },
        ]
      },
      submitLoading: false,
      columns: [
        {
          type: "selection",
          width: 60,
          align: "center",
          fixed: "left"
        },
        {
          type: "index",
          width: 60,
          align: "center",
          fixed: "left"
        },
        {
          title: "角色",
          key: "roleNames",
          width: 150
        },
        {
          title: "姓名",
          key: "username",
          width: 145,
        },
        {
          title: "工号",
          key: "workNumber",
          width: 120
        },
        {
          title: "E编码",
          key: "eCode",
          width: 120
        },
        {
          title: "创建时间",
          key: "createTime",
          sortable: true,
          sortType: "desc",
          minWidth: 120,
          render: (h, params) => {
            return h('div', params.row.createTime && new Date(params.row.createTime).format())
          }
        },
        {
          title: "操作",
          key: "action",
          width: 200,
          align: "center",
          fixed: "right",
          render: (h, params) => {
              return h("div", [
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
            // }
          }
        }
      ],
      data: [],
      exportData: [],
      total: 0,
      allCompanysTemp:[],
      renderEndDate:{
        disabledDate:(date)=>{
          if(date && this.searchForm.startDate) {
            return date.valueOf() < this.searchForm.startDate
          }
        }
      },
    };
  },
  methods: {
    init() {
      this.accessToken = {
        accessToken: this.getStore("accessToken")
      };
      this.initDepartmentData();
      this.getUserList();
      this.initDepartmentTreeData();
      this.initCompany();
    },
    initCompany() {
      getUnAssignCompany().then(res => {
        this.companyList = res.data;
      })
    },
    initDepartmentData() {
      initDepartment().then(res => {
        res.data.forEach(function(e) {
          e.title = e.name;
          e.isParent = e.parentId === '0';
          if (e.isParent) {
            e.loading = false;
            e.children = [];
          }
          if (e.status === -1) {
            e.title = "[已禁用] " + e.title;
            e.disabled = true;
          }
        });
        this.department = res.data;
      });
    },
    initDepartmentTreeData() {
      initDepartment().then(res => {
        res.data.forEach(function(e) {
          e.title = e.name;
          e.isParent = e.parentId === '0';
          if (e.isParent) {
            e.loading = false;
            e.children = [];
          }
          if (e.status === -1) {
            e.title = "[已禁用] " + e.title;
            e.disabled = true;
          }
        });
        this.dataDep = res.data;
      });
    },
    clearSelectDep() {
      this.userForm.departmentId = "";
      this.userForm.departmentTitle = "";
      this.$forceUpdate();
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getUserList();
      this.clearSelectAll();
    },
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.getUserList();
    },
    selectDateRange(v) {
      if (v) {
        this.searchForm.startDate = v[0];
        this.searchForm.endDate = v[1];
      }
    },
    getUserList() {
      console.log("ada",this.searchForm)
      // 多条件搜索用户列表
      this.loading = true;
      let params = {
        pageVo: {
          pageNumber: this.searchForm.pageNumber,
          pageSize: this.searchForm.pageSize
        },
        userVo: {
          username: this.searchForm.username,
          eCode:this.searchForm.eCode,
          roleids:this.searchForm.roleids
        },
        searchVo: {
          startDate: this.searchForm.startDate && new Date(this.searchForm.startDate).format("yyyy-MM-dd"),
          endDate: this.searchForm.endDate && new Date(this.searchForm.endDate).format('yyyy-MM-dd'),
        }
      }
      getUserListData(params).then(res => {
        this.loading = false;
        this.data = res.data.list;
        this.total = res.data.totalElements;
      });
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.getUserList();
    },
    handleReset() {
      this.$refs.searchForm.resetFields();
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.selectDate = null;
      this.searchForm.startDate = "";
      this.searchForm.endDate = "";
      this.selectDep = [];
      this.searchForm.departmentId = "";
      this.searchForm.departmentTitle = "";
      // 重新加载数据
      this.getUserList();
    },
    changeSort(e) {
      this.searchForm.sort = e.key;
      this.searchForm.order = e.order;
      if (e.order === "normal") {
        this.searchForm.order = "";
      }
      this.getUserList();
    },
    getRoleList() {
      getAllRoleList().then(res => {
        this.roleList = res.data;
      });
    },
    getAllCompanyFN() {
      getAllCompany().then(res => {
        for(let i=0;i<res.data.length;i++) {
          if(res.data[i].isAssign!=1) {
            this.allCompanys.push(res.data[i])
            // this.allCompanysTemp.push(res.data[i])
          }
        }
      })
    },
    handleDropdown(name) {
      if (name === "refresh") {
        this.getUserList();
      }
    },
    cancelUser() {
      this.userModalVisible = false;
    },
    submitUser() {
      this.$refs.userForm.validate(valid => {
        if (valid) {
          let params = {
            username: this.userForm.username,
            password: this.userForm.password,
            workNumber: this.userForm.workNumber,
            eCode:this.userForm.eCode,
            email: this.userForm.email,
            tel: this.userForm.tel,
            roleIds: this.userForm.roles.join(','),
            departmentIds: this.userForm.departmentId,
            // companyIds: this.userForm.companys.join(',')
          }
          if (this.modalType === 0) {
            // 添加用户 避免编辑后传入id
            delete this.userForm.id;
            delete this.userForm.status;
            if (
              this.userForm.password == "" ||
              this.userForm.password == undefined
            ) {
              this.errorPass = "密码不能为空";
              return;
            }
            if (this.userForm.password.length < 6) {
              this.errorPass = "密码长度不得少于6位";
              return;
            }
            this.submitLoading = true;
            addUser(params).then(res => {
              this.submitLoading = false;
              this.$Message.success("操作成功");
              this.getUserList();
              this.userModalVisible = false;
            }).catch(() => {
              this.submitLoading = false;
            });
          } else {
            params.id = this.userForm.id;
            // 编辑
            this.submitLoading = true;
            editUser(params).then(res => {
              this.submitLoading = false;
              this.$Message.success("操作成功");
              this.getUserList();
              this.userModalVisible = false;
            }).catch(() => {
              this.submitLoading = false;
            });
          }
        }
      });
    },
    viewPic() {
      this.viewImage = true;
    },
    add() {
      this.modalType = 0;
      this.modalTitle = "添加用户";
      this.$refs.userForm.resetFields();
      this.userModalVisible = true;
    },
    // edit(v) {
    //   const that=this
    //   getUnAssignCompany().then(res => {
    //     let tempA=[]
    //     for(let i=0;i<res.data.length;i++) {
    //         tempA.push(res.data[i])
    //     }
    //     this.tempUserObk = v
    //     this.modalType = 1;
    //     this.modalTitle = "编辑用户";
    //     this.allCompanys=tempA
    //
    //     let str = JSON.stringify(v);
    //     let userInfo = JSON.parse(str);
    //     userInfo.sex=userInfo.sex+""
    //     this.userForm = userInfo;
    //     let selectRolesId = [];
    //     this.userForm.roles && this.userForm.roles.forEach(function(e) {
    //       selectRolesId.push(e.id);
    //     });
    //     this.userForm.roles = selectRolesId;
    //     if (this.userForm.departments && this.userForm.departments.length > 0) {
    //       this.userForm.departmentId = this.userForm.departments[0].id;
    //       this.userForm.departmentTitle = this.userForm.departments[0].name;
    //     }
    //     // 选择的公司
    //     let selectCompanyIds = [];
    //     v.companys && v.companys.forEach(e => {
    //       selectCompanyIds.push(e.id);
    //     });
    //     if(v.companys) {
    //       this.allCompanys = this.allCompanys.concat(v.companys)
    //     }
    //     console.log("dasdasdasdasd",this.allCompanys)
    //     this.userForm.companys = selectCompanyIds;
    //     setTimeout(function(){
    //       that.userModalVisible = true;
    //     },1000)
    //   })
    // },
    edit(v) {
      this.tempUserObk = v
      this.modalType = 1;
      this.modalTitle = "编辑用户";

      let str = JSON.stringify(v);
      let userInfo = JSON.parse(str);
      // userInfo.sex=userInfo.sex+""
      this.userForm = userInfo;
      let selectRolesId = [];
      this.userForm.roles && this.userForm.roles.forEach(function(e) {
        selectRolesId.push(e.id);
      });
      this.userForm.roles = selectRolesId;
      if (this.userForm.departments && this.userForm.departments.length > 0) {
        this.userForm.departmentId = this.userForm.departments[0].id;
        this.userForm.departmentTitle = this.userForm.departments[0].name;
      }
      this.userModalVisible = true;
    },
    enable(v) {
      this.$Modal.confirm({
        title: "确认启用",
        content: "您确认要启用用户 " + v.username + " ?",
        onOk: () => {
          this.operationLoading = true;
          enableUser(v.id).then(res => {
            this.operationLoading = false;
            if (res.success === true) {
              this.$Message.success("操作成功");
              this.getUserList();
            }
          });
        }
      });
    },
    disable(v) {
      this.$Modal.confirm({
        title: "确认禁用",
        content: "您确认要禁用用户 " + v.username + " ?",
        onOk: () => {
          this.operationLoading = true;
          disableUser(v.id).then(res => {
            this.operationLoading = false;
            if (res.success === true) {
              this.$Message.success("操作成功");
              this.getUserList();
            }
          });
        }
      });
    },
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除用户 " + v.username + " ?",
        onOk: () => {
          this.operationLoading = true;
          deleteUser(v.id).then(res => {
            this.operationLoading = false;
            this.$Message.success("删除成功");
            this.getUserList();
          });
        }
      });
    },
    dropDown() {
      if (this.drop) {
        this.dropDownContent = "展开";
        this.dropDownIcon = "ios-arrow-down";
      } else {
        this.dropDownContent = "收起";
        this.dropDownIcon = "ios-arrow-up";
      }
      this.drop = !this.drop;
    },
    showSelect(e) {
      this.exportData = e;
      this.selectList = e;
      this.selectCount = e.length;
    },
    clearSelectAll() {
      this.$refs.table.selectAll(false);
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
          deleteUser(ids).then(res => {
            this.operationLoading = false;
            if (res.success === true) {
              this.$Message.success("删除成功");
              this.clearSelectAll();
              this.getUserList();
            }
          });
        }
      });
    }
  },
  mounted() {
    this.init();
    this.getRoleList();
  }
};
</script>
