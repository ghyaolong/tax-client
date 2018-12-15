<template>
  <div class="search">
    <Row>
      <Col>
      <Card>
        <Form inline :label-width="90" class="search-form">
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
        </Form>
    <Row>
      <Table :loading="loading" border :columns="columns" :data="data" ref="table" sortable="custom" ></Table>
    </Row>
    <Row type="flex" justify="end" class="page">
      <Page :current="pageNumber" :total="total" :page-size="pageSize" @on-change="changePage" @on-page-size-change="changePageSize" :page-size-opts="[10,20,50]" size="small" show-total show-elevator show-sizer></Page>
    </Row>
    <Modal
        v-model="priviewModal"
        :title="fileName"
        class-name="preview-modal"
        width="700"
        footer-hide>
        <iframe style="width: 100%; height: 600px;" :src="filePath" frameborder="0"></iframe>
    </Modal>
    <a :href="downloadPath" :download="fileName" id="download"></a>
    </Card>
    </Col>
    </Row>
  </div>
</template>

<script>
import { getFilesList, getAllCompany } from '@/api/index.js'
export default {
  name: 'fileManage',
  data() {
    return {
      loading: false,
      priviewModal: false,
      fileName: '',
      materialTypeDicts: {
        'FINANCE_REPORT': '财务报表',
        'TAX_REPORT': '税务申报表',
        'DONE_TAX_REPORT': '完税申报表',
        'OTHER': '其他报表'
      },
      columns: [
        {
          type: "index",
          width: 80,
          title: '序号',
          align: "center"
        },
        {
          title: '公司名称',
          key: "companyName",
          width: 110
        },
        {
          title: '上传时间',
          key: "createTime",
          // width: 110
        },
        {
          title: '文件名称',
          key: 'fileName'
        },
        {
          title: '文件类型',
          key: 'materialTypeDict',
          render: (h, params) => {
            return h('div', this.materialTypeDicts[params.row[params.column.key]])
          }
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
                        this.priviewFile(params.row)
                      }
                    }
                  },
                  "预览"
                ),
                h(
                  "Button",
                  {
                    props: {
                      type: "warning",
                      size: "small"
                    },
                    on: {
                      click: () => {
                        this.downloadFile(params.row);
                      }
                    }
                  },
                  "下载"
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
      endDate: "",
      company: '',
      materialTypeDict: '',
      companyList: []
    }
  },
  computed: {
    filePath() {
      return this.fileName ? `/api/file/${this.fileName}` : '';
    },
    downloadPath() {
      return this.fileName ? `/api/file/download/${this.fileName}` : '';
    }
  },
  methods: {
    init() {
      this.initPageData();
      this.initCompanyList();
    },
    initPageData() {
      this.loading = true;
      let params = {
        pageVo: {
          pageNumber: this.pageNumber,
          pageSize: this.pageSize
        },
        companyName: this.company,
        materialTypeDict: this.materialTypeDict,
        searchVo: {
          startDate: this.startDate,
          endDate: this.endDate
        }
      }
      getFilesList(params).then(res => {
        this.total = res.data.totalElements;
        this.data = res.data.list;
      }).finally(() => {
        this.loading = false;
      })
    },
    /* 获取公司列表 */
    initCompanyList() {
      getAllCompany()
        .then(res => {
          this.companyList = res.data;
        })
    },
    clearSelectAll() {
      this.$refs.table.selectAll(false)
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
    handleReset() {
      this.pageNumber = 1;
      this.pageSize = 10;
      this.selectDate = null;
      this.startDate = "";
      this.endDate = "";
      this.company = '';
      this.materialTypeDict = '';
      // 重新加载数据
      this.initPageData();
    },
    priviewFile(v) {
      this.fileName = v.fileName;
      this.priviewModal = true;
    },
    downloadFile(v) {
      this.fileName = v.fileName;
      this.$nextTick(() => {
        document.getElementById('download').click();
      })
    }
  },
  mounted() {
    this.init();
  }
}
</script>

<style>
.preview-modal .ivu-modal-body {
  padding: 0;
}
</style>
