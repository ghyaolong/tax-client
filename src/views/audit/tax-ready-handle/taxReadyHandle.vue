<style lang="less">
.vertical-center-modal{
  display: flex;
  align-items: center;
  justify-content: center;

  .ivu-modal{
    top: 0;
  }
}
.upload-box .ivu-upload-select {
  width: 200px;
}
.uploadFile-input {
  width: 200px;
}
</style>

<template>
  <div class="search">
    <Row>
      <Col>
      <Card>
        <Form inline :label-width="90" class="search-form" :model="submitData" ref="taxReadyHandleForm">
          <Form-item label="创建时间" prop="selectDate">
            <DatePicker type="daterange" v-model="submitData.selectDate" format="yyyy-MM-dd" clearable @on-change="selectDateRange" placeholder="选择起始时间" style="width: 200px"></DatePicker>
          </Form-item>
          <Form-item label="公司名称" prop="companyName">
            <Input v-model="submitData.companyName" placeholder="请输入公司名称"></Input>
          </Form-item>
          <Form-item label="申请人" prop="applicantName">
            <Input v-model="submitData.applicantName" placeholder="请输入申请人"></Input>
          </Form-item>
          <Form-item label="流水号" prop="serialNumber">
            <Input v-model="submitData.serialNumber" placeholder="请输入流水号"></Input>
          </Form-item>
          <Form-item style="margin-left:-35px;" class="br">
            <Button @click="initPageData" type="primary" icon="ios-search">搜索</Button>
            <Button @click="reSet"  >重置</Button>
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

      width="400">
      <Form :model="taxReadyHandle" :rules="taxReadyHandleValidate" ref="taxReadyHandlefrom">
        <FormItem label="操作" :label-width="100" prop="operateApprove">
          <Select v-model="taxReadyHandle.operateApprove" >
            <Option value="0" >同意</Option>
            <Option value="1" >拒绝</Option>
          </Select>
        </FormItem>
        <FormItem label="审批意见" :label-width="100" v-if="taxReadyHandle.operateApprove != '1'">
          <Input type="textarea" v-model="taxReadyHandle.comment" placeholder="请输入审批意见"></Input>
        </FormItem>
        <Form-item label="选择审核人" prop="currentHandler" v-if="taxReadyHandle.operateApprove != '1'" :label-width="100">
          <Select v-model="taxReadyHandle.currentHandler" >
            <Option v-for="item in reviewers" :value="item.id" :key="item.id">{{ item.realName }}</Option>
          </Select>
        </Form-item>
        <FormItem label="拒绝原因" v-if="taxReadyHandle.operateApprove === '1'" :label-width="100">
          <Input type="textarea" v-model="taxReadyHandle.comment" placeholder="请输入拒绝原因"></Input>
        </FormItem>
      </Form>
      <footer class="vertical-center" slot="footer">
          <Button style="width: 100px;" @click="handleRefuse">取消</Button>
          <Button type="primary"  style="width: 100px;margin-left:158px" @click="handleOk">同意</Button>
      </footer>
    </Modal>
    <Modal
      v-model="liuchengtu"
      title="流程图"
      class-name="vertical-center-modal"
      @on-ok="handleOkliuchengtu"
      @on-cancel="handleRefuseliuchengtu"
      width="600px"
      >
      <div style="height:500px">
        <img :src="liuchengtuInfo" width="100%" height="100%"/>
      </div>
    </Modal>
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
                  <td width="100">税务识别号码</td>
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
                  <td >{{item.taxDict}}</td>
                  <td >{{item.payableTax}}</td>
                  <td >{{item.lateFeePayable}}</td>
                  <td >{{item.applTaxPayment}}</td>
                  <td >{{`${new Date(item.deadline).format()}`}}</td>
                  <td >{{item.taxPaid}}</td>
                  <td>{{item.overduePayment}}</td>
                  <td>{{item.taxPaid + item.overduePayment}}</td>
                  <td >{{ `${new Date(item.paymentTime).format()}` }}</td>
                  <td >
                    <span class="myspan" @click="handleupLoad(tableList[0],index)">操作</span>
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
                  <td >审批结果</td>
                  <td >意见</td>
                  <td >审批时间</td>
                  <td ></td>
                  <td ></td>
                  <td ></td>
                  <td ></td>
                  <td ></td>
                </tr>
                <tr class="center"  v-for="row in shenpiyijian" :key="row.id">
                  <td ></td>
                  <td >{{row.taskName}}</td>
                  <td >{{row.roleName}}</td>
                  <td >{{row.name}}</td>
                  <td >{{row.auditResult}}</td>
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
          </main>
          <footer class="vertical-center" slot="footer">
            <Button style="width: 100px;" @click="fileuploadFormCancel">取消</Button>
            <Button type="primary" style="width: 100px;margin-left:20px" @click="fileUploadFormSubmit">确定</Button>
          </footer>
    </Modal>
    <!-- 上传modal -->
    <Modal
        :closable="false"
        class-name="preview-modal-inline"
        v-model="showUploadModal">
        <Form label-position="left" :label-width="100" :modal="fileUploadForm" :rules="fileUploadFormRules" ref="showUploadRefs">
          <FormItem label="预申报表" prop="preTaxReturnsPath">
            <Input type="text" disabled v-model="fileUploadForm.preTaxReturnsPath" style="width:150px;float:left"/>
            <Upload action="/api/file/upload" :headers="{accessToken: accessToken}" name="file"
            :data="{materialTypeDict: 'PRE_TAX_REPORT'}" :show-upload-list="false"
            :on-success="uploadSuc" style="float:left">
              <Button icon="ios-cloud-upload-outline">上传文件</Button>
            </Upload>
            <Button   @click.stop="priviewFile(fileUploadForm.preTaxReturnsPath)">预览</Button>
            <Button   @click.stop="uploadFile(fileUploadForm.preTaxReturnsPath)">下载</Button>
          </FormItem>
          <FormItem label="申报表" prop="taxReturnsPath">
            <Input type="text" disabled v-model="fileUploadForm.taxReturnsPath" style="width:150px;float:left"/>
            <Upload action="/api/file/upload"
            :headers="{accessToken: accessToken}" name="file"
            :data="{materialTypeDict: 'TAX_REPORT'}" :show-upload-list="false"
            :on-success="uploadSuc" style="float:left">
              <Button icon="ios-cloud-upload-outline">上传文件</Button>
            </Upload>
            <Button  @click.stop="priviewFile(fileUploadForm.taxReturnsPath)">预览</Button>
            <Button  @click.stop="uploadFile(fileUploadForm.taxReturnsPath)">下载</Button>
          </FormItem>
          <FormItem label="完税申报表" prop="paymentCertificatePath">
            <Input type="text" disabled v-model="fileUploadForm.paymentCertificatePath" style="width:150px;float:left"/>
            <Upload action="/api/file/upload"
            :headers="{accessToken: accessToken}" name="file"
            :data="{materialTypeDict: 'DONE_TAX_REPORT'}" :show-upload-list="false"
            :on-success="uploadSuc" style="float:left">
              <Button icon="ios-cloud-upload-outline">上传文件</Button>
            </Upload>
            <Button  @click.stop="priviewFile(fileUploadForm.paymentCertificatePath)">预览</Button>
            <Button  @click.stop="uploadFile(fileUploadForm.paymentCertificatePath)">下载</Button>
          </FormItem>
          <FormItem label="其它" prop="otherUploadIdPath">
            <Input type="text" disabled v-model="fileUploadForm.otherUploadIdPath" style="width:150px;float:left"/>
            <Upload action="/api/file/upload" :headers="{accessToken: accessToken}" name="file"
            :data="{materialTypeDict: 'OTHER'}" :show-upload-list="false"
            :on-success="uploadSuc" style="float:left">
              <Button icon="ios-cloud-upload-outline">上传文件</Button>
            </Upload>
            <Button @click.stop="priviewFile(fileUploadForm.otherUploadIdPath)">预览</Button>
            <Button  @click.stop="uploadFile(fileUploadForm.otherUploadIdPath)">下载</Button>
          </FormItem>
      </Form>
      <footer class="vertical-center" slot="footer">
          <Button style="width: 100px;"  @click="fileuploadFormCancel">取消</Button>
          <Button type="primary" style="width: 100px;margin-left:20px" @click="tempSubmitOk">确定</Button>
      </footer>
    </Modal>
  </div>
