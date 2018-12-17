<style lang="less">
.vertical-center-modal{
  display: flex;
  align-items: center;
  justify-content: center;

  .ivu-modal{
    top: 0;
  }
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
      @on-ok="handleOk"
      @on-cancel="handleRefuse"
      width="400">
      <Form :model="taxReadyHandle">
        <FormItem label="操作" :label-width="80">
          <Select v-model="taxReadyHandle.operateApprove">
            <Option value="0" >同意</Option>
            <Option value="1" >拒绝</Option>
          </Select>
        </FormItem>
        <FormItem label="审批意见" :label-width="80" v-if="taxReadyHandle.operateApprove != '1'">
          <Input type="textarea" v-model="taxReadyHandle.comment" placeholder="请输入审批意见"></Input>
        </FormItem>
        <Form-item label="选择审核人" prop="currentHandler" v-if="taxReadyHandle.operateApprove != '1'" :label-width="80">
          <Select v-model="taxReadyHandle.currentHandler" style="width:200px">
            <Option v-for="item in reviewers" :value="item.id" :key="item.id">{{ item.realName }}</Option>
          </Select>
        </Form-item>
        <FormItem label="拒绝原因" v-if="taxReadyHandle.handle === '1'" :label-width="80">
          <Input type="textarea" v-model="taxReadyHandle.comment" placeholder="请输入拒绝原因"></Input>
        </FormItem>
      </Form>
    </Modal>
    <Modal
      v-model="liuchengtu"
      title="流程图"
      class-name="vertical-center-modal"
      @on-ok="handleOkliuchengtu"
      @on-cancel="handleRefuseliuchengtu"
      width="400px"
      >
      <div style="height:400px">
        <img :src="liuchengtuInfo" width="100%" height="100%"/>
      </div>
    </Modal>
  </div>
</template>

<script>
import { taxReadyHandle,getReviewer,dbrwAudit,lookLiuchengtu } from '@/api/index.js'
import Cookies from "js-cookie";
export default {
  name: 'taxReadyHandle',
  data() {
    return {
      loading: false,
      handelModal: false,
      userInfo:{},
      reviewers:[],
      taxReadyHandle: {
      	operateApprove:"",
      	comment:"",
      	userId:"",
      	currentHandler:""
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
                        this.handle(params.row);
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
          }
        }
      ],
      data: [],
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      submitData:{
        companyName:"",
        applicantName:"",
        serialNumber:"",
        selectDate:""
      },
      submitInfo:{},
      liuchengtu:false, // 流程图弹出窗
      liuchengtuInfo:"", // 流程图内容
    }
  },
  methods: {
    // 查看流程图
    handleLIUCHENGTU(v){
      let params={
        deploymentId:v.deploymentId,
        filePath:v.filePath
      }
      //this.loading=true
      // lookLiuchengtu(params).then(res=>{
      //   console.log(res)
      // }).finally(() => {
      //   this.loading = false;
      // })
      const that=this
      this.liuchengtu=true
      let base="/api"
      var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(){
            if( xhr.readyState == 4){
                if( xhr.status >= 200 && xhr.status < 300 || xhr.status == 304){
                  that.liuchengtuInfo="data:image/jpeg;base64,"+xhr.response
                }
            }
        };
        xhr.open("post",`${base}/process/image`,true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(JSON.stringify(params));
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
          page: this.pageNumber,
          size: this.pageSize,
          userId:this.userInfo.id,
          startDate: this.startDate,
          endDate: this.endDate,
          companyName:this.submitData.companyName,
          applicantName:this.submitData.applicantName,
          serialNumber:this.submitData.serialNumber
      }
      this.loading=true
      taxReadyHandle(params).then(res => {
        this.total = res.data.totalElements;
        this.data = res.data;
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
        getReviewer().then(res => {
          this.reviewers = res.data;
          this.handelModal = true;
        })
    },
      // 同意
    handleOk() {
      let params={
        taskId:this.submitInfo.serialNumber,
        operateApprove:this.taxReadyHandle.operateApprove,
        comment:this.taxReadyHandle.comment,
        userId:this.userInfo.id,
        currentHandler:this.taxReadyHandle.currentHandler
      }
      dbrwAudit(params).then(res=>{
        this.initPageData()
        this.submitInfo={}
        this.taxReadyHandle={}
      }).finally(() => {
        this.loading = false;
      })
    },
    // 拒绝
    handleRefuse() {
      this.submitInfo={}
      this.taxReadyHandle={}
    },
  },
  mounted() {
    this.init();

  },
  created:function(){
    this.userInfo = JSON.parse(Cookies.get("userInfo"));
  }
}
</script>
