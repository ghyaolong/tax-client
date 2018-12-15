<style lang="less">
  .operation {
    margin-bottom: 2vh;
  }
  .preview-modal .ivu-modal-body {
    padding: 0;
  }
</style>
<template>
<!-- 税金申请补充 -->
  <Row>
    <Col>
    <Card>
      <Row>
        <Form ref="form" :model="form" inline :label-width="90" class="search-form">
          <Form-item label="公司名称" prop="companyId">
            <Select v-model="form.companyId" filterable disabled style="width: 200px" @on-change="changeCompany" label-in-value>
              <Option v-for="item in companyList" :value="item.id" :key="item.id" :label="item.name">
              </Option>
            </Select>
          </Form-item>
          <Form-item label="税务识别号码" prop="tin">
            <Input type="text" v-model="form.tin" disabled style="width: 200px" />
          </Form-item>
          <Form-item label="国家" prop="countryCode">
            <Select v-model="form.countryCode" disabled style="width:200px">
              <Option v-for="item in dictCountrys" :value="item.code" :key="item.id">{{ item.name }}</Option>
            </Select>
          </Form-item>
          <Form-item label="币种" prop="currency">
            <Select v-model="form.currency" disabled style="width:200px">
              <Option v-for="item in dictCurrencys" :value="item.code" :key="item.id">{{ item.name }}</Option>
            </Select>
          </Form-item>
          <Form-item label="备注" prop="remarks">
            <Input type="text" v-model="form.remarks" disabled :maxlength="200" clearable placeholder="请输入备注" style="width: 200px" />
          </Form-item>
          <br/>
          <Form-item label="财务报表" prop="financialReport">
            <Upload action="/api/file/upload" :headers="{accessToken: accessToken}" name="file" :data="{materialTypeDict: 'FINANCE_REPORT'}" :show-upload-list="false" :on-success="financeUploadSuc">
              <Button icon="ios-cloud-upload-outline">上传文件</Button>
              <span style="padding-left: 10px;" v-if="form.financialReport">已上传</span>
            </Upload>
          </Form-item>
        </Form>
        <Spin size="large" fix v-if="loading"></Spin>
      </Row>
      <Row class="operation">
        <Button @click="submit" >提交</Button>
        <circleLoading v-if="operationLoading"/>
      </Row>
      <Row>
        <Table ref="table" border :columns="columns" :data="data" @on-selection-change="changeSelect"></Table>
      </Row>
    </Card>
    </Col>
    <Modal
        v-model="showUploadModal"
        @on-ok="uploadModalOk"
        @on-cancel="uploadModalCancel">
        <Form label-position="left" :label-width="100">
          <FormItem label="预申报表">
            <div v-if="fileUploadForm.preTaxReturns">{{ fileUploadForm.preTaxReturnsPath }}&nbsp;&nbsp;<Button @click.stop="filePriview(fileUploadForm.preTaxReturnsPath)">预览</Button></div>
          </FormItem>
          <FormItem label="申报表">
            <Upload action="/api/file/upload" :headers="{accessToken: accessToken}" name="file" :data="{materialTypeDict: 'TAX_REPORT'}" :show-upload-list="false" :on-success="uploadSuc">
              <Button icon="ios-cloud-upload-outline">上传文件</Button>
              <div v-if="fileUploadForm.taxReturns">{{ fileUploadForm.taxReturnsPath }}&nbsp;&nbsp;<Button @click.stop="filePriview(fileUploadForm.taxReturnsPath)">预览</Button></div>
            </Upload>
          </FormItem>
          <FormItem label="完税申报表">
            <Upload action="/api/file/upload" :headers="{accessToken: accessToken}" name="file" :data="{materialTypeDict: 'DONE_TAX_REPORT'}" :show-upload-list="false" :on-success="uploadSuc">
              <Button icon="ios-cloud-upload-outline">上传文件</Button>
              <div v-if="fileUploadForm.paymentCertificate">{{ fileUploadForm.paymentCertificatePath }}&nbsp;&nbsp;<Button @click.stop="filePriview(fileUploadForm.paymentCertificatePath)">预览</Button></div>
            </Upload>
          </FormItem>
          <FormItem label="其它">
            <Upload action="/api/file/upload" :headers="{accessToken: accessToken}" name="file" :data="{materialTypeDict: 'OTHER'}" :show-upload-list="false" :on-success="uploadSuc">
              <Button icon="ios-cloud-upload-outline">上传文件</Button>
              <div v-if="fileUploadForm.otherUploadId">{{ fileUploadForm.otherUploadIdPath }}&nbsp;&nbsp;<Button @click.stop="filePriview(fileUploadForm.otherUploadIdPath)">预览</Button></div>
            </Upload>
          </FormItem>
      </Form>
    </Modal>
    <Modal
        v-model="priviewModal"
        :title="fileName"
        width="700"
        class-name="preview-modal"
        footer-hide>
        <iframe style="width: 100%; height: 600px;" :src="filePath" frameborder="0"></iframe>
    </Modal>
  </Row>
