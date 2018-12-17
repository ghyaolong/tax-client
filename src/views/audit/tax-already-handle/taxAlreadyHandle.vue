<template>
  <div class="search">
    <Row>
      <Col>
      <Card>
        <Form inline :label-width="90" class="search-form" :model="submitData" ref="taxAlreadyHandleForm">
          <Form-item label="创建时间" prop="selectDate">
            <DatePicker type="daterange" v-model="submitData.selectDate" format="yyyy-MM-dd" clearable @on-change="selectDateRange" placeholder="选择起始时间" style="width: 200px"></DatePicker>
          </Form-item>
          <Form-item label="公司名称" prop="companyName">
            <Input  placeholder="请输入公司名称" v-model="submitData.companyName"></Input>
          </Form-item>
          <Form-item label="流程状态"  >
            <Select  placeholder="请选择" style="width: 200px">
              <Option value="1">开始</Option>
              <Option value="3">停止</Option>
              <Option value="2">结束</Option>
            </Select>
          </Form-item>
          <Form-item label="申请人" prop="applicantName">
            <Input  placeholder="请输入申请人" v-model="submitData.applicantName"></Input>
          </Form-item>
          <Form-item label="流水号" prop="serialNumber">
            <Input  placeholder="请输入流水号" v-model="submitData.serialNumber"></Input>
          </Form-item>
          <Form-item style="margin-left:-35px;" class="br">
            <Button @click="initPageData" type="primary" icon="ios-search">搜索</Button>
            <Button @click="reSet" >重置</Button>
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
    <Modal title="税金申请表单" scrollable v-model="showTaxes" :mask-closable='false' :width="1220" style="overflow-y:scroll;">
          <main v-if="tableList.length>0">
             <table width="1182" height="625" class="taxesTables">
                <tbody>
                  <tr>
                  <td colspan="12" width="1124" style="text-align:center;font-size:22px;font-weight:bold;">税金申请表单</td>
                </tr>
                <tr>
                  <td width="82">公司名称</td>
                  <td colspan="5" width="504">{{tableList[0].companyName}}</td>
                  <td width="72">税务识别号码</td>
                  <td colspan="5" width="502">{{tableList[0].tin}}</td>
                </tr>
                <tr>
                  <td width="82">国家</td>
                  <td colspan="5" width="504">{{tableList[0].countryName}}</td>
                  <td width="72">币种</td>
                  <td colspan="5" width="502">{{tableList[0].currency}}</td>
                </tr>
                <tr>
                  <td width="82">申请人</td>
                  <td colspan="5" width="504">{{tableList[0].applicantName}}</td>
                  <td width="72">备注</td>
                  <td colspan="5" width="502">{{tableList[0].remarks}}</td>
                </tr>
                <tr>
                  <td width="82">所属期间</td>
                  <td width="118">税种</td>
                  <td width="124">应缴税额</td>
                  <td width="72">应缴滞纳金</td>
                  <td width="72">申请缴纳税款</td>
                  <td width="72">缴款截止日期</td>
                  <td width="72">实缴税额</td>
                  <td width="72">实缴滞纳金</td>
                  <td width="117">实际缴纳税款</td>
                  <td width="109">实际缴纳时间</td>
                  <td width="132">附件</td>
                  <td width="140">备注</td>
                </tr>
                <tr v-for="item in tableList[0].details" :key="item.id">
                  <td width="82">{{item.taxPeriod}}</td>
                  <td width="118">{{item.taxDict}}</td>
                  <td width="124">{{item.payableTax}}</td>
                  <td width="72">{{item.lateFeePayable}}</td>
                  <td width="72">{{item.taxPaid}}</td>
                  <td width="72">{{item.deadline}}</td>
                  <td width="72">{{item.overduePayment}}</td>
                  <td width="72">{{item.paymentCertificate}}</td>
                  <td width="117">{{item.paymentCertificatePath}}</td>
                  <td width="109">{{item.taxesOrderTime}}</td>
                  <td width="132">{{item.isUploadTaxReturns}}</td>
                  <td width="140">{{item.remarks}}</td>
                </tr>
                <tr>
                  <td width="82">合计</td>
                  <td width="118"></td>
                  <td width="124">1</td>
                  <td width="72">0</td>
                  <td width="72">1</td>
                  <td width="72"></td>
                  <td width="72">1</td>
                  <td width="72">0</td>
                  <td width="117">0</td>
                  <td width="109"></td>
                  <td width="132"></td>
                  <td width="140"></td>
                </tr>
                <tr class="centerHeight">
                  <td width="82"></td>
                  <td width="118"></td>
                  <td width="124"></td>
                  <td width="72"></td>
                  <td width="72"></td>
                  <td width="72"></td>
                  <td width="72"></td>
                  <td width="72"></td>
                  <td width="117"></td>
                  <td width="109"></td>
                  <td width="132"></td>
                  <td width="140"></td>
                </tr>
                <tr class="center">
                  <td width="82"></td>
                  <td width="118">任务</td>
                  <td width="124">角色名称</td>
                  <td width="72">姓名</td>
                  <td width="72">结论</td>
                  <td width="72">意见</td>
                  <td width="72">审批时间</td>
                  <td width="72"></td>
                  <td width="117"></td>
                  <td width="109"></td>
                  <td width="132"></td>
                  <td width="140"></td>
                </tr>
                <tr class="center"  v-for="row in tableList[0].auditLogs" :key="row.id">
                  <td width="82"></td>
                  <td width="118">{{row.taskName}}</td>
                  <td width="124">{{row.roleName}}</td>
                  <td width="72">{{row.flowNum}}</td>
                  <td width="72">{{row.auditResult}}</td>
                  <td width="72">{{row.advice}}</td>
                  <td width="72"></td>
                  <td width="72"></td>
                  <td width="117"></td>
                  <td width="109"></td>
                  <td width="132"></td>
                  <td width="140"></td>
                </tr>
              </tbody>
              </table>
          </main>
          <footer class="vertical-center" slot="footer">
              <Button style="width: 100px;" disabled>打印</Button>
              <Button type="primary" disabled style="width: 100px;margin-left:158px">导出</Button>
          </footer>
    </Modal>
  </div>
