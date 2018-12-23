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
  </div>
</template>

<script>
import { taxReadyCommit, taxDel } from '@/api/index.js'
export default {
  name: 'taxReadyCommit',
  data() {
    return {
      loading: false,
      columns: [
        {
          type: "index",
          width: 80,
          title: '序号',
          align: "center",
          fixed: "left"
        },
        // {
        //   title: '流水号',
        //   key: "id",
        //   // width: 110
        // },
        {
          title: '公司名称',
          key: "companyName",
          // width: 110
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
      taxReadyCommit(params).then(res => {
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
    edit(v) {
      // this.$router.push({name: 'taxApplicationEdit', params: {type: 'readyCommit', params: v}});
      this.$store.commit('closePage', 'taxApplication')
      this.$router.push({name: 'taxApplication', params: {type: 'readyCommit', params: v}});
    },
    remove(v) {
      this.loading = true;
      taxDel(v.id).then(res => {
        this.initPageData()
        this.$Message.success('操作成功')
      }).finally(() => {
        this.loading = false;
      })
    }
  },
  mounted() {
    this.init();
  }
}
</script>