</template>

<script>
import {
  getAllCompany,  // 获取所有公司
  getDictListDataByType,  // 根据类型获取字典信息
  getCompanyByName,   // 根据公司名称获取公司详情
  taxDetail,    // 获取税金申请详情（待提申请）
  taxReplenishment,    // 补充税金申请
  previewFile   // 文件预览
} from '@/api/index'
import { dictType } from '@/libs/constance.js'
import { getStore } from '@/libs/storage';
import circleLoading from "../../my-components/circle-loading.vue"
export default {
  name: 'taxApplication',
  data() {
    return {
      loading: false,
      priviewModal: false,
      fileName: '',
      filePath: '',
      operationLoading: false,
      accessToken: getStore('accessToken'),
      showUploadModal: false,
      form: {
        companyId: '',
        tin: '',
        countryCode: '',
        currency: '',
        applicantName: '',
        remarks: '',
        financialReport: '',
        id: ''
      },
      columns: [
        /* {
          title: '操作',
          width: 80,
          fixed: 'right',
          align: "center",
          render: (h, params) => {
            return h('Button', {
              props: {
                type: "error",
                size: "small"
              },
              on: {
                click: () => {
                  if (this.data.length > 1) {
                    this.data.splice(params.index, 1);
                  }
                }
              }
            }, '删除')
          }
        }, */
        {
          title: '所属期间',
          key: "taxPeriod",
          width: 160,
          align: 'center',
        },
        {
          title: '税种',
          key: "taxDict",
          align: 'center',
          width: 160,
          render: this.renderSelect
        },
        {
          title: '应缴税额',
          key: "payableTax",
          align: 'center',
          width: 120
        },
        {
          title: '应缴滞纳金',
          key: "lateFeePayable",
          align: 'center',
          width: 120
        },
        {
          title: '申请缴纳税款',
          key: "applTaxPayment",
          align: 'center',
          width: 120
        },
        {
          title: '缴款截止日期',
          key: "deadline",
          width: 160,
          align: 'center',
          render: (h, parmas) => {
            return h('div', new Date(params.row.deadline).format())
          }
        },
        {
          title: '实缴税额',
          key: "taxPaid",
          align: 'center',
          width: 120
        },
        {
          title: '实缴滞纳金',
          key: "overduePayment",
          align: 'center',
          width: 120
        },
        {
          title: '实际缴纳税款',
          key: 'taxPaid',
          align: 'center',
          width: 120
        },
        {
          title: '实际缴纳日期',
          key: "paymentTime",
          align: 'center',
          width: 160,
          render: (h, parmas) => {
            return h('div', new Date(params.row.paymentTime).format())
          }
        },
        {
          title: '附件',
          key: "taxReturns",
          align: 'center',
          width: 180,
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
                        let item = this.data[params.index];
                        let {preTaxReturns, preTaxReturnsPath, taxReturns, taxReturnsPath, paymentCertificate, paymentCertificatePath, otherUploadId, otherUpload} = item;
                        this.fileUploadForm = {
                          uploadColomunIndex: params.index,
                          preTaxReturns,
                          preTaxReturnsPath,
                          taxReturns,
                          taxReturnsPath,
                          paymentCertificate,
                          paymentCertificatePath,
                          otherUploadId,
                          otherUploadPath: otherUpload
                        }
                        this.showUploadModal = true;
                      }
                    }
                  },
                  "上传"
                ),
                h(
                  "Button",
                  {
                    props: {
                      size: "small"
                    },
                    style: {
                      marginRight: "5px"
                    },
                    on: {
                      click: () => {
                        let item = this.data[params.index];
                        let {preTaxReturns, preTaxReturnsPath, taxReturns, taxReturnsPath, paymentCertificate, paymentCertificatePath, otherUploadId, otherUpload} = item;
                        this.fileUploadForm = {
                          uploadColomunIndex: params.index,
                          preTaxReturns,
                          preTaxReturnsPath,
                          taxReturns,
                          taxReturnsPath,
                          paymentCertificate,
                          paymentCertificatePath,
                          otherUploadId,
                          otherUploadPath: otherUpload
                        }
                        this.showUploadModal = true;
                      }
                    }
                  },
                  "预览"
                )
              ]);
          }
        },
        {
          title: '备注',
          key: "remarks",
          align: 'center',
          width: 160
        },
      ],
      data: [],
      companyList: [],
      dictCountrys: [],
      dictCurrencys: [],
      dictTaxCategorys: [],
      dictTaxPayments: [],
      selectList: [],
      selectCount: 0,
      fileUploadForm: {
        uploadColomunIndex: null,
        taxReturns: '',
        paymentCertificate: '',
        otherUploadId: ''
      }
    }
  },
  methods: {
    init() {
      this.initPageData()
      this.initCompanyList()
      this.getDictData()
      this.addColumn()
    },
    // 获取页面数据
    initPageData() {
      // 任务回显
      this.loading = true;
      taxDetail(this.$route.params.params.id).then(res => {
        let data = res.data.details;
        data && data.map(item => {
          item.taxPeriod.replace(/-01$/, '');
          item.paymentTime = new Date(item.paymentTime).format('yyyy-MM-dd');
          item.deadline = new Date(item.deadline).format('yyyy-MM-dd');
        });
        this.data = data || [];
        let params = res.data;
        this.form.companyId = params.companyId;
        this.form.tin = params.tin;
        this.form.countryCode = params.countryCode;
        this.form.currency = params.currency;
        this.form.remarks = params.remarks;
        // this.form.financialReport = params.financialReport;
        this.form.id = params.id;
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
      getDictListDataByType(dictType.country)
        .then(res => {
          this.dictCountrys = res.data;
        });
      getDictListDataByType(dictType.currency)
        .then(res => {
          this.dictCurrencys = res.data;
        });
      getDictListDataByType(dictType.taxCategory)
        .then(res => {
          this.dictTaxCategorys = res.data;
        })
      getDictListDataByType(dictType.taxPayment)
        .then(res => {
          this.dictTaxPayments = res.data;
        })
    },
    /* 取消选中 */
    clearSelectAll() {
      this.$refs.table.$children[0].selectAll(false);
    },
    /* 选择 */
    changeSelect(e) {
      this.selectList = e;
      this.selectCount = e.length;
    },
    addColumn() {
      this.data.push({
        taxPeriod: '',
        taxDict: '',
        payableTax: 0,
        lateFeePayable: 0,
        applTaxPayment: '',
        deadline: '',
        taxPaid: 0,
        overduePayment: 0,
        paymentTime: '',
        taxReturns: '',
        remarks: ''
      });
    },
    /* 表格栏输入框渲染函数 */
    renderInput(h, params) {
      let temp = null;
      if (params.column.key === 'applTaxPayment') {
        temp = parseFloat(params.row.payableTax) + parseFloat(params.row.lateFeePayable);
      }
      if (params.column.key === 'remarks') {
        return h('Input', {
          props: {
            type: 'text',
            maxlength: 100,
            value: params.row[params.column.key]
          },
          on: {
            input: e => {
              params.row[params.column.key] = e;
              this.data[params.index] = params.row;
            }
          }
        })
      } else {
        return h('InputNumber', {
          props: {
            maxlength: 10,
            value: temp || Number(params.row[params.column.key])
          },
          on: {
            input: e => {
              params.row[params.column.key] = e;
              this.data[params.index] = params.row;
            }
          }
        })
      }
    },
    /* 表格框下拉选择框渲染函数 */
    renderSelect(h, params) {
      const ArrayList = {
        taxPeriod: 'dictTaxPayments',   // 所属期间
        taxDict: 'dictTaxCategorys',   // 税种
      }
      return h('Select', {
        props: {
          value: params.row[params.column.key]
        },
        on: {
          'on-change': val => {
            this.data[params.index][params.column.key] = val;
          }
        }
      }, this[ArrayList[params.column.key]].map(item => {
          return h('Option', {
            props: {
              value: item.code,
              label: item.name
            }
          })
        })
      )
    },
    /* 表格日期选择框渲染函数 */
    renderDatePicker(h, params) {
      return h('DatePicker', {
        props: {
          type: params.column.key === 'taxPeriod' ? 'month' : 'date',
          value: params.row[params.column.key]
        },
        on: {
          'on-change': val => {
            this.data[params.index][params.column.key] = val;
          }
        }
      })
    },
    /* 选择公司后获取对应的税种等信息 */
    changeCompany(company) {
      this.loading = true;
      getCompanyByName({name: company.label})
        .then(res => {
          this.form.tin = res.data.tin;
          this.form.countryCode = res.data.countryCode;
          this.form.currency = res.data.currencyCode;
        })
        .finally(() => {
          this.loading = false;
        })
    },
    /* 财务报表上传成功 */
    financeUploadSuc(res) {
      this.form.financialReport = res.data.id;
      this.form.financialReportPath = res.data.fileName;
    },
    /* 税金申请 - 文件上传 */
    uploadSuc(res) {
      let key = {
        'PRE_TAX_REPORT': 'preTaxReturns',
        'TAX_REPORT': 'taxReturns',
        'DONE_TAX_REPORT': 'paymentCertificate',
        'OTHER': 'otherUploadId'
      }[res.data.materialTypeDict];
      this.fileUploadForm[key] = res.data.id;
      this.fileUploadForm[key + 'Path'] = res.data.fileName;
    },
    uploadModalOk() {
      let uploadColomunIndex = this.fileUploadForm.uploadColomunIndex;
      this.data[uploadColomunIndex].preTaxReturns = this.fileUploadForm.preTaxReturns;
      this.data[uploadColomunIndex].preTaxReturnsPath = this.fileUploadForm.preTaxReturnsPath;
      this.data[uploadColomunIndex].taxReturns = this.fileUploadForm.taxReturns;
      this.data[uploadColomunIndex].taxReturnsPath = this.fileUploadForm.taxReturnsPath;
      this.data[uploadColomunIndex].paymentCertificate = this.fileUploadForm.paymentCertificate;
      this.data[uploadColomunIndex].paymentCertificatePath = this.fileUploadForm.paymentCertificatePath;
      this.data[uploadColomunIndex].otherUploadId = this.fileUploadForm.otherUploadId;
      this.data[uploadColomunIndex].otherUpload = this.fileUploadForm.otherUploadIdPath;
      this.showUploadModal = false;
    },
    uploadModalCancel() {
      this.fileUploadForm = {
        uploadColomunIndex: null,
        taxReturns: '',
        taxReturnsPath: '',
        paymentCertificate: '',
        paymentCertificatePath: '',
        otherUploadId: '',
        otherUploadIdPath: ''
      }
      this.showUploadModal = false;
    },
    // 文件预览
    filePriview(name) {
      this.filePath = previewFile(name);
      this.fileName = name;
      this.priviewModal = true;
      return false;
    },
    /* 提交 */
    submit(save) {
      let params = {...this.form, details: this.data};
      params.executeType = save === 'save' ? 0 : 1;
      if (!params.financialReport) {
        this.$Message.error('请上传财务报表');
        return;
      }
      let flag = params.details.some(item => {
        return !item.taxReturns || !item.paymentCertificate || !item.otherUploadId
      })
      if (flag) {
        this.$Message.error('请上传附件');
        return;
      }
      // 所属期间字段显示月份，但提交后台需要精确值日
      params.details.map(item => {
        item.taxPeriod = item.taxPeriod && item.taxPeriod + '-01';
        item.taxApplicationId = params.id;
      });
      this.loading = true;
      taxReplenishment(params).then(res => {
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
