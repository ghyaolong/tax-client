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
            <AutoComplete
                v-model="submitData.companyName"
                :data="companyListName"
                :filter-method="filterMethod"
                placeholder="请输入公司名称"
                style="width:200px">
            </AutoComplete>
          <!-- <Input  placeholder="请输入公司名称" v-model="submitData.companyName"></Input> -->
          </Form-item>
          <Form-item label="流程状态"  prop="flowStatus">
            <Select  placeholder="请选择" style="width: 200px" v-model="submitData.flowStatus">
              <Option value="1">已完结</Option>
              <Option value="0">审批中</Option>
            </Select>
          </Form-item>
          <Form-item label="申请人" prop="applicantName">
            <AutoComplete
                v-model="submitData.applicantName"
                :data="userListName"
                :filter-method="filterMethod"
                placeholder="请输入申请人"
                style="width:200px">
            </AutoComplete>
            <!-- <Input  placeholder="请输入申请人" v-model="submitData.applicationName"></Input> -->
          </Form-item>
          <Form-item label="流水号" prop="serialNumber">
            <Input  placeholder="请输入流水号" v-model="submitData.serialNumber" :maxlength="30"></Input>
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
            <!--startprint1-->
             <table width="1182" height="625" class="taxesTables">
                <tbody>
                  <tr>
                  <td colspan="12" width="1124" style="text-align:center;font-size:22px;font-weight:bold;">税金申请表单</td>
                </tr>
                <tr>
                  <td width="82">公司名称</td>
                  <td colspan="5" width="504">{{tableList[0].companyName}}</td>
                  <td width="100">税务识别号码</td>
                  <td colspan="5" width="502">{{tableList[0].tin}}</td>
                </tr>
                <tr>
                  <td width="82">国家</td>
                  <td colspan="5" width="504">{{tableList[0].countryName}}</td>
                  <td width="72">币种</td>
                  <td colspan="5" width="502">{{dictCurrencysMap.get(tableList[0].currency)}}</td>
                </tr>
                <tr>
                  <td width="82">申请人</td>
                  <td colspan="5" width="504">{{tableList[0].applicantName}}</td>
                  <td width="72">备注</td>
                  <td colspan="5" width="502">{{tableList[0].remarks}}</td>
                </tr>
                <tr>
                  <td width="82" >财务报表</td>
                  <td colspan="5" style="border-right-color:#fff">{{tableList[0].oriName}}</td>
                  <td style="border-right-color:#fff" class="myspan" @click="priviewFile(tableList[0].financialReportPath)">预览</td>
                  <!-- <td class="myspan" @click="uploadFile(tableList[0].financialReportPath)">下载</td> -->
                </tr>
                <tr>
                  <td width="82">所属期间</td>
                  <td width="60">税种</td>
                  <td width="80">应缴税额</td>
                  <td width="80">应缴滞纳金</td>
                  <td width="100">申请缴纳税款</td>
                  <td width="100">缴款截止日期</td>
                  <td width="80">实缴税额</td>
                  <td width="80">实缴滞纳金</td>
                  <td width="100">实际缴纳税款</td>
                  <td width="100">实际缴纳时间</td>
                  <td width="100">附件</td>
                  <td width="120">备注</td>
                </tr>
                <tr v-for="(item,index) in tableList[0].details" :key="item.id">
                  <td >{{item.taxPeriod}}</td>
                  <td >{{dictTaxCategorysMap.get(item.taxDict)}}</td>
                  <td >{{item.payableTax}}</td>
                  <td >{{item.lateFeePayable}}</td>
                  <td >{{item.payableTax + item.lateFeePayable}}</td>
                  <td >{{`${item.deadline && new Date(item.deadline).format()}`}}</td>
                  <td >{{item.taxPaid}}</td>
                  <td >{{item.overduePayment}}</td>
                  <td >{{item.taxPaid + item.overduePayment}}</td>
                  <td >{{`${item.paymentTime ? new Date(item.paymentTime).format():''}`}}</td>
                  <td >
                    <span class="myspan" @click="handleLook(item,index)">操作</span>
                  </td>
                  <td >{{item.remarks}}</td>
                </tr>
                <tr>
                  <td >合计</td>
                  <td ></td>
                  <td >{{ payableTaxAll }}</td>
                  <td >{{ lateFeePayableALL }}</td>
                  <td >{{ applTaxPaymentAll }}</td>
                  <td ></td>
                  <td >{{ taxPaidAll }}</td>
                  <td >{{ overduePaymentAll }}</td>
                  <td >{{ actualTaxPayment }}</td>
                  <td ></td>
                  <td ></td>
                  <td></td>
                </tr>
                <tr class="centerHeight">
                  <td ></td>
                  <td ></td>
                  <td ></td>
                  <td ></td>
                  <td ></td>
                  <td ></td>
                  <td ></td>
                  <td ></td>
                  <td ></td>
                  <td ></td>
                  <td ></td>
                  <td ></td>
                </tr>
                <tr class="center">
                  <td ></td>
                  <td >任务</td>
                  <td >角色名称</td>
                  <td >姓名</td>
                  <td >审批结论</td>
                  <td >意见</td>
                  <td >审批时间</td>
                  <td ></td>
                  <td ></td>
                  <td ></td>
                  <td ></td>
                  <td ></td>
                </tr>
                <tr class="center"  v-for="row in infoList" >
                  <td ></td>
                  <td>{{row.taskName}}</td>
                  <td >{{row.roleName}}</td>
                  <td >{{row.name}}</td>
                  <td>{{row.auditResult}}</td>
                  <td >{{row.advice}}</td>
                  <td >{{`${row.auditDate && new Date(row.auditDate).format()}`}}</td>
                  <td ></td>
                  <td ></td>
                  <td ></td>
                  <td ></td>
                  <td ></td>
                </tr>
              </tbody>
              </table>
              <!--endprint1-->
          </main>
          <footer class="vertical-center" slot="footer">
              <Button style="width: 100px;" @click="handleDayin">打印</Button>
              <Button type="primary"  style="width: 100px;margin-left:158px" @click="handleExport">导出</Button>
          </footer>
    </Modal>
    <Modal
        :closable="false"
        class-name="preview-modal-inline"
        v-model="showUploadModal">
        <Form label-position="left" :label-width="100" :modal="fileUploadForm"  ref="showUploadRefs">
          <FormItem label="预申报表" prop="preTaxReturnsPath">
            <Input type="text" disabled v-model="fileUploadForm.preTaxReturnsPathFileName" style="width:150px;float:left"/>
            <!-- <Upload action="/api/file/upload" :headers="{accessToken: accessToken}" name="file"
            :data="{materialTypeDict: 'PRE_TAX_REPORT'}" :show-upload-list="false"
            :on-success="uploadSuc" style="float:left">
              <Button icon="ios-cloud-upload-outline">上传文件</Button>
            </Upload> -->
            <Button   @click.stop="priviewFile(fileUploadForm.preTaxReturnsPath)">预览</Button>
            <!-- <Button   @click.stop="uploadFile(fileUploadForm.preTaxReturnsPath)">下载</Button> -->
          </FormItem>
          <FormItem label="申报表" prop="taxReturnsPath">
            <Input type="text" disabled v-model="fileUploadForm.taxReturnsPathFileName" style="width:150px;float:left"/>
            <!-- <Upload action="/api/file/upload"
            :headers="{accessToken: accessToken}" name="file"
            :data="{materialTypeDict: 'TAX_REPORT'}" :show-upload-list="false"
            :on-success="uploadSuc" style="float:left">
              <Button icon="ios-cloud-upload-outline">上传文件</Button>
            </Upload> -->
            <Button  @click.stop="priviewFile(fileUploadForm.taxReturnsPath)">预览</Button>
            <!-- <Button  @click.stop="uploadFile(fileUploadForm.taxReturnsPath)">下载</Button> -->
          </FormItem>
          <FormItem label="完税申报表" prop="paymentCertificatePath">
            <Input type="text" disabled v-model="fileUploadForm.paymentCertificatePathFileName" style="width:150px;float:left"/>
            <!-- <Upload action="/api/file/upload"
            :headers="{accessToken: accessToken}" name="file"
            :data="{materialTypeDict: 'DONE_TAX_REPORT'}" :show-upload-list="false"
            :on-success="uploadSuc" style="float:left">
              <Button icon="ios-cloud-upload-outline">上传文件</Button>
            </Upload> -->
            <Button  @click.stop="priviewFile(fileUploadForm.paymentCertificatePath)">预览</Button>
            <!-- <Button  @click.stop="uploadFile(fileUploadForm.paymentCertificatePath)">下载</Button> -->
          </FormItem>
          <FormItem label="其它" prop="otherUploadIdPath">
            <Input type="text" disabled v-model="fileUploadForm.otherUploadFileName" style="width:150px;float:left"/>
            <!-- <Upload action="/api/file/upload" :headers="{accessToken: accessToken}" name="file"
            :data="{materialTypeDict: 'OTHER'}" :show-upload-list="false"
            :on-success="uploadSuc" style="float:left">
              <Button icon="ios-cloud-upload-outline">上传文件</Button>
            </Upload> -->
            <Button @click.stop="priviewFile(fileUploadForm.otherUploadId)">预览</Button>
            <!-- <Button  @click.stop="uploadFile(fileUploadForm.otherUploadId)">下载</Button> -->
          </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