</template>

<script>
import { taxAlreadyHandle,getTaxAuditLog } from "@/api/index.js";
export default {
  name: "taxAlreadyHandle",
  data() {
    return {
      tableList:[
        // {
        //   taxPeriod:'2018-10',
        //   taxes:'房产税',
        //   payableTax:600,
        //   lateFeePayable:10,
        //   taxPaid:610,
        //   deadline:'2018-12-01',
        //   overduePayment:650,
        //   taxesOrderDilay:50,
        //   taxesOrderAmount:700,
        //   taxesOrderTime:'2018-12-15',
        //   taxesUpload:'上传/预览/删除',
        //   remarks:'测试数据'
        // },
        // {
        //   taxPeriod:'2018-10',
        //   taxes:'房产税',
        //   payableTax:600,
        //   lateFeePayable:10,
        //   taxPaid:610,
        //   deadline:'2018-12-01',
        //   overduePayment:650,
        //   taxesOrderDilay:50,
        //   taxesOrderAmount:700,
        //   taxesOrderTime:'2018-12-15',
        //   taxesUpload:'上传/预览/删除',
        //   remarks:'测试数据'
        // },
        // {
        //   taxPeriod:'2018-10',
        //   taxes:'房产税',
        //   payableTax:600,
        //   lateFeePayable:10,
        //   taxPaid:610,
        //   deadline:'2018-12-01',
        //   overduePayment:650,
        //   taxesOrderDilay:50,
        //   taxesOrderAmount:700,
        //   taxesOrderTime:'2018-12-15',
        //   taxesUpload:'上传/预览/删除',
        //   remarks:'测试数据'
        // },
        // {
        //   taxPeriod:'2018-10',
        //   taxes:'房产税',
        //   payableTax:600,
        //   lateFeePayable:10,
        //   taxPaid:610,
        //   deadline:'2018-12-01',
        //   overduePayment:650,
        //   taxesOrderDilay:50,
        //   taxesOrderAmount:700,
        //   taxesOrderTime:'2018-12-15',
        //   taxesUpload:'上传/预览/删除',
        //   remarks:'测试数据'
        // },
        // {
        //   taxPeriod:'2018-10',
        //   taxes:'房产税',
        //   payableTax:600,
        //   lateFeePayable:10,
        //   taxPaid:610,
        //   deadline:'2018-12-01',
        //   overduePayment:650,
        //   taxesOrderDilay:50,
        //   taxesOrderAmount:700,
        //   taxesOrderTime:'2018-12-15',
        //   taxesUpload:'上传/预览/删除',
        //   remarks:'测试数据'
        // }
      ],
      showTaxes:false,
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
          title: "流水号",
          key: "id",
          // width: 110
          render: (h, params) => {
            let name = params.row.id;
            return h(
              "div",
              {
                style: {
                  textAlign: "left",
                  marginLeft:"120px"
                }
              },
              [
                h(
                  "Button",
                  {
                    props: {
                      type: "text",
                      size: "small",
                      icon: "md-eye"
                    },
                    style: {
                      color: "blue"
                    },
                    on: {
                      click: () => {
                        this.changeNo(params.row);
                      }
                    }
                  },
                  name
                )
              ]
            );
          }
        },
        {
          title: "公司名称",
          key: "companyName",
          width: 110
        },
        {
          title: "保存时间",
          key: "saveTime",
          render: (h, params) => {
            return h(
              "div",
              params.row.saveTime && new Date(params.row.saveTime).format()
            );
          }
          // width: 110
        },{
          title:"处理环节"
        },{
          title:"当前处理人"
        }
        /* {
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
                        // this.remove(params.row);
                      }
                    }
                  },
                  "删除"
                )
              ]);
          }
        } */
      ],
      data: [
        // {
        //   id: "1ca4b097e00444278222e2818a422e57",
        //   companyName: "元活该哈哈",
        //   saveTime: "2018-01-08"
        // },
        // {
        //   id: "240c398c12a14d23ace250a8ec91cd96",
        //   companyName: "元活该哈哈",
        //   saveTime: "2018-01-08"
        // },
        // {
        //   id: "240c398c12a14d23ace250a8ec91cd96",
        //   companyName: "元活该哈哈",
        //   saveTime: "2018-01-08"
        // },
        // {
        //   id: "240c398c12a14d23ace250a8ec91cd96",
        //   companyName: "元活该哈哈",
        //   saveTime: "2018-01-08"
        // }
      ],
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      submitData:{
        selectDate:"",
        companyName:"",
        serialNumber:"",
        applicantName:""
      }
    };
  },
  methods: {
    reSet(){
      this.startDate=""
      this.endDate=""
      this.$refs['taxAlreadyHandleForm'].resetFields();
    },
    getTaxAuditLog(val){
        let vm = this;
        let params = val
        getTaxAuditLog(params).then((result) => {
          if (result.status === '0') {
            vm.tableList = result.data;
          }
        })
    },
    changeNo(val) {
      this.getTaxAuditLog(val.id)
      this.showTaxes = true;
    },
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
          endDate: this.endDate,
          companyName:this.submitData.companyName,
          serialNumber:this.submitData.serialNumber,
          applicantName:this.submitData.applicantName
        }
      };
      taxAlreadyHandle(params)
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
    selectDateRange(v) {
      if (v) {
        this.startDate = v[0];
        this.endDate = v[1];
      }
    }
  },
  mounted() {
    this.init();
  }
};
</script>

<style lang="less">
.vertical-center {
  text-align: center;
}
.taxesTables {
  border-collapse:collapse;
  border:1px solid black;
   tr,td {
    text-align: center;
    border: 1px solid black;
  }
  .centerHeight {
    height: 40px;
    td {
      border:none;
    }
  }

}
</style>
