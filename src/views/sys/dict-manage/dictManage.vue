<style lang="less">
@import './dictManage.less';
</style>
<template>
  <div class="search">
    <Row>
      <Col>
      <Card>
        <Row>
          <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
            <Form-item label="字典名称" prop="name">
              <Input type="text" v-model="searchForm.name" clearable placeholder="请输入字典名称" style="width: 200px" :maxlength="20"/>
            </Form-item>
            <Form-item label="字典编码" prop="code">
              <Input type="text" v-model="searchForm.code" clearable placeholder="请输入字典编码" style="width: 200px" :maxlength="20"/>
            </Form-item>
            <Form-item label="类型" prop="type">
              <Select v-model="searchForm.type" style="width:200px">
                <Option v-for="item in typeIds" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
            </Form-item>
            <Form-item style="margin-left:-35px;" class="br">
              <Button @click="handleSearch" type="primary" icon="ios-search">搜索</Button>
              <Button @click="handleReset">重置</Button>
            </Form-item>
          </Form>
        </Row>
        <Row class="operation">
          <Button @click="addDict" type="primary" icon="md-add">新增字典</Button>
          <!-- <Button @click="delAll" icon="md-trash">批量删除</Button> -->
          <Button @click="init" icon="md-refresh">刷新</Button>
          <circleLoading v-if="operationLoading" />
        </Row>
        <!-- <Row>
                        <Alert show-icon>
                            已选择 <span class="select-count">{{selectCount}}</span> 项
                            <a class="select-clear" @click="clearSelectAll">清空</a>
                        </Alert>
                    </Row> -->
        <Row>
          <Table :loading="loading" border :columns="columns" :data="data" ref="table" sortable="custom" @on-sort-change="changeSort" @on-selection-change="changeSelect"></Table>
        </Row>
        <Row type="flex" justify="end" class="page">
          <Page :current="searchForm.pageNumber" :total="total" :page-size="searchForm.pageSize" @on-change="changePage" @on-page-size-change="changePageSize" :page-size-opts="[10,20,50]" size="small" show-total show-elevator show-sizer></Page>
        </Row>
      </Card>
      </Col>
    </Row>
    <Modal :title="modalTitle" v-model="modalVisible" :mask-closable='false' :width="500">
      <Form ref="form" :model="form" :label-width="120" :rules="formValidate">
        <FormItem label="字典名称" prop="name">
          <Input v-model="form.name" placeholder="请输入字典名称" clearable :maxlength="20"/>
        </FormItem>
        <FormItem label="字典代码" prop="code">
          <Input v-model="form.code" clearable :maxlength="20"/>
        </FormItem>
        <FormItem label="字典类型" prop="type">
          <Select v-model="form.type" style="width:200px">
                <Option v-for="item in typeIds" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </FormItem>
        <FormItem label="备注" prop="remarks">
          <Input v-model="form.remarks" :maxlength="40"/>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="cancelSubmit">取消</Button>
        <Button type="primary" :loading="submitLoading" @click="handleSubmit">提交</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import { getDictListData, addDict, editDict, deleteDict, getDictListDataByType } from '@/api/index'
