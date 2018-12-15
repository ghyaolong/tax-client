<style lang="less">
.vertical-center-modal{
  display: flex;
  align-items: center;
  justify-content: center;

  .ivu-modal{
    top: 0;
  }
}
</style>

<template>
  <div class="search">
    <Row>
      <Col>
      <Card>
        <Form inline :label-width="90" class="search-form">
          <Form-item label="创建时间">
            <DatePicker type="daterange" v-model="selectDate" format="yyyy-MM-dd" clearable @on-change="selectDateRange" placeholder="选择起始时间" style="width: 200px"></DatePicker>
          </Form-item>
          <Form-item style="margin-left:-35px;" class="br">
            <Button @click="initPageData" type="primary" icon="ios-search">搜索</Button>
          </Form-item>
        </Form>
    <Row>
      <Table :loading="loading" border :columns="columns" :data="data" ref="table" sortable="custom" ></Table>
    </Row>
    <Row type="flex" justify="end" class="page">
      <Page :current="pageNumber" :total="total" :page-size="pageSize" @on-change="changePage" @on-page-size-change="changePageSize" :page-size-opts="[10,20,50]" size="small" show-total show-elevator show-sizer></Page>
    </Row>
    </Card>
    </Col>
    </Row>
    <Modal 
      v-model="handelModal" 
      title="请处理" 
      class-name="vertical-center-modal"
      @on-ok="submit"
      width="400">
      <Row v-if="form.choice">
        <Col span="12" style="text-align: center;"><Button type="success" @click="handleOk">同意</Button></Col>
        <Col span="12" style="text-align: center;"><Button type="error" @click="handleRefuse">拒绝</Button></Col>
      </Row>
      <Form>
        <FormItem label="操作" :label-width="80">
          <Select v-model="form.handle">
            <Option value="agree" >同意</Option>
            <Option value="refuse" >拒绝</Option>
          </Select>
        </FormItem>
        <FormItem label="拒绝原因" v-if="form.handle === 'refuse'" :label-width="80">
          <Input type="textarea" v-model="form.refuseReason" placeholder="请输入拒绝原因"></Input>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
import { taxReadyHandle } from '@/api/index.js'
export default {
  name: 'taxReadyHandle',
  data() {
    return {
      loading: false,
      handelModal: false,
      form: {
        id: '',
        handle: 'agree',
        refuseReason: ''
      },
      columns: [
        {
          type: "index",
          width: 80,
          title: '序号',
          align: "center",
          fixed: "left"
        },
        {
          title: '流水号',
          key: "id",
          // width: 110
        },
        {
          title: '公司名称',
          key: "companyName",
          width: 110
        },
        {
          title: '保存时间',
          key: "saveTime",
          render: (h, params) => {
            return h('div', params.row.saveTime && new Date(params.row.saveTime).format())
          }
          // width: 110
        },
        {
          title: '操作',
          width: 130,
          align: "center",
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
                        this.handle(params.row);
                      }
                    }
                  },
                  "处理"
                )
              ]);
          }
        }
      ],
      data: [],
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      selectDate: '',
      startDate: "",
      endDate: ""
    }
  },
  methods: {
    init() {
      this.initPageData();
    },
    initPageData() {
      this.loading = true;
      let params = {
        pageVo: {
          pageNumber: this.pageNumber,
          pageSize: this.pageSize
        },
        searchVo: {
          startDate: this.startDate,
          endDate: this.endDate
        }
      }
      taxReadyHandle(params).then(res => {
        this.total = res.data.totalElements;
        this.data = res.data.list;
      }).finally(() => {
        this.loading = false;
      })
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
    selectDateRange(v) {
      if (v) {
        this.startDate = v[0];
        this.endDate = v[1];
      }
    },
    /* 处理申请 */
    handle(v) {
      this.form.id = v.id;
      this.handelModal = true;
    },
    submit() {}
  },
  mounted() {
    this.init();
  }
}
</script>
