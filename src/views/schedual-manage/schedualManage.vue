<template>
  <div class="search">
    <Row>
      <Col>
      <Card>
        <Row class="operation" slot="title">
        <Button @click="addForm" type="primary" icon="md-add">添加</Button>
        <Button @click="editForm" icon="md-create" :disabled="disabled01">编辑</Button>
        </Row>
        <!-- <Form inline :label-width="90" class="search-form">
          <Form-item label="公司名称" prop="company">
            <Select v-model="company" filterable style="width: 200px" label-in-value>
              <Option v-for="item in companyList" :value="item.name" :key="item.id" :label="item.name">
              </Option>
            </Select>
          </Form-item>
          <Form-item label="资料类型" prop="materialTypeDict">
            <Select v-model="materialTypeDict" filterable style="width: 200px" label-in-value>
              <Option v-for="item, index in materialTypeDicts" :value="index" :key="index" :label="item"></Option>
            </Select>
          </Form-item>
          <Form-item label="创建时间">
            <DatePicker type="daterange" v-model="selectDate" format="yyyy-MM-dd" clearable @on-change="selectDateRange" placeholder="选择起始时间" style="width: 200px"></DatePicker>
          </Form-item>
          <Form-item style="margin-left:-35px;" class="br">
            <Button @click="initPageData" type="primary" icon="ios-search">搜索</Button>
            <Button @click="handleReset" >重置</Button>
          </Form-item>
        </Form> -->
    <Row>
      <Table highlight-row @on-current-change="currentChange" :loading="loading" border :columns="columns"
      :data="data" ref="table" sortable="custom" ></Table>
    </Row>
    <Row type="flex" justify="end" class="page">
      <Page :current="pageNumber" :total="total" :page-size="pageSize" @on-change="changePage" @on-page-size-change="changePageSize" :page-size-opts="[10,20,50]" size="small" show-total show-elevator show-sizer></Page>
    </Row>
    </Card>
    </Col>
    </Row>
    <Modal :title="modalTitle" :mask-closable='false' v-model="showModal" >
                <Form
                    ref="formCustom"
                    :model="formCustom"
                    :label-width="100"
                    label-position="right"
                    :rules="ruleCustom"
                    style="width:450px"
                >
                    <FormItem label="调度类名称" prop="jobClassName">
                        <Input  v-model="formCustom.jobClassName" placeholder="请输入调度类名称" :maxlength="20"/>
                    </FormItem>
                    <FormItem label="备注" prop="description">
                        <Input  v-model="formCustom.description" placeholder="请输入备注" :maxlength="40"/>
                    </FormItem>
                    <FormItem label="corn表达式" prop="cronExpression">
                        <Input  v-model="formCustom.cronExpression" placeholder="请输入corn表达式" :maxlength="20"/>
                    </FormItem>
                    <!-- <FormItem label="状态" prop="status">
                      <i-switch size="large" v-model="addStatus" @on-change="changeEditSwitch">
                        <span slot="open">启用</span>
                        <span slot="close">禁用</span>
                      </i-switch>
                    </FormItem> -->
                </Form>
                <div slot="footer">
                <Button type="text" @click="handleReset">取消</Button>
                <Button type="primary" :loading="savePassLoading" @click="handleSubmit">提交</Button>
            </div>
    </Modal>
  </div>
</template>