import circleLoading from '../../my-components/circle-loading.vue'
export default {
  name: 'dict-manage',
  components: {
    circleLoading
  },
  data() {
    return {
      loading: true,
      operationLoading: false,
      sortColumn: 'createTime',
      sortType: 'desc',
      modalType: 0,
      modalVisible: false,
      modalTitle: '',
      typeIds: [{
        value: "0",
        label: '国家'
      }, {
        value: '1',
        label: '币种'
      }, {
        value: '2',
        label: '税种'
      }, {
        value: '3',
        label: '纳税期限表'
      }],
      searchForm: {
        name: '',
        code: '',
        type: '',
        pageNumber: 1,
        pageSize: 10
      },
      form: {
        name: '',
        code: '',
        type: '',
        remarks: ''
      },
      formValidate: {
        name: [
          { required: true, message: '字典名称不能为空', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '字典代码不能为空', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '字典类型不能为空', trigger: 'blur' }
        ]
      },
      submitLoading: false,
      selectList: [],
      selectCount: 0,
      columns: [
        /* {
          type: 'selection',
          width: 60,
          align: 'center'
        }, */
        {
          type: 'index',
          width: 60,
          align: 'center'
        },
        {
          title: '字典名称',
          key: 'name',
          width: 200
        },
        {
          title: '字典代码',
          key: 'code',
          width: 140
        },
        {
          title: '字典类型',
          key: 'type',
          sortable: true,
          render: (h, params) => {
            return h('div', (() => {
              for (let i = 0; i < this.typeIds.length; i++) {
                let item = this.typeIds[i];
                if (item.value == params.row.type) {
                  return item.label
                }
              }
              return '';
            })())
          }
        },
        {
          title: '备注',
          key: 'remarks'
        },
        {
          title: '操作',
          key: 'action',
          align: 'center',
          width: 160,
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.edit(params.row)
                    }
                  }
                },
                '编辑'
              ),
              h(
                'Button',
                {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.remove(params.row)
                    }
                  }
                },
                '删除'
              )
            ])
          }
        }
      ],
      data: [],
      total: 0
    }
  },
  methods: {
    init() {
      this.getDictList()
    },
    changePage(v) {
      this.searchForm.pageNumber = v
      this.getDictList()
      this.clearSelectAll()
    },
    changePageSize(v) {
      this.searchForm.pageSize = v
      this.getDictList()
    },
    changeSort(e) {
      this.sortColumn = e.key
      this.sortType = e.order
      if (e.order === 'normal') {
        this.sortType = ''
      }
      this.getDictList()
    },
    getDictList() {
      this.loading = true
      // if (this.searchForm.type) {
      //   getDictListDataByType(this.searchForm.type)
      //     .then(res => {
      //       this.loading = false
      //       this.data = res.data
      //       this.total = res.data.length
      //     })
      //     .catch(() => {
      //       this.loading = false
      //     })
      //   return;
      // }
      let params = {
        pageVo: {
          pageNumber: this.searchForm.pageNumber,
          pageSize: this.searchForm.pageSize
        },
        dictVo: {
          name: this.searchForm.name,
          code: this.searchForm.code,
          type: this.searchForm.type
        }
      }
      getDictListData(params)
        .then(res => {
          this.loading = false
          this.data = res.data.list
          this.total = res.data.totalElements
        })
        .catch(() => {
          this.loading = false
        })
    },
    cancelSubmit() {
      this.modalVisible = false
    },
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.modalType === 0) {
            // 添加
            this.submitLoading = true
            addDict(this.form)
              .then(res => {
                this.submitLoading = false
                this.$Message.success('操作成功')
                this.getDictList()
                this.modalVisible = false
              })
              .catch(() => {
                this.submitLoading = false
              })
          } else {
            this.submitLoading = true
            editDict(this.form)
              .then(res => {
                this.submitLoading = false
                this.$Message.success('操作成功')
                this.getDictList()
                this.modalVisible = false
              })
              .catch(() => {
                this.submitLoading = false
              })
          }
        }else{
          console.log("dadada",this.form)
        }
      })
    },
    addDict() {
      this.modalType = 0
      this.modalTitle = '添加字典'
      this.$refs.form.resetFields()
      ;(this.form = {
        name: '',
        code: '',
        type: '',
        remarks: ''
      }),
        (this.modalVisible = true)
    },
    edit(v) {
      this.modalType = 1
      this.modalTitle = '编辑字典'
      //转换null为""
      for (let attr in v) {
        if (v[attr] === null) {
          v[attr] = ''
        }
      }
      let str = JSON.stringify(v)
      let data = JSON.parse(str)
      data.type=data.type.toString()
      this.form = data
      console.log('dadad',data)
      this.modalVisible = true
    },
    remove(v) {
      this.$Modal.confirm({
        title: '确认删除',
        content: '您确认要删除字典 ' + v.name + ' ?',
        onOk: () => {
          this.operationLoading = true
          deleteDict(v.id)
            .then(res => {
              this.operationLoading = false
              this.$Message.success('操作成功')
              this.getDictList()
            })
            .catch(() => {
              this.operationLoading = false
            })
        }
      })
    },
    clearSelectAll() {
      this.$refs.table.selectAll(false)
    },
    changeSelect(e) {
      this.selectList = e
      this.selectCount = e.length
    },
    delAll() {
      if (this.selectCount <= 0) {
        this.$Message.warning('您还未选择要删除的数据')
        return
      }
      this.$Modal.confirm({
        title: '确认删除',
        content: '您确认要删除所选的 ' + this.selectCount + ' 条数据?',
        onOk: () => {
          let ids = ''
          this.selectList.forEach(function(e) {
            ids += e.id + ','
          })
          ids = ids.substring(0, ids.length - 1)
          this.operationLoading = true
          deleteQuartz(ids).then(res => {
            this.operationLoading = false
            if (res.success === true) {
              this.$Message.success('删除成功')
              this.clearSelectAll()
              this.getDictList()
            }
          })
        }
      })
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.getDictList();
    },
    handleReset() {
      this.$refs.searchForm.resetFields();
      this.searchForm = {
        name: '',
        code: '',
        type: '',
        pageNumber: 1,
        pageSize: 10
      }
      // 重新加载数据
      this.getDictList();
    },
  },
  mounted() {
    this.init()
  }
}
</script>
