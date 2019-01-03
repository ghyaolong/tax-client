<style lang="less">
  .operation {
    margin-bottom: 2vh;
  }
  .preview-modal .ivu-modal-body {
    padding: 0;
  }
  .ivu-upload .ivu-input-wrapper {
    width: 59%;
    margin-right: 10px;
  }
  .upload-box .ivu-upload-select {
    width: 500px;
  }
  .preview-modal-inline .ivu-input-wrapper {
    width: 70%;
    margin-right: 10px;
  }
</style>
<template>
  <Row>
    <Col>
    <Card>
      <Row>
        <Form ref="form" :model="form" inline :label-width="90" class="search-form">
          <Form-item label="公司名称" prop="companyId">
            <Select v-model="form.companyId" filterable style="width: 200px" @on-change="changeCompany" label-in-value>
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
          <!-- <Form-item label="申请人" prop="applicantName">
            <Input type="text" v-model="form.applicantName" clearable placeholder="请输入申请人姓名" style="width: 200px" />
          </Form-item> -->
          <Form-item label="备注" prop="remarks">
            <Input type="text" v-model="form.remarks" maxlength="40" clearable placeholder="请输入备注" style="width: 200px" />
          </Form-item>
          <Form-item label="选择审核人" prop="currentHandler">
            <Select v-model="form.currentHandler" style="width:200px">
              <Option v-for="item in reviewers" :value="item.id" :key="item.id">{{ item.realName }}</Option>
            </Select>
          </Form-item>
          <br/>
          <Form-item label="财务报表" prop="financialReportPath">
            <Upload action="/api/file/upload"
            :headers="{accessToken: accessToken}"
            name="file" :data="{materialTypeDict: 'FINANCE_REPORT'}"
            :show-upload-list="false" :on-success="financeUploadSuc" class="upload-box">
              <Input type="text" readonly v-model="form.financialReportPath" />
              <Button icon="ios-cloud-upload-outline">上传文件</Button>
              <!-- <span style="padding-left: 10px;" v-if="form.financialReport">已上传</span> -->
            </Upload>
          </Form-item>
        </Form>
        <Spin size="large" fix v-if="loading"></Spin>
      </Row>
      <Row class="operation">
        <!-- <Button @click="delAll" icon="md-trash">批量删除</Button> -->
        <Button @click="addColumn" icon="md-add">增加一栏</Button>
        <Button @click="submit('save')">保存</Button>
        <Button @click="submitTrue" >提交</Button>
        <circleLoading v-if="operationLoading"/>
      </Row>
      <!-- <Row>
        <Alert show-icon>
          已选择 <span class="select-count">{{selectCount}}</span> 项
          <a class="select-clear" @click="clearSelectAll">清空</a>
        </Alert>
      </Row> -->
      <Row>
        <Table ref="table" border :columns="columns" :data="data" id="myTable"
        @on-selection-change="changeSelect">
      </Table>

      </Row>
    </Card>
    </Col>
    <Modal
        v-model="showUploadModal"
        @on-ok="uploadModalOk"
        @on-cancel="uploadModalCancel">
        <Form label-position="left" :label-width="100">
          <FormItem label="预申报表">
            <Upload action="/api/file/upload" :headers="{accessToken: accessToken}" name="file" :data="{materialTypeDict: 'PRE_TAX_REPORT'}" :show-upload-list="false" :on-success="uploadSuc">
              <Input type="text" readonly v-model="fileUploadForm.preTaxReturnsPath" />
              <Button icon="ios-cloud-upload-outline">上传文件</Button>
              <!-- <Button v-if="fileUploadForm.preTaxReturns" @click.stop="filePriview(fileUploadForm.preTaxReturnsPath)">预览</Button> -->
            </Upload>
          </FormItem>
          <FormItem label="申报表" v-if="routeType === 'taxReplenishment'">
            <Upload action="/api/file/upload" :headers="{accessToken: accessToken}" name="file" :data="{materialTypeDict: 'TAX_REPORT'}" :show-upload-list="false" :on-success="uploadSuc">
              <Input type="text" readonly v-model="fileUploadForm.taxReturnsPath" />
              <Button icon="ios-cloud-upload-outline">上传文件</Button>
              <!-- <div v-if="fileUploadForm.taxReturns"><Button @click.stop="filePriview(fileUploadForm.taxReturnsPath)">预览</Button></div> -->
            </Upload>
          </FormItem>
          <FormItem label="完税申报表" v-if="routeType === 'taxReplenishment'">
            <Upload action="/api/file/upload" :headers="{accessToken: accessToken}" name="file" :data="{materialTypeDict: 'DONE_TAX_REPORT'}" :show-upload-list="false" :on-success="uploadSuc">
              <Input type="text" readonly v-model="fileUploadForm.paymentCertificatePath" />
              <Button icon="ios-cloud-upload-outline">上传文件</Button>
              <!-- <div v-if="fileUploadForm.paymentCertificate"><Button @click.stop="filePriview(fileUploadForm.paymentCertificatePath)">预览</Button></div> -->
            </Upload>
          </FormItem>
          <FormItem label="其它" v-if="routeType === 'taxReplenishment'">
            <Upload action="/api/file/upload" :headers="{accessToken: accessToken}" name="file" :data="{materialTypeDict: 'OTHER'}" :show-upload-list="false" :on-success="uploadSuc">
              <Input type="text" readonly v-model="fileUploadForm.otherUploadId" />
              <Button icon="ios-cloud-upload-outline">上传文件</Button>
              <!-- <div v-if="fileUploadForm.otherUploadId"><Button @click.stop="filePriview(fileUploadForm.otherUploadIdPath)">预览</Button></div> -->
            </Upload>
          </FormItem>
      </Form>
    </Modal>
    <Modal
        :closable="false"
        class-name="preview-modal-inline"
        v-model="showPreviewModal">
        <Form label-position="left" :label-width="100">
          <FormItem label="预申报表">
            <Input type="text" readonly
            v-model="fileUploadForm.preTaxReturnsPath" />
            <Button v-if="fileUploadForm.preTaxReturns" @click.stop="filePriview(fileUploadForm.preTaxReturnsPath)">预览</Button>
          </FormItem>
          <FormItem label="申报表">
            <Input type="text" readonly v-model="fileUploadForm.taxReturnsPath" />
            <Button v-if="fileUploadForm.taxReturns" @click.stop="filePriview(fileUploadForm.taxReturnsPath)">预览</Button>
          </FormItem>
          <FormItem label="完税申报表">
              <Input type="text" readonly v-model="fileUploadForm.paymentCertificatePath" />
              <Button v-if="fileUploadForm.paymentCertificate" @click.stop="filePriview(fileUploadForm.paymentCertificatePath)">预览</Button>
            </Upload>
          </FormItem>
          <FormItem label="其它">
              <Input type="text" readonly v-model="fileUploadForm.otherUploadId" />
              <Button v-if="fileUploadForm.otherUploadId" @click.stop="filePriview(fileUploadForm.otherUploadId)">预览</Button>
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
  getCompanyByUser,  // 获取所有公司
  getDictListDataByType,  // 根据类型获取字典信息
  getCompanyByName,   // 根据公司名称获取公司详情
  taxAdd,   // 税金申请新增
  taxDetail,    // 获取税金申请详情（待提申请）
  taxEdit,    // 税金申请编辑
  getReviewer,   // 获取当前登录用户的上级审核人
  previewFile,   // 文件预览
  resSubmit
} from '@/api/index'
import { dictType } from '@/libs/constance.js'
import { getStore } from '@/libs/storage';
import Cookies from "js-cookie";
import circleLoading from "../../my-components/circle-loading.vue"
import {submitJJSQ} from '@/api/index';
export default {
  name: 'taxApplication',
  data() {
    return {
      isRouterAlive: true,
      loading: false,
      priviewModal: false,
      showPreviewModal: false,
      fileName: '',
      filePath: '',
      operationLoading: false,
      accessToken: getStore('accessToken'),
      showUploadModal: false,
      form: {
        companyId: '',
        companyName: '',
        tin: '',
        countryCode: '',
        currency: '',
        applicantName: '',
        remarks: '',
        currentHandler: '',
        financialReport: '',
        financialReportPath: ''
      },
      columns: [
        {
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
        },
        {
          title: '所属期间',
          key: "taxPeriod",
          width: 160,
          align: 'center',
          // render: this.renderSelect
          render: this.renderDatePicker
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
          width: 120,
          render: this.renderInput
        },
        {
          title: '应缴滞纳金',
          key: "lateFeePayable",
          align: 'center',
          width: 120,
          render: this.renderInput
        },
        {
          title: '申请缴纳税款',
          key: "applTaxPayment",
          align: 'center',
          width: 120,
          // render: this.renderInput
          render: (h, params) => {
            return h('div', {
              domProps: {
                innerText: parseFloat(params.row.payableTax) + parseFloat(params.row.lateFeePayable)
              }
            })
            return h('div', parseFloat(this.data[params.index].payableTax) + parseFloat(this.data[params.index].lateFeePayable))
            // let item = this.data[params.index];
            // item[params.column.key] = parseFloat(item.payableTax) + parseFloat(item.lateFeePayable);
            // return h('div', item[params.column.key])
          }
        },
        {
          title: '缴款截止日期',
          key: "deadline",
          width: 160,
          align: 'center',
          render: this.renderDatePicker
        },
        {
          title: '实缴税额',
          key: "taxPaid",
          align: 'center',
          width: 120,
          render: this.renderInput
        },
        {
          title: '实缴滞纳金',
          key: "overduePayment",
          align: 'center',
          width: 120,
          render: this.renderInput
        },
        {
          title: '实际缴纳税款',
          align: 'center',
          width: 120,
          render: (h, params) => {
            return h('div', {
              domProps: {
                innerText: parseFloat(params.row.taxPaid) + parseFloat(params.row.overduePayment)
              }
            })
            return h('div', parseFloat(this.data[params.index].taxPaid) + parseFloat(this.data[params.index].overduePayment))
          }
        },
        {
          title: '实际缴纳日期',
          key: "paymentTime",
          align: 'center',
          width: 160,
          render: this.renderDatePicker
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
                          otherUpload: otherUpload
                        }
                        this.showUploadModal = true;
                      }
                    }
                  },
                  "上传"
                ),
                // h(
                //   "Button",
                //   {
                //     props: {
                //       size: "small"
                //     },
                //     style: {
                //       marginRight: "5px"
                //     },
                //     on: {
                //       click: () => {
                //         let item = this.data[params.index];
                //         let {preTaxReturns, preTaxReturnsPath, taxReturns, taxReturnsPath, paymentCertificate, paymentCertificatePath, otherUploadId, otherUpload} = item;
                //         this.fileUploadForm = {
                //           uploadColomunIndex: params.index,
                //           preTaxReturns,
                //           preTaxReturnsPath,
                //           taxReturns,
                //           taxReturnsPath,
                //           paymentCertificate,
                //           paymentCertificatePath,
                //           otherUploadId,
                //           otherUploadPath: otherUpload
                //         }
                //         this.showPreviewModal = true;
                //       }
                //     }
                //   },
                //   "预览"
                // ),
                // h(
                //   "Button",
                //   {
                //     props: {
                //       type: "error",
                //       size: "small"
                //     },
                //     on: {
                //       click: () => {
                //         // this.remove(params.row);
                //       }
                //     }
                //   },
                //   "删除"
                // )
              ]);
          }
        },
        {
          title: '备注',
          key: "remarks",
          align: 'center',
          width: 160,
          render: this.renderInput
        },
      ],
      data: [],
      companyList: [],
      reviewers: [],
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
      },
      routeType: '',
      payableTaxALL:0, // 应缴税额合计
      lateFeePayable:0, // 应缴滞纳金合计
      applTaxPayment:0, // 申请纳税款合计
      taxPaid:0, // 实缴税款合计
      overduePayment:0, //实缴滞纳金合计
      taxsjsk:0, // 实缴税款合计
      userInfo:{}
    }
  },
  methods: {
    // 真是提交
    submitTrue() {
      this.form.applicantName=this.userInfo.username  // 用户名
      this.form.applicantId=this.userInfo.id // 用户id
      this.form.executeType=1; // 提交
      if(this.form.countryCode) {
        this.form.countryName = this.dictCountrys && this.dictCountrys.filter((item)=>{return item.code==this.form.countryCode})[0].name;
      }
      this.form.status=0;
      let params = {...this.form,details:[...this.data]}
      // 公司
      if (!params.companyId) {
        this.$Message.error('请选择公司');
        return;
      }
      // 审核人
      if (!params.currentHandler) {
        this.$Message.error('请选择审核人');
        return;
      }
      // 财务报表
      if (!params.financialReport) {
        this.$Message.error('请上传财务报表');
        return;
      }
      // 所属期间
      let dateVerity = params.details.some(item => {
        return !item.taxPeriod
      })
      if (dateVerity) {
        this.$Message.error('请选择所属期间');
        return;
      }
      params.details.map(item => {
        if(item.taxPeriod.indexOf('-01-01') > 1){

        }else{
          item.taxPeriod = item.taxPeriod && item.taxPeriod + '-01';
        }
        // item.taxPeriod = item.taxPeriod && item.taxPeriod + '-01';
      });
      // 税种
      let shuizhong = params.details.some(item => {
        return !item.taxDict
      })
      if (shuizhong) {
        this.$Message.error('请选择税种');
        return;
      }
      //  申请缴纳税款不能为空
      // let flag = params.details.some((item) => {
      //   if (item.applTaxPayment == '') {
      //     item.applTaxPayment = parseFloat(item.payableTax) + parseFloat(item.lateFeePayable);
      //   }
      //   return item.applTaxPayment <= 0
      // });
      // if (flag) {
      //   this.$Message.error('申请缴纳税款不能为空,请输入应缴税额或应缴滞纳金');
      //   return;
      // }
      //  缴款截止日期
      let jnjzrq = params.details.some(item => {
        return !item.deadline
      })
      if (jnjzrq) {
        this.$Message.error('请选择缴款截止日期');
        return;
      }
      //实际缴纳日期
      let sjjnrqi = params.details.some(item => {
        return !item.paymentTime
      })
      if (sjjnrqi) {
        this.$Message.error('请选择缴款截止日期');
        return;
      }
      // 税种与申报表
      let preTaxReturnsVerity = params.details.some(item => {
        return !item.preTaxReturns;
      });
      if (preTaxReturnsVerity) {
        this.$Message.error('请上传每个税种的预申报表');
        return;
      }
      this.loading = true;
      submitJJSQ(params).then((res)=>{
        if(res.data == "流程启动失败") {
          this.$Message.error("启动流程失败")
        }else{
          this.$Message.success('操作成功')
        }
        this.form={
          companyId: '',
          companyName: '',
          tin: '',
          countryCode: '',
          currency: '',
          applicantName: '',
          remarks: '',
          currentHandler: '',
          financialReport: '',
          financialReportPath: '',
          status:0
        }
        this.data=[{ taxPeriod: '',
                taxDict: '',
                payableTax: 0,
                lateFeePayable: 0,
                applTaxPayment: 0,
                deadline: '',
                taxPaid: 0,
                overduePayment: 0,
                paymentTime: '',
                taxReturns: "",
                remarks: '',
                status:0
              }]
      }).finally(() => {
        this.loading = false;
      })
    },
    init() {
      this.initPageData()
      this.initCompanyList()
      this.getReviewerList()
      this.getDictData()
      this.addColumn()
      this.addTable();
    },
    // table下面添加table
    addTable() {
      let el=this.$refs.table.$el
      let tbodyEl=el.querySelector("tbody")
      let parentEL=tbodyEl.parentNode;
      var tbodyDIV = document.createElement("tbody");
      let tdEL = document.createElement("td");
      tdEL.style['text-align']="center"
      tdEL.innerHTML="合计"
      tbodyDIV.append(tdEL)
      for(let i=0;i<this.columns.length-1;i++) {
        switch (i) {
          case 1:
            let tdEsL=document.createElement("td")
            tdEsL.setAttribute("id","payableTaxALL")
            tdEsL.style['text-align']="center"
            tbodyDIV.append(tdEsL)
            break;
          case 2:
            let lateFeePayabletdEsL=document.createElement("td")
            lateFeePayabletdEsL.setAttribute("id","lateFeePayable")
            lateFeePayabletdEsL.style['text-align']="center"
            tbodyDIV.append(lateFeePayabletdEsL)
            break;
          case 3:
            let applTaxPaymenttdEsL=document.createElement("td")
            applTaxPaymenttdEsL.setAttribute("id","applTaxPayment")
            applTaxPaymenttdEsL.style['text-align']="center"
            tbodyDIV.append(applTaxPaymenttdEsL)
            break;
          case 5:
            let taxPaidtdEsL=document.createElement("td")
            taxPaidtdEsL.setAttribute("id","taxPaid")
            taxPaidtdEsL.style['text-align']="center"
            tbodyDIV.append(taxPaidtdEsL)
            break;
          case 6:
            let overduePaymenttdEsL=document.createElement("td")
            overduePaymenttdEsL.setAttribute("id","overduePayment")
            overduePaymenttdEsL.style['text-align']="center"
            tbodyDIV.append(overduePaymenttdEsL)
            break;
          case 7:
            let taxsjsktdEsL=document.createElement("td")
            taxsjsktdEsL.setAttribute("id","taxsjsk")
            taxsjsktdEsL.style['text-align']="center"
            tbodyDIV.append(taxsjsktdEsL)
            break;
          default:
            tbodyDIV.append(document.createElement("td"))
            break;
        }

      }
      parentEL.appendChild(tbodyDIV)
      // console.log(parentEL)
    },
    // 获取页面数据
    initPageData() {
      let type = this.$route.params.type;
      if (!type) return;
      this.routeType = type;
      // 待提任务回显
      if (type === 'readyCommit') {
        this.loading = true;
        taxDetail(this.$route.params.params.id).then(res => {
          console.log("22222220",res)
          // this.$Message.success(res.errMsg)
          let data = res.data && res.data.details;
          if(!data && res.status==0){
            this.$Message.success("无数据")
          }
          data && data.map(item => {
            item.taxPeriod.replace(/-01$/, '');
            item.paymentTime = new Date(item.paymentTime).format('yyyy-MM-dd');
            item.deadline = new Date(item.deadline).format('yyyy-MM-dd');
          });
          this.data = data || [];
          let params = res.data && res.data;
          if(params) {
            this.form.id = params.id;
            this.form.companyId = params.companyId;
            this.form.companyName = params.companyName;
            this.form.tin = params.tin;
            this.form.countryCode = params.countryCode;
            this.form.currentHandler=params.currentHandler;
            this.form.currency = params.currency;
            this.form.remarks = params.remarks;
            this.form.financialReport = params.financialReport;
            this.form.financialReportPath = params.financialReportPath;
          }
        }).finally(() => {
          this.loading = false;
        })
      }
    },
    /* 获取公司列表 */
    initCompanyList() {
      let userId = JSON.parse(Cookies.get("userInfo")).id;
      getCompanyByUser(userId)
        .then(res => {
          this.companyList = res.data;
        })
    },
    getReviewerList() {
      getReviewer().then(res => {
        this.reviewers = res.data;
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
    /* 删除 */
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
            console.log(e);
            ids += e.id + ",";
          });
          /* ids = ids.substring(0, ids.length - 1);
          this.operationLoading = true;
          deleteLog(ids).then(res => {
            this.operationLoading = false;
            if (res.success === true) {
              this.$Message.success("删除成功");
              this.clearSelectAll();
              this.init();
            }
          }); */
        }
      });
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
    /* 增加一栏 */
    addColumn() {
      this.data.push({
        taxPeriod: '',
        taxDict: '',
        payableTax: 0,
        lateFeePayable: 0,
        applTaxPayment: 0,
        deadline: '',
        taxPaid: 0,
        overduePayment: 0,
        paymentTime: '',
        taxReturns: "",
        remarks: '',
        status:0
      });
    },
    // 根据公司添加column
    addColumnByCompany(dataList){
      for(let i=0;i<dataList.length;i++) {
        this.data.push({
          taxPeriod: dataList[i].taxPeriod ? dataList[i].taxPeriod : "",
          taxDict: dataList[i].taxDict && dataList[i].taxDict || "",
          payableTax: dataList[i].payableTax && dataList[i].payableTax || 0,
          lateFeePayable:dataList[i].lateFeePayable && dataList[i].lateFeePayable || 0,
          applTaxPayment: dataList[i].applTaxPayment && dataList[i].applTaxPayment || 0,
          deadline: dataList[i].deadline && dataList[i].deadline || "",
          taxPaid: dataList[i].taxPaid && dataList[i].taxPaid || 0,
          overduePayment: dataList[i].overduePayment && dataList[i].overduePayment || 0,
          paymentTime: dataList[i].paymentTime && dataList[i].paymentTime || "",
          taxReturns: dataList[i].taxReturns && dataList[i].taxReturns || "",
          remarks: dataList[i].remarks && dataList[i].remarks || "",
          status:0
        });
      }
    },
    /* 表格栏输入框渲染函数 */
    renderInput(h, params) {
      let temp = null;
      if (params.column.key === 'applTaxPayment') {
        temp = parseFloat(params.row.payableTax) + parseFloat(params.row.lateFeePayable);
        this.$forceUpdate()
      }
      if (params.column.key === 'remarks') {
        return h('Input', {
          props: {
            type: 'text',
            maxlength: 40,
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
              this.$forceUpdate()
            }
          }
        })
      }

      /* return h('Input', {
        props: {
          type: 'text',
          maxlength: params.column.key === 'remarks' ? 100 : 10,
          value: temp || params.row[params.column.key],
          number: params.column.key != 'remarks'
        },
        on: {
          input: e => {
            if (params.column.key === 'remarks') {
              params.row[params.column.key] = e;
            } else {
              params.row[params.column.key] = isNaN(e) ? 0 : e;
            }
            this.data[params.index] = params.row;
          }
        }
      }) */
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
      // company={name: '', label:''}
      // debugger
      if(company) {
        const that=this
        this.loading = true;
        getCompanyByName({name: company.label})
          .then(res => {
            this.form.tin = res.data.tin;
            this.form.companyName = company.label;
            this.form.countryCode = res.data.countryCode;
            this.form.currency = res.data.currencyCode;
            that.addColumnByCompany(that.renderTaxDict(res.data.dicts))
          })
          .finally(() => {
            this.loading = false;
          })
      }
    },
    // 处理选择公司后的数据，返回税种code
    renderTaxDict(arry) {
      var tempDatalist=[]
      for(let i=0;i<arry.length;i++) {
        tempDatalist.push({
          taxDict:arry[i].code
        })
      }
      return tempDatalist
    },
    /* 财务报表上传成功 */
    financeUploadSuc(res) {
      if (res && res.status == 1) {
        return this.$Message.error(res.errMsg);
      }else{
        this.$Message.info("操作成功");
        this.form.financialReport = res.data.id;
        this.form.financialReportPath = res.data.fileName;
      }

    },
    /* 税金申请 - 文件上传 */
    uploadSuc(res) {
      let key = {
        'PRE_TAX_REPORT': 'preTaxReturns',
        'TAX_REPORT': 'taxReturns',
        'DONE_TAX_REPORT': 'paymentCertificate',
        'OTHER': 'otherUpload'
      }[res.data.materialTypeDict];
      if(res.data.materialTypeDict=="OTHER") {
        this.fileUploadForm[key] = res.data.id;
        this.fileUploadForm[key + 'Id'] = res.data.fileName;
      }else {
        this.fileUploadForm[key] = res.data.id;
        this.fileUploadForm[key + 'Path'] = res.data.fileName;
      }
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
      this.data[uploadColomunIndex].otherUpload = this.fileUploadForm.otherUpload;
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
      console.log("1111",this.data)
      let params = {...this.form, details: this.data};
      params.executeType = save === 'save' ? 0 : 1;
      // 公司
        if (!params.companyId) {
          this.$Message.error('请选择公司');
          return;
        }
        // 审核人
        if (!params.currentHandler) {
          this.$Message.error('请选择审核人');
          return;
        }
      // 请上传财务报表
      if (!params.financialReport) {
        this.$Message.error('请上传财务报表');
        return;
      }
        // 所属期间字段显示月份，但提交后台需要精确值日
        let dateVerity = params.details.some(item => {
          return !item.taxPeriod
        })
        if (dateVerity) {
          this.$Message.error('请选择所属期间');
          return;
        }
        params.details.map(item => {
          if(item.taxPeriod.indexOf('-01-01') > 1){

          }else{
            item.taxPeriod = item.taxPeriod && item.taxPeriod + '-01';
          }
        });
        // 税种
        let shuizhong = params.details.some(item => {
          return !item.taxDict
        })
        if (shuizhong) {
          this.$Message.error('请选择税种');
          return;
        }

      //  缴款截止日期
      let jnjzrq = params.details.some(item => {
        return !item.deadline
      })
      if (jnjzrq) {
        this.$Message.error('请选择缴款截止日期');
        return;
      }
      //实际缴纳日期
      let sjjnrqi = params.details.some(item => {
        return !item.paymentTime
      })
      if (sjjnrqi) {
        this.$Message.error('请选择缴款截止日期');
        return;
      }
      // 税种预审报表
      let preTaxReturnsVerity = params.details.some(item => {
        return !item.preTaxReturns;
      });
      if (preTaxReturnsVerity) {
        this.$Message.error('请上传每个税种的预申报表');
        return;
      }

      this.loading = true;
      let fn = this.$route.params.type === 'readyCommit' ? taxEdit : taxAdd;
      fn(params).then(res => {
        // this.reload()
        this.form={
          companyId: '',
          companyName: '',
          tin: '',
          countryCode: '',
          currency: '',
          applicantName: '',
          remarks: '',
          currentHandler: '',
          financialReport: '',
          financialReportPath: '',
          status:0
        }
        this.data=[{ taxPeriod: '',
                taxDict: '',
                payableTax: 0,
                lateFeePayable: 0,
                applTaxPayment: 0,
                deadline: '',
                taxPaid: 0,
                overduePayment: 0,
                paymentTime: '',
                taxReturns: "",
                remarks: '',
                status:0
              }]
        // this.$forceUpdate()
        this.$Message.success('操作成功')
      }).finally(() => {
        this.loading = false;
      })
      // this.handleReset('form')
      // this.data = []
    },
    handleReset(formName) {
        this.$refs[formName].resetFields();
    },
    reload() {
      this.isRouterAlive = false
      this.$nextTick(() => {
        this.isRouterAlive = true
      this.$forceUpdate()
      })
    }
  },
  mounted() {
    this.init();
    this.userInfo = JSON.parse(Cookies.get("userInfo"));
    console.log("1212",this.$route)
  },
  updated:function() {
    // console.log("update",this.data)
    var  payableTaxALL=0 // 应缴税额合计
    var  lateFeePayable=0// 应缴滞纳金合计
    var  applTaxPayment=0 // 申请纳税款合计
    var  taxPaid=0 // 实缴税款合计
    var  overduePayment=0 //实缴滞纳金合计
    var  taxsjsk=0 // 实缴税款合计
    for(let i=0;i<this.data.length;i++) {
        payableTaxALL+=this.data[i].payableTax
        lateFeePayable+=this.data[i].lateFeePayable
        applTaxPayment=payableTaxALL+lateFeePayable
        taxPaid+=this.data[i].taxPaid
        overduePayment+=this.data[i].overduePayment
        taxsjsk=taxPaid+overduePayment
    }
    document.getElementById("payableTaxALL").innerHTML=payableTaxALL
    document.getElementById("lateFeePayable").innerHTML=lateFeePayable
    document.getElementById("applTaxPayment").innerHTML=applTaxPayment
    document.getElementById("taxPaid").innerHTML=taxPaid
    document.getElementById("overduePayment").innerHTML=overduePayment
    document.getElementById("taxsjsk").innerHTML=taxsjsk
  }
}
</script>