<script>
import {
  addSchedualList,
  editSchedualList,
  getSchedualList,
  schedualPause,
  schedualResume,
  schedualDel
} from "@/api/index.js";
export default {
  name: "schedualManage",
  data() {
    return {
      disabled01:true,
      addStatus: true,
      modalType: 0,
      modalTitle: "",
      showModal: false,
      savePassLoading: false,
      formCustom: {
        cronExpression: "",
        jobClassName: "",
        description: "",
        status: 0
      },
      ruleCustom: {
        jobClassName: [
          { required: true, message: "调度类名称不能为空", trigger: "blur" }
        ],
        description: [
          { required: true, message: "备注不能为空", trigger: "blur" }
        ],
        cronExpression: [
          { required: true, message: "corn表达式不能为空", trigger: "blur" }
        ]
      },
      loading: false,
      columns: [
        {
          type: "index",
          width: 80,
          title: "序号",
          align: "center",
          fixed: "left"
        },
        {
          title: "任务类名",
          key: "jobClassName",
          sortable: true,
          width: 200,
          fixed: "left"
        },
        {
          title: "cron表达式",
          key: "cronExpression",
          sortable: true,
          width: 200
        },
        {
          title: "参数",
          key: "parameter",
          sortable: true,
          width: 200
        },
        {
          title: "备注",
          key: "description",
          sortable: true,
          width: 180
        },
        {
          title: "创建人",
          key: "createBy",
          width: 110
        },
        {
          title: "创建时间",
          key: "createTime",
          width: 110,
          render: (h, params) => {
            return h('div', params.row.createTime && new Date(params.row.createTime).format())
          }
        },
        {
          title: "修改人",
          key: "updateBy",
          width: 110
        },
        {
          title: "修改时间",
          key: "updateTime",
          width: 110,
          render: (h, params) => {
            return h('div', params.row.updateTime && new Date(params.row.updateTime).format())
          }
        },
        {
          title: "状态",
          key: "status",
          align: "center",
          width: 120,
          fixed: "right",
          render: (h, params) => {
            let re = "";
            if (params.row.status === 0) {
              return h("div", [
                h(
                  "Tag",
                  {
                    props: {
                      type: "dot",
                      color: "success"
                    }
                  },
                  "执行中"
                )
              ]);
            } else if (params.row.status === -1) {
              return h("div", [
                h(
                  "Tag",
                  {
                    props: {
                      type: "dot",
                      color: "error"
                    }
                  },
                  "已停止"
                )
              ]);
            }
          },
          filters: [
            {
              label: "执行中",
              value: 0
            },
            {
              label: "已停止",
              value: -1
            }
          ],
          filterMultiple: false,
          filterMethod(value, row) {
            if (value === 0) {
              return row.status === 0;
            } else if (value === -1) {
              return row.status === -1;
            }
          }
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          width: 200,
          fixed: "right",
          render: (h, params) => {
            if (params.row.status === 0) {
              return h("div", [
                h(
                  "Button",
                  {
                    props: {
                      type: "warning",
                      size: "small",
                      icon: "md-pause"
                    },
                    style: {
                      marginRight: "5px"
                    },
                    on: {
                      click: () => {
                        this.pause(params.row);
                      }
                    }
                  },
                  "暂停"
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
            } else {
              return h("div", [
                h(
                  "Button",
                  {
                    props: {
                      type: "info",
                      size: "small",
                      icon: "md-play"
                    },
                    style: {
                      marginRight: "5px"
                    },
                    on: {
                      click: () => {
                        this.resume(params.row);
                      }
                    }
                  },
                  "恢复执行"
                ),
                //  h(
                //   "Button",
                //   {
                //     props: {
                //       type: "primary",
                //       size: "small"
                //     },
                //     style: {
                //       marginRight: "5px"
                //     },
                //     on: {
                //       click: () => {
                //         this.edit(params.row);
                //       }
                //     }
                //   },
                //   "编辑"
                // ),
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
        }
      ],
      data: [],
      pageNumber: 1,
      pageSize: 10,
      total: 0
    };
  },
  methods: {
    currentChange(currentRow){
      if (currentRow) {
        this.disabled01 = false
      }else {
        this.disabled01 = true
      }
      this.formCustom = currentRow;
      if (currentRow.status == -1) {
        this.addStatus = false
      }else if(currentRow.status == 0){
        this.addStatus = true
      }
    },
    changeEditSwitch(v) {
      if (v) {
        this.formCustom.status = 0;
      } else {
        this.formCustom.status = -1;
      }
    },
    addForm() {
      this.modalType = 0;
      this.modalTitle = "添加调度管理";
      this.$refs.formCustom.resetFields();
      this.showModal = true;
    },
    editForm() {
      this.modalType = 1;
      this.modalTitle = "编辑调度管理";
      // this.$refs.userForm.resetFields();
      this.showModal = true;
    },
    handleSubmit() {
      let vm = this;
      let params = vm.formCustom;
      this.$refs["formCustom"].validate(valid => {
        if (valid) {
          this.savePassLoading = true;
          if (this.modalType === 0) {
            // 添加用户
          addSchedualList(params).then(res => {
            if (res.data.status === '0') {
               this.savePassLoading = false;
                this.$Message.success("操作成功");
                this.showModal = false;
                this.initPageData();
            }
          }).catch(() => {
              this.savePassLoading = false;
            });;
          }else {
            //编辑
            editSchedualList(params).then(res => {
              if (res.status == '0') {
                  this.savePassLoading = false;
                  this.$Message.success(res.data);
                  this.showModal = false;
                  this.initPageData();
              }
          }).catch(() => {
              this.savePassLoading = false;
            });;
          }
        }
      });
    },
    handleReset() {
      this.showModal = false;
    },
    init() {
      this.initPageData();
    },
    initPageData() {
      this.loading = true;
      let params = {
        pageNumber: this.pageNumber,
        pageSize: this.pageSize
      };
      getSchedualList(params)
        .then(res => {
          this.total = res.data.totalElements;
          this.data = res.data.list;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    changePage(v) {
      this.pageNumber = v;
      this.initPageData();
      this.clearSelectAll();
    },
    changePageSize(v) {
      this.pageSize = v;
      this.initPageData();
    },
    pause(v) {
      this.$Modal.confirm({
        title: "确认停止",
        content: "您确认要停止任务 " + v.jobClassName + " ?",
        onOk: () => {
          this.loading = true;
          schedualPause(v)
            .then(res => {
              this.$Message.success("操作成功");
              this.initPageData();
            })
            .finally(() => {
              this.loading = false;
            });
        }
      });
    },
    resume(v) {
      this.$Modal.confirm({
        title: "确认恢复",
        content: "您确认要恢复任务 " + v.jobClassName + " ?",
        onOk: () => {
          this.loading = true;
          schedualResume(v)
            .then(res => {
              this.$Message.success("操作成功");
              this.initPageData();
            })
            .finally(() => {
              this.loading = false;
            });
        }
      });
    },
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除任务 " + v.jobClassName + " ?",
        onOk: () => {
          this.loading = true;
          schedualDel(v.id)
            .then(res => {
              this.$Message.success("操作成功");
              this.initPageData();
            })
            .finally(() => {
              this.loading = false;
            });
        }
      });
    }
  },
  mounted() {
    this.init();
  }
};
</script>
<style lang="less" scoped>

</style>
