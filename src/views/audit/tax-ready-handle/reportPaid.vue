<template>
  <div class="box">
    <div class="dataDetils">
      <table width="100%" height="auto" class="taxesTables">
         <tbody>
           <tr>
           <td colspan="12" width="1124" style="text-align:center;font-size:22px;font-weight:bold;">税金申请表单</td>
         </tr>
         <tr>
           <td width="82">公司名称</td>
           <td colspan="5" width="504">{{dataDetils.companyName}}</td>
           <td width="100">税务识别号码</td>
           <td colspan="5" width="502">{{dataDetils.tin}}</td>
         </tr>
         <tr>
           <td width="82">国家</td>
           <td colspan="5" width="504">{{dataDetils.countryName}}</td>
           <td width="72">币种</td>
           <td colspan="5" width="502">{{dataDetils.currency}}</td>
         </tr>
         <tr>
           <td width="82">申请人</td>
           <td colspan="5" width="504">{{dataDetils.applicantName}}</td>
           <td width="72">备注</td>
           <td colspan="5" width="502">{{dataDetils.remarks}}</td>
         </tr>
         <tr>
           <td width="82" >财务报表</td>
           <td colspan="5" style="border-right-color:#fff">{{dataDetils.financialReportPath}}</td>
           <td style="border-right-color:#fff" class="myspan" @click="priviewFile(dataDetils.financialReportPath)">预览</td>
           <td class="myspan" @click="uploadFile(dataDetils.financialReportPath)">下载</td>
         </tr>
       </tbody>
       </table>
    </div>
    <div class="details">
      <Table  border :columns="detailsColumns" :data="details" ref="table" sortable="custom" id="myTable"></Table>
    </div>
    <div class="auditLogVoList">
      <Table  border :columns="auditLogVoListColumns" :data="auditLogVoList"  sortable="custom" ></Table>
    </div>
    <Modal
        :closable="false"
        class-name="preview-modal-inline"
        v-model="showUploadModal">
        <Form label-position="left" :label-width="100" :modal="fileUploadForm" ref="showUploadRefs">
          <FormItem label="预申报表" prop="preTaxReturnsPath">
            <Input type="text" disabled v-model="fileUploadForm.preTaxReturnsPath" style="width:150px;float:left"/>
            <!-- <Upload action="/api/file/upload" :headers="{accessToken: accessToken}" name="file"
            :data="{materialTypeDict: 'PRE_TAX_REPORT'}" :show-upload-list="false"
            :on-success="uploadSuc" style="float:left">
              <Button icon="ios-cloud-upload-outline" v-if="currentLinkType=='uploadPayFile'">上传文件</Button>
            </Upload> -->
            <Button   @click.stop="priviewFile(fileUploadForm.preTaxReturnsPath)">预览</Button>
            <Button   @click.stop="uploadFile(fileUploadForm.preTaxReturnsPath)">下载</Button>
          </FormItem>
          <FormItem label="申报表" prop="taxReturnsPath">
            <Input type="text" disabled v-model="fileUploadForm.taxReturnsPath" style="width:150px;float:left"/>
            <Upload action="/api/file/upload"

            :data="{materialTypeDict: 'TAX_REPORT'}" :show-upload-list="false"
             style="float:left">
              <Button icon="ios-cloud-upload-outline" v-if="currentLinkType=='uploadPayFile'">上传文件</Button>
            </Upload>
            <Button  @click.stop="priviewFile(fileUploadForm.taxReturnsPath)">预览</Button>
            <Button  @click.stop="uploadFile(fileUploadForm.taxReturnsPath)">下载</Button>
          </FormItem>
          <FormItem label="完税申报表" prop="paymentCertificatePath">
            <Input type="text" disabled v-model="fileUploadForm.paymentCertificatePath" style="width:150px;float:left"/>
            <Upload action="/api/file/upload"
             name="file"
            :data="{materialTypeDict: 'DONE_TAX_REPORT'}" :show-upload-list="false"
             style="float:left">
              <Button icon="ios-cloud-upload-outline" v-if="currentLinkType=='uploadPayFile'">上传文件</Button>
            </Upload>
            <Button  @click.stop="priviewFile(fileUploadForm.paymentCertificatePath)">预览</Button>
            <Button  @click.stop="uploadFile(fileUploadForm.paymentCertificatePath)">下载</Button>
          </FormItem>
          <FormItem label="其它" prop="otherUploadId">
            <Input type="text" disabled  v-model="fileUploadForm.otherUploadId"  style="width:150px;float:left"/>
            <Upload action="/api/file/upload"
             name="file"
            :data="{materialTypeDict: 'OTHER'}" :show-upload-list="false"
             style="float:left">
              <Button icon="ios-cloud-upload-outline" v-if="currentLinkType=='uploadPayFile'">上传文件</Button>
            </Upload>
            <Button @click.stop="priviewFile(fileUploadForm.otherUploadId)">预览</Button>
            <Button  @click.stop="uploadFile(fileUploadForm.otherUploadId)">下载</Button>
          </FormItem>
      </Form>
    </Modal>
    <div style="margin-top:30px">
        <Button type="primary" @click="handleSubmit">提交</Button>
    </div>
  </div>