</template>

<script>
import { taxReadyHandle,getReviewer,dbrwAudit,lookLiuchengtu } from '@/api/index.js'
import Cookies from "js-cookie";
import { getStore } from '@/libs/storage';
import fileLoadPath from '@/api/fileload';
export default {
  name: 'taxReadyHandle',
  data() {
    return {
      showUploadModal:false,
      accessToken: getStore('accessToken'),
      loading: false,
      handelModal: false,
      userInfo:{},
      reviewers:[],
      taxReadyHandle: {
      	operateApprove:"",
      	comment:"",
      	userId:"",
      	currentHandler:"",
      },
      taxReadyHandleValidate: {
        operateApprove:[{required:true,message:"请选择",trigger: 'blur'}],
        currentHandler:[{required:true,message:"请选择",trigger: 'blur'}]
      },
      fileUploadFormRules:{
        preTaxReturnsPath:[{required:true,message:"请上传",trigger: 'blur'}],
        taxReturnsPath:[{required:true,message:"请上传",trigger: 'blur'}],
        paymentCertificatePath:[{required:true,message:"请上传",trigger: 'blur'}],
      },
      fileUploadForm:{
        preTaxReturns:"",
        preTaxReturnsPath:"",
        taxReturns:"",
        taxReturnsPath:'',
        paymentCertificate:"",
        paymentCertificatePath:"",
        otherUploadId:"",
        otherUploadPath:"",
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
          render:(h,params) =>{
            return h("span",
                    {
                      style:{
                        color:'#2d8cf0',
                        cursor: 'pointer'
                      },
                      on:{
                        click:()=>{
                          this.handleLook(params.row)
                        }
                      }
                    },params.row.serialNumber)
          }
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
            return h('div', params.row.creatTime && new Date(params.row.creatTime).format())
          }
          // width: 110
        },
        {
          title:"当前环节",
          key:"currentLink"
        },
        {
          title: '操作',
          width: 200,
          align: "center",
          render: (h, params) => {
            if(params.row.status==3){
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
                        type: "primary",
                        size: "small"
                      },
                      style: {
                        marginRight: "5px"
                      },
                      on: {
                        click: () => {
                          this.handleLIUCHENGTU(params.row);
                        }
                      }
                    },
                    "流程图"
                  )
                ]);
            }else{
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
                  ),
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
                          this.handleLIUCHENGTU(params.row);
                        }
                      }
                    },
                    "流程图"
                  )
                ]);
            }

          }
        }
      ],
      data: [],
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      showTaxes:false,
      tableList:[],
      submitData:{
        companyName:"",
        applicantName:"",
        serialNumber:"",
        selectDate:""
      },
      submitInfo:{},
      liuchengtu:false, // 流程图弹出窗
      liuchengtuInfo:"", // 流程图内容
      payableTaxAll:0,//应缴税额合计
      lateFeePayableALL:0,  //应缴滞纳金合计
      applTaxPaymentAll:0,  //申请缴纳税款合计
      taxPaidAll:0,   //实缴税额合计    taxPaid
      overduePaymentAll:0,// 实缴滞纳金合计   overduePayment
      actualTaxPayment:0,//实际缴纳税款合计
      shenpiyijian:[], // 审批意见
      tempInfoValue:{}, // 临时的详情数据
    }
  },
  methods: {
    // 上传成功
    uploadSuc(res) {
      console.log('1231231',res)
      let key = {
        'PRE_TAX_REPORT': 'preTaxReturns',
        'TAX_REPORT': 'taxReturns',
        'DONE_TAX_REPORT': 'paymentCertificate',
        'OTHER': 'otherUploadId'
      }[res.data.materialTypeDict];
      this.fileUploadForm[key] = res.data.id;
      this.fileUploadForm[key + 'Path'] = res.data.fileName;
    },
    // 取消
    fileuploadFormCancel() {
      this.showUploadModal = false
    },
    // 确定
    fileUploadFormSubmit() {
      console.log("fileUploadFormSubmit",this.tempInfoValue)
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
    // 查看详情
    handleLook(v) {
      this.tempInfoValue = v;
      let tempData = v.details;
      var  payableTaxALL=0 // 应缴税额合计
      var  lateFeePayable=0// 应缴滞纳金合计
      var  applTaxPayment=0 // 申请纳税款合计
      var  taxPaid=0 // 实缴税款合计
      var  overduePayment=0 //实缴滞纳金合计
      var  taxsjsk=0 // 实缴税款合计
      for(let i=0;i<tempData.length;i++) {
          payableTaxALL+=tempData[i].payableTax
          lateFeePayable+=tempData[i].lateFeePayable
          applTaxPayment=payableTaxALL+lateFeePayable
          taxPaid+=tempData[i].taxPaid
          overduePayment+=tempData[i].overduePayment
          taxsjsk=taxPaid+overduePayment
      }
      this.payableTaxAll=payableTaxALL               //应缴税额合计
      this.lateFeePayableALL=lateFeePayable                      //应缴滞纳金合计
      this.applTaxPaymentAll=applTaxPayment                   //申请缴纳税款合计
      this.taxPaidAll=taxPaid                        //实缴税额合计    taxPaid
      this.overduePaymentAll= overduePayment                     // 实缴滞纳金合计   overduePayment
      this.actualTaxPayment=taxsjsk               //实际缴纳税款合计
      this.tableList=[v]
      if(v.auditLogVoList) {
        this.shenpiyijian=v.auditLogVoList
      }else{
        this.shenpiyijian=[]
      }
      this.showTaxes=true
    },
    // 操作
    handleupLoad(item,index) {
      console.log('item',item)
      this.fileUploadForm = {
        uploadFileIndex:index,
        preTaxReturns:item.details[index].preTaxReturns,
        preTaxReturnsPath:item.details[index].preTaxReturnsPath,
        taxReturns:item.details[index].taxReturns,
        taxReturnsPath:item.details[index].taxReturnsPath,
        paymentCertificate:item.details[index].paymentCertificate,
        paymentCertificatePath:item.details[index].paymentCertificatePath,
        otherUploadId:item.details[index].otherUploadId,
        otherUploadPath:item.details[index].otherUploadPath,
      }
      this.showUploadModal = true
    },
    // 临时保存路径确定
    tempSubmitOk() {
      let indexs = this.fileUploadForm.index;
      this.tempInfoValue.details[indexs].preTaxReturns = this.fileUploadForm[index].preTaxReturns
      this.tempInfoValue.details[indexs].preTaxReturnsPath = this.fileUploadForm[index].preTaxReturnsPath
      this.tempInfoValue.details[indexs].taxReturns = this.fileUploadForm[index].taxReturns
      this.tempInfoValue.details[indexs].taxReturnsPath = this.fileUploadForm[index].taxReturnsPath
      this.tempInfoValue.details[indexs].paymentCertificate = this.fileUploadForm[index].paymentCertificate
      this.tempInfoValue.details[indexs].paymentCertificatePath = this.fileUploadForm[index].paymentCertificatePath
      this.tempInfoValue.details[indexs].otherUploadId = this.fileUploadForm[index].otherUploadId
      this.tempInfoValue.details[indexs].otherUploadPath = this.fileUploadForm[index].otherUploadPath
    },
    // 编辑
    edit(v) {
      this.$store.commit('closePage', 'resubmit')
      this.$router.push({name: 'resubmit', params: {type: 'taxReadyHandle', params: v}});
    },
    // 查看流程图
    handleLIUCHENGTU(v){
      // let params={
      //   deploymentId:v.deploymentId,
      //   filePath:v.filePath
      // }
      // const that=this
      // let base = '/api';
      this.liuchengtu=true
      this.liuchengtuInfo = `/api/process/${v.filePath}`
      // let base="/api"
      // var xhr = new XMLHttpRequest();
      // xhr.responseType = "blob";
      //   xhr.onreadystatechange = function(){
      //       if( xhr.readyState == 4){
      //           if( xhr.status >= 200 && xhr.status < 300 || xhr.status == 304){
      //             let blob = xhr.response
      //             let imgTag = URL.createObjectURL(blob)
      //             // that.liuchengtuInfo="data:image/png;base64,"+xhr.response
      //             that.liuchengtuInfo=imgTag
      //           }
      //       }
      //   };
      //   xhr.open("post",`${base}/process/image`,true);
      //   xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      //   xhr.send(JSON.stringify(params));
    },
    handleOkliuchengtu(){
      this.liuchengtu=false
      this.liuchengtuInfo=""
    },
    handleRefuseliuchengtu(){
      this.liuchengtu=false
      this.liuchengtuInfo=""
    },
    reSet() {
      this.startDate ="";
      this.endDate = "";
      this.$refs['taxReadyHandleForm'].resetFields();
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
          userId:this.userInfo.id,
          startDate: this.startDate,
          endDate: this.endDate,
          companyName:this.submitData.companyName,
          applicantName:this.submitData.applicantName,
          serialNumber:this.submitData.serialNumber
        }
      }
      this.loading=true
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
      console.log("v",v)
      this.submitInfo=v
      const that=this;
        getReviewer().then(res => {
          that.reviewers = res.data;
          that.handelModal = true;
        })
    },
      // 同意
    handleOk() {
      const that = this
      this.$refs['taxReadyHandlefrom'].validate((valid)=>{
        if (valid) {
          let params={
            taskId:this.submitInfo.serialNumber,
            operateApprove:this.taxReadyHandle.operateApprove,
            comment:this.taxReadyHandle.comment,
            userId:this.userInfo.id,
            currentHandler:this.taxReadyHandle.currentHandler
          }
          dbrwAudit(params).then(res=>{
            that.initPageData()
            that.submitInfo={}
            that.taxReadyHandle={}
            that.handelModal=false
          }).finally(() => {
            // this.loading = false;

          })
        }else {
          that.handelModal=true
        }
      })
    },
    // 拒绝
    handleRefuse() {
      this.submitInfo={}
      this.taxReadyHandle={}
      this.handelModal=false
      this.$refs['taxReadyHandlefrom'].resetFields()
    },
  },
  mounted() {
    this.init();

  },
  created:function(){
    this.userInfo = JSON.parse(Cookies.get("userInfo"));
    console.log("adad",this.userInfo)
  }
}
</script>
<style scoped lang="less">
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
.myspan {
  cursor: pointer;
  color:rgb(45, 140, 240);
  padding: 2px;
}

</style>
