<template>
  <div class="search">
    <Row>
      <Col>
      <Card>
        <Form inline :label-width="90" class="search-form">
          <Form-item label="表单类别" prop="formType">
            <Select v-model="formType" filterable style="width: 200px" label-in-value>
              <Option v-for="item in formTypes" :value="item.value" :key="item.value" :label="item.name">
              </Option>
            </Select>
          </Form-item>
          <Form-item label="税款类别" prop="taxType">
            <Select v-model="taxType" filterable style="width: 200px" label-in-value>
              <Option v-for="item in taxTypes" :value="item.value" :key="item.value" :label="item.name">
              </Option>
            </Select>
          </Form-item>
          <Form-item label="公司名称" prop="companyName">
            <Select v-model="companyName" filterable style="width: 200px" label-in-value>
              <Option v-for="item in companyList" :value="item.name" :key="item.id" :label="item.name">
              </Option>
            </Select>
          </Form-item>
          <Form-item label="所属期间">
            <DatePicker type="daterange" v-model="selectDate" format="yyyy-MM" clearable @on-change="selectDateRange" placeholder="选择起始时间" style="width: 200px"></DatePicker>
          </Form-item>
          <Form-item label="实缴期间">
            <DatePicker type="daterange" v-model="selectDate1" format="yyyy-MM" clearable @on-change="selectDateRange1" placeholder="选择起始时间" style="width: 200px"></DatePicker>
          </Form-item>
          <Form-item style="margin-left:-35px;" class="br">
            <Button @click="initPageData" type="primary" icon="ios-search">搜索</Button>
            <Button @click="handleReset" >重置</Button>
          </Form-item>
        </Form>
    <Row>
      <Table :loading="loading" border :columns="columns" :data="data" ref="table" sortable="custom" ></Table>
    </Row>
    <!-- <Row type="flex" justify="end" class="page">
      <Page :current="pageNumber" :total="total" :page-size="pageSize" @on-change="changePage" @on-page-size-change="changePageSize" :page-size-opts="[10,20,50]" size="small" show-total show-elevator show-sizer></Page>
    </Row> -->
    </Card>
    </Col>
    </Row>
  </div>
</template>

<script>
import { getStatistics, getAllCompany, getDictListDataByType } from '@/api/index.js'
import { dictType } from '@/libs/constance.js'
export default {
  name: 'statistics',
  data() {
    return {
      loading: false,
      columns: [],
      columnsList: [
        {
          type: "index",
          width: 60,
          title: '序号',
          align: "center"
        },
        {
          title: '国家',
          key: "countryName",
          width: 80,
          align: "center"
        },
        {
          title: '公司名称',
          key: "companyName",
          width: 160
        },
        {
          title: '币种',
          key: "currency",
          width: 80,
          align: "center"
        },
        {
          title: '所属期间',
          key: "taxPeriod",
          width: 110,
          align: "center"
        },
        {
          title: '实缴时间',
          key: "paymentTime",
          width: 110,
          align: "center",
          render: (h, params) => {
            return h('div', params.row.paymentTime && new Date(params.row.paymentTime).format())
          }
        },
        /* {
          title: '应缴税额',
          key: 'payableTax',
          width: 80,
          align: "center"
        },
        {
          title: '应缴滞纳金',
          key: 'lateFeePayable',
          width: 80,
          align: "center"
        },
        {
          title: '申请缴纳税款',
          key: 'applTaxPayment',
          width: 80,
          align: "center"
        },
        {
          title: '实缴税额',
          key: 'taxPaid',
          width: 80,
          align: "center"
        },
        {
          title: '实缴滞纳金',
          key: 'overduePayment',
          width: 80,
          align: "center"
        },
        {
          title: '实缴总额',
          width: 80,
          align: "center",
          render: (h, params) => {
            return h('div', parseFloat(params.row.taxPaid) + parseFloat(params.row.overduePayment))
          }
        }, */
        {
          title: '税种',
          key: 'taxDict',
          width: 80,
          align: "center",
          render: (h, params) => {
            return h('div', this.taxCategorys[params.row.taxDict] && this.taxCategorys[params.row.taxDict].name)
          },
          filters: [],
          // filterMultiple: false,
          filterMethod (value, row) {
            return row.taxDict === value;
          }
        }
      ],
      data: [],
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      selectDate: '',
      startTaxPeriod: '',
      endTaxPeriod: '',
      selectDate1: '',
      startTime: "",
      endTime: "",
      companyName: '',
      currency: '',
      materialTypeDict: '',
      companyList: [],
      formType: 'payableTax',
      formTypes: [{
        name: '应缴税额',
        value: 'payableTax'
      }, {
        name: '实缴税额',
        value: 'taxPaid'
      }],
      taxType: 'applTaxPayment',
      taxTypes: [{
        name: '总额',
        value: 'applTaxPayment'
      },{
        name: '税额',
        value: 'payableTax'
      }, {
        name: '滞纳金',
        value: 'lateFeePayable'
      }],
      taxCategorys: {}
    }
  },
  methods: {
    init() {
      this.getDictData();
      this.initCompanyList();
      this.initPageData();
      this.columns = this.columnsList;
    },
    initPageData() {
      this.loading = true;
      let params = {
        companyName: this.companyName,
        currency: this.currency,
        startTime: this.startTime,
        endTime: this.endTime,
        startTaxPeriod: this.startTaxPeriod,
        endTaxPeriod: this.endTaxPeriod
      }
      let columnsFilter = {
        payableTax: {
          applTaxPayment: {
            title: '申请缴纳税款',
            key: 'applTaxPayment',
            align: "center"
          },
          payableTax: {
            title: '应缴税额',
            key: 'payableTax',
            align: "center"
          },
          lateFeePayable: {
            title: '应缴滞纳金',
            key: 'lateFeePayable',
            align: "center"
          }
        },
        taxPaid: {
          applTaxPayment: {
            title: '实缴总额',
            align: "center",
            render: (h, params) => {
              return h('div', parseFloat(params.row.taxPaid) + parseFloat(params.row.overduePayment))
            }
          },
          payableTax: {
            title: '实缴税额',
            key: 'taxPaid',
            align: "center"
          },
          lateFeePayable: {
            title: '实缴滞纳金',
            key: 'overduePayment',
            align: "center"
          }
        }
      }
      // this.columns = this.companyList.splice(6, 0, columnsFilter[this.formType][this.taxType]);
      this.columns = this.columnsList.splice(6, 0, columnsFilter[this.formType][this.taxType]);
      getStatistics(params).then(res => {
        this.total = res.data.totalElements;
        this.data = res.data;
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
    /* 获取字典信息 */
    getDictData() {
      getDictListDataByType(dictType.taxCategory)
        .then(res => {
          let temp = {};
          this.columns[this.columns.length - 1].filters = res.data.map(item => {
            temp[item.code] = item
            return {
              label: item.name,
              value: item.code
            }
          })
          this.taxCategorys = temp;
        });
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
        this.startTaxPeriod = v[0];
        this.endTaxPeriod = v[1];
      }
    },
    selectDateRange1(v) {
      if (v) {
        this.startTime = v[0];
        this.endTime = v[1];
      }
    },
    handleReset() {
      this.pageNumber = 1;
      this.pageSize = 10;
      this.selectDate = null;
      this.startTime = "";
      this.endTime = "";
      this.company = '';
      this.materialTypeDict = '';
      // 重新加载数据
      this.initPageData();
    }
  },
  mounted() {
    this.init();
  }
}
</script>