</template>

<script>
import fileLoadPath from '@/api/fileload';
import { taxReadyHandle,getReviewer,dbrwAudit,lookLiuchengtu,getAllCompany,getUserListData } from '@/api/index.js'
import { getStore } from '@/libs/storage';
import Cookies from "js-cookie";
export default {
  data() {
    return {
      dataDetils:{},
      details:[],
      auditLogVoList:[],
      currentLinkType:"ABCDAS",
      showUploadModal:false,
      fileUploadForm:{
        preTaxReturns:"",
        preTaxReturnsPath:"",
        taxReturns:"",
        taxReturnsPath:'',
        paymentCertificate:"",
        paymentCertificatePath:"",
        otherUpload:"",
        otherUploadId:"",
      },
      auditLogVoListColumns:[
        {
          title:"任务",
          key:"taskName"
        },
        {
          title:"角色名称",
          key:"roleName"
        },
        {
          title:"姓名",
          key:"name"
        },
        {
          title:"审批结果",
          key:"auditResult"
        },
        {
          title:"意见",
          key:"advice"
        },
        {
          title:"审批时间",
          key:"auditDate",
          render:(h,parms)=>{
            return h('div',new Date(parms.row.auditDate).format())
          }
        }
      ],
      detailsColumns:[
          {
            title: '所属期间',
            key: "taxPeriod",
            width: 160,
            align: 'center',
            render:(h,params) => {
              if(params.row.taxPeriod) {
                return h('div', params.row.taxPeriod)
              }
            }
            // render: this.renderSelect
            // render: this.renderDatePicker
          },
          {
            title: '税种',
            key: "taxDict",
            align: 'center',
            width: 160,
            // render: this.renderSelect
          },
          {
            title: '应缴税额',
            key: "payableTax",
            align: 'center',
            width: 120,
            // render: this.renderInput
          },
          {
            title: '应缴滞纳金',
            key: "lateFeePayable",
            align: 'center',
            width: 120,
            // render: this.renderInput
          },
          {
            title: '申请缴纳税款',
            key: "applTaxPayment",
            align: 'center',
            width: 120,
            render: (h, params) => {
              return h('div', {
                domProps: {
                  innerText: parseFloat(params.row.payableTax) + parseFloat(params.row.lateFeePayable)
                }
              })
              return h('div', parseFloat(this.data[params.index].payableTax) + parseFloat(this.data[params.index].lateFeePayable))
            }
          },
          {
            title: '缴款截止日期',
            key: "deadline",
            width: 120,
            align: 'center',
            render: (h,params)=>{
              if(params.row.deadline) {
                return h('div',new Date(params.row.deadline).format())
              }
              return h('div')
            }
          },
          {
            title: '实缴税额',
            key: "taxPaid",
            align: 'center',
            width: 100,
            render: this.renderInput
            // render: (h, params) => {
            //   return h('div', params.row.taxPaid)
            // }
          },
          {
            title: '实缴滞纳金',
            key: "overduePayment",
            align: 'center',
            width: 100,
            render: this.renderInput
            // render: (h, params) => {
            //   return h('div', params.row.overduePayment)
            // }
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
            width: 120,
            render: (h,params)=>{
              if(params.row.paymentTime) {
                return h('div',new Date(params.row.paymentTime).format())
              }
              return h('div')
            }
          },
          {
            title:'操作',
            width:100,
            render: (h, params) => {
              return h('Button', {
                props: {
                  size: "small"
                },
                on: {
                  click:()=>{
                    console.log("adasdadasd",  this.dataDetils)
                    console.log('paramsparams',params)
                    this.fileUploadForm = {
                      preTaxReturns:this.dataDetils.details[params.index].preTaxReturns,
                      preTaxReturnsPath:this.dataDetils.details[params.index].preTaxReturnsPath,
                      taxReturns:this.dataDetils.details[params.index].taxReturns,
                      taxReturnsPath:this.dataDetils.details[params.index].taxReturnsPath,
                      paymentCertificate:this.dataDetils.details[params.index].paymentCertificate,
                      paymentCertificatePath:this.dataDetils.details[params.index].paymentCertificatePath,
                      otherUpload:this.dataDetils.details[params.index].otherUpload,
                      otherUploadId:this.dataDetils.details[params.index].otherUploadId,
                    }
                    this.showUploadModal = true
                  }
                }
              }, '操作')
            }
          },
          {
            title: '备注',
            key: "remarks",
            align: 'center',
            width: 160,
            // render: this.renderInput
          },
      ]
    }
  },
  methods:{
    // 操作
    handleSubmit(){
      console.log("adasd",this.dataDetils)
      let params = {
        operateApprove:'0',
        comment:"上报实缴",
        taskId:this.dataDetils.serialNumber,
        userId:this.userInfo.id,
        currentHandler:this.dataDetils.applicantId,
        bean:{
            details:this.dataDetils.details,
            applicantId: this.dataDetils.applicantId,
            applicantName: this.dataDetils.applicantName,
            companyId: this.dataDetils.companyId,
            companyName: this.dataDetils.companyName,
            countryCode: this.dataDetils.countryCode,
            countryName: this.dataDetils.countryName,
            currency: this.dataDetils.currency,
            currentHandler: this.dataDetils.currentHandler,
            currentLink: this.dataDetils.currentLink,
            deploymentId: this.dataDetils.deploymentId,
            executeType: this.dataDetils.executeType,
            filePath:this.dataDetils.filePath,
            financialReport: this.dataDetils.financialReport,
            financialReportPath:this.dataDetils.financialReportPath,
            id: this.dataDetils.id,
            remarks: this.dataDetils.remarks,
            serialNumber: this.dataDetils.serialNumber,
            status: this.dataDetils.status,
            tin: this.dataDetils.tin
        }
      }
      console.log('params',params)
      const that = this
      dbrwAudit(params).then(res=>{
        that.$Message.success("操作成功")
        this.dataDetils={}
        this.details = []
        this.auditLogVoList = []
      }).finally(() => {
        // this.loading = false;
      })
    },
    renderApplTaxPaymentALL(h, params) {
      if(params.row.applTaxPaymentALL) {
        return h('div', params.row.applTaxPaymentALL)
      }else{
        var tempSubmit=0
        this.details.map((item,index)=>{
          if(item.applTaxPaymentALL) {
            tempSubmit += item.applTaxPaymentALL
          }
        })
        return h('div', tempSubmit)
      }
    },
    /* 表格栏输入框渲染函数 */
    renderInput(h, params) {
      console.log("21212",params);
      let temp = null;
      if (params.row.taxDict) {
        return h('InputNumber', {
          props: {
            maxlength: 10,
            value: temp || Number(params.row[params.column.key])
          },
          on: {
            input: e => {
              params.row[params.column.key] = e;
              this.details[params.index] = params.row;
              var tempTaxPaid=0;
              var tempOverduePayment=0;
              this.details.map((item,index)=>{
                if(item.taxPaid){
                  tempTaxPaid += item.taxPaid
                  tempOverduePayment+= item.overduePayment
                }
              })
              this.details[this.details.length-1].tempTaxPaid=tempTaxPaid
              this.details[this.details.length-1].tempOverduePayment=tempOverduePayment
              console.log('this.details',this.details)
              this.$forceUpdate()
            }
          }
        })
      }
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
      for(let i=0;i<this.detailsColumns.length-1;i++) {
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
    inintPage() {
      let type = this.$route.params.type;
      const dataDetilInfo = this.$route.params.params && this.$route.params.params
      console.log("0000",this.$route.params.params)
      this.dataDetils = dataDetilInfo
      this.details = dataDetilInfo.details
      this.auditLogVoList = dataDetilInfo.auditLogVoList
    },
    // 预览
      priviewFile(v) {
        const that = this;
        let lastString = v.lastIndexOf(".")
        let filelastName = v.substr(lastString+1)
        if(filelastName=="png" || filelastName=="jpg" || filelastName=="jpeg") {
          let baseurl = fileLoadPath.loadFilePath
          window.open(`${baseurl}${v}?view`)
        }else{
          let base="/api"
          var xhr = new XMLHttpRequest();
          xhr.responseType = "blob";
            xhr.onreadystatechange = function(){
                if( xhr.readyState == 4){
                    if( xhr.status >= 200 && xhr.status < 300 || xhr.status == 304){
                      let blob = xhr.response
                      let imgTag = URL.createObjectURL(blob)
                      that.priviewFilePath=imgTag
                      window.open(imgTag)
                    }
                }
            };
            xhr.open("post",`${base}/previewFile`,true);
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.setRequestHeader("accessToken", this.accessToken);
            xhr.send(JSON.stringify({fileName:v}));
        }
      },
    // 下载
    uploadFile(path) {
      let baseurl = fileLoadPath.loadFilePath
      window.open(baseurl+path)
    },
    init() {
      this.inintPage()
      this.addTable()
    }
  },
  mounted(){
    this.init()
  },
  updated:function() {
    var  payableTaxALL=0 // 应缴税额合计
    var  lateFeePayable=0// 应缴滞纳金合计
    var  applTaxPayment=0 // 申请纳税款合计
    var  taxPaid=0 // 实缴税款合计
    var  overduePayment=0 //实缴滞纳金合计
    var  taxsjsk=0 // 实缴税款合计
    for(let i=0;i<this.details.length;i++) {
        payableTaxALL+=this.details[i].payableTax
        lateFeePayable+=this.details[i].lateFeePayable
        applTaxPayment=payableTaxALL+lateFeePayable
        taxPaid+=this.details[i].taxPaid
        overduePayment+=this.details[i].overduePayment
        taxsjsk=taxPaid+overduePayment
    }
    document.getElementById("payableTaxALL").innerHTML=payableTaxALL
    document.getElementById("lateFeePayable").innerHTML=lateFeePayable
    document.getElementById("applTaxPayment").innerHTML=applTaxPayment
    document.getElementById("taxPaid").innerHTML=taxPaid
    document.getElementById("overduePayment").innerHTML=overduePayment
    document.getElementById("taxsjsk").innerHTML=taxsjsk
  },
  created:function() {
    this.userInfo = JSON.parse(Cookies.get("userInfo"));
  }
}
</script>

<style scoped lang="less">
.box {
  background: #fff;
  padding: 10px;
}
.taxesTables {
  border-collapse:collapse;
  border:1px solid #e8eaec !important;
  color: #515a6e;
  // font-weight: bold;
   tr,td {
    text-align: center;
    height: 40px;
    border: 1px solid #e8eaec;
  }
  .centerHeight {
    height: 40px;
    td {
      border:none;
    }
  }
}
.myspan {
  cursor: pointer;
  color:rgb(45, 140, 240);
  padding: 2px;
}
.auditLogVoList {
  margin-top: 10px;
}
</style>