import { taxAlreadyHandle,getTaxAuditLog,getAllCompany,getUserListData,exportExcel,getDictListDataByType } from "@/api/index.js";
import Cookies from "js-cookie";
import fileLoadPath from '@/api/fileload';
import { getStore } from '@/libs/storage';
import { Base64 } from 'js-base64';
import { dictType } from '@/libs/constance.js'
export default {
  name: "taxAlreadyHandle",
  data() {
    return {
      accessToken: getStore('accessToken'),
      showUploadModal:false,
      tableList:[],
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
            let flowNum = params.row.taxApplicationVo.businessFlowNumber;
            return h(
              "div",
              {
                style: {
                  textAlign: "center",
                }
              },
              [
                h(
                  "Button",
                  {
                    props: {
                      type: "text",
                      size: "small",
                    },
                    style: {
                      color:'#2d8cf0',
                      cursor: 'pointer'
                    },
                    on: {
                      click: () => {
                        this.changeNo(params.row);
                      }
                    }
                  },
                  flowNum
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
          key: "createTime",
          render: (h, params) => {
            return h(
              "div",
              params.row.createTime && new Date(params.row.createTime).format()
            );
          }
          // width: 110
        },{
          title:"处理环节",
          key:"currentLink",
          render:(h,params) => {
            return h('div', this.renderCnName(params.row.currentLink))
          }
        },{
          title:"当前处理人",
          key:"currentHandler"
        }
        // {
        //   title: '操作',
        //   width: 130,
        //   align: "center",
        //   render: (h, params) => {
        //     return h("div", [
        //         h(
        //           "Button",
        //           {
        //             props: {
        //               type: "primary",
        //               size: "small"
        //             },
        //             style: {
        //               marginRight: "5px"
        //             },
        //             on: {
        //               click: () => {
        //
        //               }
        //             }
        //           },
        //           "编辑"
        //         ),
        //         h(
        //           "Button",
        //           {
        //             props: {
        //               type: "error",
        //               size: "small"
        //             },
        //             on: {
        //               click: () => {
        //                 // this.remove(params.row);
        //               }
        //             }
        //           },
        //           "删除"
        //         )
        //       ]);
        //   }
        // }
      ],
      data: [],
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      submitData:{
        selectDate:"",
        companyName:"",
        serialNumber:"",
        applicantName:"",
        flowStatus:""
      },
      userInfo:{},
       payableTaxAll:0,//应缴税额合计
       lateFeePayableALL:0,  //应缴滞纳金合计
       applTaxPaymentAll:0,  //申请缴纳税款合计
       taxPaidAll:0,   //实缴税额合计    taxPaid
       overduePaymentAll:0,// 实缴滞纳金合计   overduePayment
       actualTaxPayment:0,//实际缴纳税款合计
       fileUploadForm :{
         uploadFileIndex:null,
         preTaxReturns:"",
         preTaxReturnsPath:"",
         taxReturns:"",
         taxReturnsPath:"",
         paymentCertificate:"",
         paymentCertificatePath:"",
         otherUpload:"",
         otherUploadId:""
       },
       companyList:[],
       companyListName:[],
       userList:[],
       userListName:[],
       exportObj:{},
       dictCurrencys:[],
       dictCurrencysMap:"",
       dictTaxCategorys:[],
       dictTaxCategorysMap:""
    };
  },
  methods: {
    handleExport() {
      console.log("this.exportObj",this.exportObj)
      // console.log(this.exportObj)
      // let tempObj = this.exportObj.taxApplicationVo
      // let tempInfo = this.exportObj.auditLogVoList
      // tempInfo.map((item,index)=>{
      //   item.auditDate = item.auditDate && new Date(item.auditDate).format()
      // })
      // tempObj.details.map((item,index)=>{
      //     item.deadline = item.deadline && new Date(item.deadline).format()
      //     item.paymentTime = item.paymentTime && new Date(item.paymentTime).format()
      //     item.applTaxPayment = item.payableTax + item.lateFeePayable
      //     item.actualTaxPayment = item.taxPaid + item.overduePayment
      // })
      // let params ={
      //   companyName: tempObj.companyName,
      //   tin: tempObj.tin,
      //   countryCode: tempObj.countryCode,
      //   applicantName: tempObj.applicantName,
      //   remarks: tempObj.remarks,
      //   currency: tempObj.currency,
      //   details:tempObj.details,
      //   auditLogVoList:tempInfo
      // }

      // exportObj(params)
      // var stating = `/api/process/exportExcel?companyName=${params.companyName}&tin=${params.tin}&countryCode=${params.countryCode}&applicantName=${params.applicantName}&remarks=${params.remarks}&currency=${params.currency}&details=${params.details}&auditLogVoList=${params.auditLogVoList}`
      // console.log(JSON.stringify(params))


      // var string = JSON.stringify(params);
      // window.location.href = `/api/process/exportExcel/${Base64.encode(string)}`
      let procInstId = this.exportObj.procInstId
      let userId = this.userInfo.id
      window.location.href=`/api/process/exportExcel/${procInstId}/${userId}`
      // window.open(`process/exportExcel/${procInstId}/${userId}`)
      // exportExcel({procInstId:procInstId,userId:userId})
    },
    filterMethod (value, option) {
          return option.toUpperCase().indexOf(value.toUpperCase()) !== -1;
    },
    // 根据名称获取id
    renderIdByName(dataList,name) {
      var submitID = ""
      dataList.map((item,index)=>{
        if(item.name==name) {
          submitID = item.id
        }
      })
      return submitID
    },
    // 根据用户名称获取用户id
    renderUserIdByName(dataList,name) {
      var submitID = ""
      dataList.map((item,index)=>{
        if(item.realName==name) {
          submitID = item.id
        }
      })
      return submitID
    },
    renderCnName(key) {
      if(key) {
        let obj = {
          none:'无',
          approvalProcess:'发起申请',
          reviewProcess:'税金核查1',
          checkEntity:'税金核查2',
          examineEntity:'税金核查3',
          checkPay:'资金审视',
          approvalPay:'税金审批',
          reportPaid:"上报实缴，并补全资料",
          over:"已完结"
        }
        return obj[key]
      }
    },
    // 预览
      priviewFile(v) {
        console.log("预览",v)
        const that = this;
        if(v){
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
        }else{
          this.$Message.error("没有上传文件!");
        }
      },
    // 下载
    uploadFile(path) {
      if(path){
        let baseurl = fileLoadPath.loadFilePath
        window.open(baseurl+path)
      }else{
        this.$Message.error("没有上传文件!");
      }
    },
    // 操作
    handleLook(item,index) {
      console.log('item',item)
      this.fileUploadForm = {
        uploadFileIndex:index,
        preTaxReturns:item.preTaxReturns,
        preTaxReturnsPath:item.preTaxReturnsPath,
        preTaxReturnsPathFileName:item.preTaxReturnsPathFileName,
        taxReturns:item.taxReturns,
        taxReturnsPath:item.taxReturnsPath,
        taxReturnsPathFileName:item.taxReturnsPathFileName,
        paymentCertificate:item.paymentCertificate,
        paymentCertificatePath:item.paymentCertificatePath,
        paymentCertificatePathFileName:item.paymentCertificatePathFileName,
        otherUploadId:item.otherUploadId,
        otherUploadPath:item.otherUploadPath,
        otherUploadFileName:item.otherUploadFileName,
      }
      this.showUploadModal = true
    },
    // 打印
    handleDayin() {
      window.print();
    },
    // 下载
    handleLoad(item){

    },
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
      // this.getTaxAuditLog(val.id)
      console.log("val",val)
      this.exportObj = val;
      this.tableList=[val.taxApplicationVo]
      var tempData=val.taxApplicationVo.details
      var  payableTaxALL=0 // 应缴税额合计
      var  lateFeePayable=0// 应缴滞纳金合计
      var  applTaxPayment=0 // 申请纳税款合计
      var  taxPaid=0 // 实缴税款合计
      var  overduePayment=0 //实缴滞纳金合计
      var  taxsjsk=0 // 实缴税款合计
      for(let i=0;i<tempData.length;i++) {
          payableTaxALL+=parseFloat(tempData[i].payableTax?tempData[i].payableTax:0)
          lateFeePayable+=parseFloat(tempData[i].lateFeePayable?tempData[i].lateFeePayable:0)
          applTaxPayment=parseFloat(payableTaxALL)+parseFloat(lateFeePayable)
          taxPaid+=parseFloat(tempData[i].taxPaid?tempData[i].taxPaid:0)
          overduePayment+=parseFloat(tempData[i].overduePayment?tempData[i].overduePayment:0)
          taxsjsk=parseFloat(taxPaid)+parseFloat(overduePayment)
      }
      this.payableTaxAll=payableTaxALL.toFixed(2)               //应缴税额合计
      this.lateFeePayableALL=lateFeePayable.toFixed(2)                      //应缴滞纳金合计
      this.applTaxPaymentAll=applTaxPayment.toFixed(2)                   //申请缴纳税款合计
      this.taxPaidAll=taxPaid.toFixed(2)                        //实缴税额合计    taxPaid
      this.overduePaymentAll= overduePayment.toFixed(2)                     // 实缴滞纳金合计   overduePayment
      this.actualTaxPayment=taxsjsk.toFixed(2)               //实际缴纳税款合计
      this.infoList=val.auditLogVoList
      this.showTaxes = true;
    },
    init() {
      this.initPageData();
      getDictListDataByType(dictType.currency)
        .then(res => {
          let map = new Map()
          this.dictCurrencys = res.data;
          res.data.map((item,index)=>{
            map.set(item.code,item.name)
          })
          this.dictCurrencysMap = map
        });
      getDictListDataByType(dictType.taxCategory)
        .then(res => {
          this.dictTaxCategorys = res.data;
          let maps = new Map()
          res.data.map((item,index)=>{
            maps.set(item.code,item.name)
          })
          this.dictTaxCategorysMap = maps
        })
    },
    initPageData() {
      this.loading = true;
      let params = {
        pageVo: {
          pageNumber: this.pageNumber,
          pageSize: this.pageSize
        },
        searchVo: {
          userId:this.userInfo.id,
          currentHandler:this.userInfo.id,
          startDate: this.startDate,
          endDate: this.endDate,
          flowStatus:this.submitData.flowStatus,
          companyName:this.submitData.companyName,
          serialNumber:this.submitData.serialNumber,
          applicantName:this.submitData.applicantName,
          companyId:this.submitData.companyName && this.renderIdByName(this.companyList,this.submitData.companyName),
          applicationId:this.submitData.applicantName && this.renderUserIdByName(this.userList,this.submitData.applicantName),
        }
      };
      taxAlreadyHandle(params)
        .then(res => {
          this.total = res.data.total;
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
  },
  created:function(){
    this.userInfo = JSON.parse(Cookies.get("userInfo"));
    // 获取全部公司
    getAllCompany()
      .then(res => {
        var tempArry = []
        res.data.map((item)=>{
          tempArry.push(item.name)
        })
        this.companyListName=tempArry
        this.companyList = res.data;
      })
    // 获取全部用户
    let params = {
      pageVo: {
        pageNumber: 1,
        pageSize: 99999
      },
      userVo: {
        username: '',
        sex: '',
        tel: '',
        email: '',
        realName: '',
        workNumber: ''
      },
      searchVo: {
        startDate: '',
        endDate: ''
      }
    }
    getUserListData(params).then(res =>{
      var tempArry = []
      res.data.list.map((item)=>{
        tempArry.push(item.realName)
      })
      this.userList = res.data.list
      this.userListName = tempArry
    })
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
  .myspan {
    cursor: pointer;
    color:rgb(45, 140, 240);
    padding: 2px;
  }

}
</style>
