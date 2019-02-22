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
            <AutoComplete
                v-model="submitData.companyName"
                :data="companyListName"
                :filter-method="filterMethod"
                placeholder="请输入公司名称"
                style="width:200px">
            </AutoComplete>
            <!-- <Input v-model="submitData.companyName" placeholder="请输入公司名称"></Input> -->
          </Form-item>
          <Form-item label="申请人" prop="applicantName">
            <AutoComplete
                v-model="submitData.applicantName"
                :data="userListName"
                :filter-method="filterMethod"
                placeholder="请输入申请人"
                style="width:200px">
            </AutoComplete>
            <!-- <Input v-model="submitData.applicantName" placeholder="请输入申请人"></Input> -->
          </Form-item>
          <Form-item label="流水号" prop="serialNumber">
            <Input v-model="submitData.serialNumber" placeholder="请输入流水号" :maxlength="30"></Input>
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
        <FormItem label="审批意见" :label-width="100" v-if="taxReadyHandle.operateApprove != '1'" prop="comment">
          <Input type="textarea" v-model="taxReadyHandle.comment" placeholder="请输入审批意见"></Input>
        </FormItem>
        <Form-item label="选择审核人" prop="currentHandler" v-if="taxReadyHandle.operateApprove != '1' && !isApprovalPay" :label-width="100">
          <Select v-model="taxReadyHandle.currentHandler" >
            <Option v-for="item in reviewers" :value="item.id" :key="item.id">{{ item.realName }}</Option>
          </Select>
        </Form-item>
        <FormItem label="拒绝原因" v-if="taxReadyHandle.operateApprove === '1'" :label-width="100" prop="comment">
          <Input type="textarea" v-model="taxReadyHandle.comment" placeholder="请输入拒绝原因"></Input>
        </FormItem>
      </Form>
      <footer class="vertical-center" slot="footer">
          <Button style="width: 100px;" @click="handleRefuse">取消</Button>
          <Button type="primary"  style="width: 100px;margin-left:15px" @click="handleOk">提交</Button>
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
                  <td >{{item.payableTax+item.lateFeePayable}}</td>
                  <td >{{`${item.deadline && new Date(item.deadline).format()}`}}</td>
                  <td >{{item.taxPaid}}</td>
                  <td>{{item.overduePayment}}</td>
                  <td>{{item.taxPaid + item.overduePayment}}</td>
                  <td >{{ `${item.paymentTime ? new Date(item.paymentTime).format(): ''}` }}</td>
                  <td >
                    <span class="myspan" @click="handleupLoad(tableList[0],index)">资料补全</span>
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
            <Button style="width: 100px;" @click="fileInfoFormCancel">取消</Button>
            <Button type="primary" style="width: 100px;margin-left:20px" @click="fileUploadFormSubmit" v-if="currentLinkType=='uploadPayFile'">提交</Button>
            <Button type="primary" style="width: 100px;margin-left:20px" @click="fileInfoFormCancel" v-if="currentLinkType!='uploadPayFile'">确定</Button>
          </footer>
    </Modal>
    <!-- 上传modal -->
    <Modal
        :closable="false"
        class-name="preview-modal-inline"
        v-model="showUploadModal">
        <Form label-position="left" :label-width="100" :modal="fileUploadForm" :rules="fileUploadFormRules" ref="showUploadRefs">
          <FormItem label="预申报表" prop="preTaxReturnsPath">
            <Input type="text" disabled v-model="fileUploadForm.preTaxReturnsPathFileName" style="width:150px;float:left"/>
            <Button   @click.stop="priviewFile(fileUploadForm.preTaxReturnsPath)">预览</Button>
            <!-- <Button   @click.stop="uploadFile(fileUploadForm.preTaxReturnsPath)">下载</Button> -->
          </FormItem>
          <FormItem label="申报表" prop="taxReturnsPath">
            <Input type="text" disabled v-model="fileUploadForm.taxReturnsPathFileName" style="width:150px;float:left"/>
            <Upload action="/api/file/upload"
            :headers="{accessToken: accessToken}" name="file"
            :accept="fileTypeString"
            :data="{materialTypeDict: 'TAX_REPORT',taxDict:colSelectCurrencyCode,currency:selectCurrencyCode}" :show-upload-list="false"
            :on-success="uploadSuc" style="float:left">
              <!-- <Button icon="ios-cloud-upload-outline" v-if="currentLinkType=='uploadPayFile' && isCommissioner">上传文件</Button> -->
            </Upload>
            <Button  @click.stop="priviewFile(fileUploadForm.taxReturnsPath)">预览</Button>
            <!-- <Button  @click.stop="uploadFile(fileUploadForm.taxReturnsPath)">下载</Button> -->
          </FormItem>
          <FormItem label="完税申报表" prop="paymentCertificatePath">
            <Input type="text" disabled v-model="fileUploadForm.paymentCertificatePathFileName" style="width:150px;float:left"/>
            <Upload action="/api/file/upload"
            :headers="{accessToken: accessToken}" name="file"
            :accept="fileTypeString"
            :data="{materialTypeDict: 'DONE_TAX_REPORT',taxDict:colSelectCurrencyCode,currency:selectCurrencyCode}" :show-upload-list="false"
            :on-success="uploadSuc" style="float:left">
              <!-- <Button icon="ios-cloud-upload-outline" v-if="currentLinkType=='uploadPayFile' && isCommissioner">上传文件</Button> -->
            </Upload>
            <Button  @click.stop="priviewFile(fileUploadForm.paymentCertificatePath)">预览</Button>
            <!-- <Button  @click.stop="uploadFile(fileUploadForm.paymentCertificatePath)">下载</Button> -->
          </FormItem>
          <FormItem label="其它" prop="otherUploadId">
            <Input type="text" disabled  v-model="fileUploadForm.otherUploadFileName"  style="width:150px;float:left"/>
            <Upload action="/api/file/upload"
            :headers="{accessToken: accessToken}" name="file"
            :accept="fileTypeString"
            :data="{materialTypeDict: 'OTHER',taxDict:colSelectCurrencyCode,currency:selectCurrencyCode}" :show-upload-list="false"
            :on-success="uploadSuc" style="float:left">
              <!-- <Button icon="ios-cloud-upload-outline" v-if="currentLinkType=='uploadPayFile' && isCommissioner">上传文件</Button> -->
            </Upload>
            <Button @click.stop="priviewFile(fileUploadForm.otherUploadId)">预览</Button>
            <!-- <Button  @click.stop="uploadFile(fileUploadForm.otherUploadId)">下载</Button> -->
          </FormItem>
      </Form>
      <footer class="vertical-center" slot="footer">
          <Button style="width: 100px;"  @click="fileuploadFormCancel">取消</Button>
          <Button type="primary" style="width: 100px;margin-left:20px" @click="tempSubmitOk" v-if="currentLinkType=='uploadPayFile'">确定</Button>
          <Button type="primary" style="width: 100px;margin-left:20px" @click="fileuploadFormCancel" v-if="currentLinkType!='uploadPayFile'">确定</Button>
      </footer>
      <span style="color:red">只能上传 {{fileTypeString}} 文件</span>
    </Modal>
  </div>
</template>

<script>
import { taxReadyHandle,getReviewer,dbrwAudit,lookLiuchengtu,getAllCompany,getUserListData,getDictListDataByType } from '@/api/index.js'
import Cookies from "js-cookie";
import { getStore } from '@/libs/storage';
import fileLoadPath from '@/api/fileload';
import { dictType } from '@/libs/constance.js'
export default {
  name: 'taxReadyHandle',
  data() {
    return {
      dictTaxCategorys:[],
      dictTaxCategorysMap:"",
      selectCurrencyCode:"", // 选择的币种
      colSelectCurrencyCode:"", // 行选择的税种code
      fileTypeString:getStore("fileTypeString"),
      showUploadModal:false,
      accessToken: getStore('accessToken'),
      isCommissioner:getStore('isCommissioner'),
      loading: false,
      handelModal: false,
      userInfo:{},
      reviewers:[],
      isApprovalPay:false,
      taxReadyHandle: {
      	operateApprove:"",
      	comment:"",
      	userId:"",
      	currentHandler:"",
      },
      taxReadyHandleValidate: {
        operateApprove:[{required:true,message:"请选择",trigger: 'blur'}],
        currentHandler:[{required:true,message:"请选择",trigger: 'blur'}],
        comment:[{required:true,message:"请输入",trigger: 'blur'}]
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
        otherUpload:"",
        otherUploadId:"",
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
                    },params.row.businessFlowNumber)
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
            return h('div', params.row.saveTime && new Date(params.row.saveTime).format())
          }
          // width: 110
        },
        {
          title:"当前环节",
          key:"currentLink",
          render:(h,params) => {
            return h('div', this.renderCnName(params.row.currentLink))
          }
        },
        {
          title: '操作',
          width: 250,
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
            }else if(params.row.status!=3 && params.row.currentLink != "uploadPayFile" && params.row.currentLink!="reportPaid"){
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
            }else if (params.row.currentLink=="uploadPayFile") {
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
                          this.handleLook(params.row);

                        }
                      }
                    },
                    "资料补全"
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
            }else if (params.row.currentLink=="reportPaid") {
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
                          this.handleGotoReportPaid(params.row);
                        }
                      }
                    },
                    "上报实缴,并补全资料"
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
      currentLinkType:"",
      companyList:[],
      companyListName:[],
      userList:[],
      userListName:[],
      dictCurrencys:[],
      dictCurrencysMap:"",
      dictTaxCategorys:[],
      dictTaxCategorysMap:""
    }
  },
  methods: {
    // 文件上传之前文件大小校验
    // finleBeforeUpload(file) {
    //   // console.log(file)
    //   if(file) {
    //     let fileSize= file.size
    //     if(fileSize/1024/1024 >4 ) {
    //       this.$Message.error('上传文件不能大于4MB');
    //       return false
    //     }else{
    //       return true
    //     }
    //   }
    // },
    filterMethod (value, option) {
          return option.toUpperCase().indexOf(value.toUpperCase()) !== -1;
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
          reportPaid:"上报实缴,并补全资料"
        }
        return obj[key]
      }
    },
    // 详情页面关闭
    fileInfoFormCancel() {
      this.showTaxes=false
    },
    // 上传成功
    uploadSuc(res) {
      console.log('1231231',res)
      let key = {
        'PRE_TAX_REPORT': 'preTaxReturns',
        'TAX_REPORT': 'taxReturns',
        'DONE_TAX_REPORT': 'paymentCertificate',
        'OTHER': 'otherUpload'
      }[res.data.materialTypeDict];
      if(res.data.materialTypeDict=="OTHER") {
        this.fileUploadForm[key] = res.data.id;
        this.fileUploadForm[key + 'Id'] = res.data.fileName;
        this.fileUploadForm[key + 'FileName'] = res.data.oriName;
      }else{
        this.fileUploadForm[key] = res.data.id;
        this.fileUploadForm[key + 'Path'] = res.data.fileName;
        this.fileUploadForm[key + 'Path' + 'FileName'] = res.data.oriName
      }
    },
    // 取消
    fileuploadFormCancel() {
      this.showUploadModal = false
    },
    // 确定
    fileUploadFormSubmit() {
      console.log("fileUploadFormSubmit",this.tempInfoValue)
      let tempObj = this.tempInfoValue.details
      for(let i=0;i<tempObj.length;i++) {
        if(!tempObj[i].taxReturns || !tempObj[i].paymentCertificate || !tempObj[i].preTaxReturns) {
          this.$Message.error(`税种 ${this.dictTaxCategorysMap.get(tempObj[i].taxDict)} 资料未补全`);
          return
        }
      }
      let params = {
        operateApprove:'0',
        comment:"补全资料",
        taskId:this.tempInfoValue.serialNumber,
        userId:this.userInfo.id,
        currentHandler:'',
        bean:{
            businessFlowNumber:this.tempInfoValue.businessFlowNumber,
            saveTime:this.tempInfoValue.saveTime,
            details:this.tempInfoValue.details,
            applicantId: this.tempInfoValue.applicantId,
            applicantName: this.tempInfoValue.applicantName,
            companyId: this.tempInfoValue.companyId,
            companyName: this.tempInfoValue.companyName,
            countryCode: this.tempInfoValue.countryCode,
            countryName: this.tempInfoValue.countryName,
            currency: this.tempInfoValue.currency,
            currentHandler: this.tempInfoValue.currentHandler,
            currentLink: this.tempInfoValue.currentLink,
            deploymentId: this.tempInfoValue.deploymentId,
            executeType: this.tempInfoValue.executeType,
            filePath:this.tempInfoValue.filePath,
            financialReport: this.tempInfoValue.financialReport,
            financialReportPath:this.tempInfoValue.financialReportPath,
            id: this.tempInfoValue.id,
            remarks: this.tempInfoValue.remarks,
            serialNumber: this.tempInfoValue.serialNumber,
            status: this.tempInfoValue.status,
            tin: this.tempInfoValue.tin
        }
      }
      console.log('params',params)
      const that = this
      dbrwAudit(params).then(res=>{
        that.$Message.success("操作成功")
        that.initPageData()
        that.showTaxes=false
      }).finally(() => {
        // this.loading = false;
      })
    },
    // 预览
      priviewFile(v) {
        console.log("v",v)
        if(v){
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
    // 查看详情
    handleLook(v) {
      console.log("1212",v)
      this.tempInfoValue = v;
      this.selectCurrencyCode=v.currency;
      let tempData = v.details;
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
      this.payableTaxAll=payableTaxALL.toFixed(2)                //应缴税额合计
      this.lateFeePayableALL=lateFeePayable.toFixed(2)                       //应缴滞纳金合计
      this.applTaxPaymentAll=applTaxPayment.toFixed(2)                    //申请缴纳税款合计
      this.taxPaidAll=taxPaid.toFixed(2)                         //实缴税额合计    taxPaid
      this.overduePaymentAll= overduePayment.toFixed(2)                      // 实缴滞纳金合计   overduePayment
      this.actualTaxPayment=taxsjsk.toFixed(2)                //实际缴纳税款合计
      this.tableList=[v]
      if(v.auditLogVoList) {
        this.shenpiyijian=v.auditLogVoList
      }else{
        this.shenpiyijian=[]
      }
      this.currentLinkType = v.currentLink;
      this.showTaxes=true
    },
    // 操作
    handleupLoad(item,index) {
      console.log('item',item)
      console.log('index',index)
      this.colSelectCurrencyCode=item.details[index].taxDict
      this.fileUploadForm = {
        uploadFileIndex:index,
        preTaxReturns:item.details[index].preTaxReturns,
        preTaxReturnsPath:item.details[index].preTaxReturnsPath,
        preTaxReturnsPathFileName:item.details[index].preTaxReturnsPathFileName,
        taxReturns:item.details[index].taxReturns,
        taxReturnsPath:item.details[index].taxReturnsPath,
        taxReturnsPathFileName:item.details[index].taxReturnsPathFileName,
        paymentCertificate:item.details[index].paymentCertificate,
        paymentCertificatePath:item.details[index].paymentCertificatePath,
        paymentCertificatePathFileName:item.details[index].paymentCertificatePathFileName,
        otherUpload:item.details[index].otherUpload,
        otherUploadId:item.details[index].otherUploadId,
        otherUploadFileName:item.details[index].otherUploadFileName,
      }
      this.showUploadModal = true
    },
    // 临时保存路径确定
    tempSubmitOk() {
      let indexs = this.fileUploadForm.uploadFileIndex;
      this.tempInfoValue.details[indexs].preTaxReturns = this.fileUploadForm.preTaxReturns
      this.tempInfoValue.details[indexs].preTaxReturnsPath = this.fileUploadForm.preTaxReturnsPath
      this.tempInfoValue.details[indexs].preTaxReturnsPathFileName = this.fileUploadForm.preTaxReturnsPathFileName
      this.tempInfoValue.details[indexs].taxReturns = this.fileUploadForm.taxReturns
      this.tempInfoValue.details[indexs].taxReturnsPath = this.fileUploadForm.taxReturnsPath
      this.tempInfoValue.details[indexs].taxReturnsPathFileName = this.fileUploadForm.taxReturnsPathFileName
      this.tempInfoValue.details[indexs].paymentCertificate = this.fileUploadForm.paymentCertificate
      this.tempInfoValue.details[indexs].paymentCertificatePath = this.fileUploadForm.paymentCertificatePath
      this.tempInfoValue.details[indexs].paymentCertificatePathFileName = this.fileUploadForm.paymentCertificatePathFileName
      this.tempInfoValue.details[indexs].otherUpload = this.fileUploadForm.otherUpload
      this.tempInfoValue.details[indexs].otherUploadId = this.fileUploadForm.otherUploadId
      this.tempInfoValue.details[indexs].otherUploadFileName = this.fileUploadForm.otherUploadFileName
      this.showUploadModal=false
    },
    // 编辑
    edit(v) {
      this.$store.commit('closePage', 'resubmit')
      this.$router.push({name: 'resubmit', params: {type: 'taxReadyHandle', params: v}});
    },
    // 上报实缴页面
    handleGotoReportPaid(v) {
      console.log('handleGotoReportPaidv',v)
      // this.$store.commit('closePage', 'reportPaid')
      this.$router.push({name: 'reportPaid', params: {type: 'reportPaid', params: v}});
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
    initPageData() {
      console.log('this.submitData',this.submitData)
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
          companyId:this.submitData.companyName && this.renderIdByName(this.companyList,this.submitData.companyName),
          applicationId:this.submitData.applicantName && this.renderUserIdByName(this.userList,this.submitData.applicantName),
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
      const that=this;
      this.submitInfo=v
      var temp = ['reviewProcess','checkEntity','examineEntity','checkPay','approvalPay']
      var tempString = ""
      temp.map((item,index)=>{
        if(item==v.currentLink && index != 4) {
          tempString=temp[index+1]
            getReviewer(tempString).then(res => {
              that.reviewers = res.data;
              that.handelModal = true;
            })
            return;
        }else if(item==v.currentLink && index == 4) {
          this.isApprovalPay = true
          this.handelModal = true;
          return
        }else if(v.currentLink=="approvalProcess") {
          tempString="reviewProcess"
            getReviewer(tempString).then(res => {
              that.reviewers = res.data;
              that.handelModal = true;
            })
            return;
        }
      })
      console.log("adad",tempString)
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
            currentHandler:this.isApprovalPay?this.submitInfo.applicantId:this.taxReadyHandle.currentHandler
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
