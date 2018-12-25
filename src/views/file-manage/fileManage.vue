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
      <iframe :src="priviewFilePath" width="700px" height="700px"></iframe>
    </Modal>
      <a :href="downloadPath" :download="fileName" id="download" ></a>
    </Card>
    </Col>
    </Row>
  </div>
</template>

<script>
import { getFilesList, getAllCompany } from '@/api/index.js'
import fileLoadPath from "@/api/fileload";
import { getStore } from '@/libs/storage';
export default {
  name: 'fileManage',
  data() {
    return {
      loading: false,
      priviewModal: false,
      accessToken: getStore('accessToken'),
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
          title: '原文件名称',
          key: 'oriName'
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
      companyList: [],
      priviewFilePath:''
    }
  },
  computed: {
    filePath() {
      return this.fileName ? `/api/file/${this.fileName}` : '';
    },
    downloadPath() {
      return this.fileName ? `/api/upload/${this.fileName}` : '';
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
        this.total = res.data.total;
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
      console.log("adasda",v)
      const that = this;
      let lastString = v.fileName.lastIndexOf(".")
      let filelastName = v.fileName.substr(lastString+1)
      // this.fileName = v.fileName;
      if(filelastName=="png" || filelastName=="jpg" || filelastName=="jpeg") {
        let baseurl = fileLoadPath.loadFilePath
        // this.priviewFilePath = baseurl+v.fileName+'?view'
        // this.priviewModal = true;
        window.open(`${baseurl}${v.fileName}?view`)
      }else{
        // let params={
        //   fileName:v.fileName
        // }
        let base="/api"
        var xhr = new XMLHttpRequest();
        xhr.responseType = "blob";
          xhr.onreadystatechange = function(){
              if( xhr.readyState == 4){
                  if( xhr.status >= 200 && xhr.status < 300 || xhr.status == 304){
                    let blob = xhr.response
                    let imgTag = URL.createObjectURL(blob)
                    // that.liuchengtuInfo="data:image/png;base64,"+xhr.response
                    that.priviewFilePath=imgTag
                    that.priviewModal = true;
                  }
              }
          };
          xhr.open("post",`${base}/previewFile`,true);
          xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
          xhr.setRequestHeader("accessToken", this.accessToken);
          xhr.send(JSON.stringify({fileName:v.fileName}));
      }

    },
    downloadFile(v) {
      // this.fileName = v.fileName;
      // this.fileName = v.fileName;
      // this.$nextTick(() => {
      //   document.getElementById('download').click();
      // })
      let baseurl = fileLoadPath.loadFilePath
      window.open(baseurl+v.fileName)
      // var form = document.createElement("form");
      //
      //           document.body.appendChild(form);
      // form.method="get"
      // form.action=`/api/file/download/${v.fileName}`
      // form.submit()
       // window.location.assign(`/api/file/download/${v.fileName}`)
      //
      // var urls = `/api/file/download/18f2f907f14c407fb576115c46437fd1.png`
      // var url = [urls,this.getStore('accessToken')].join("?")
      //  window.open(url)

      // let base="/api"
      // var xhr = new XMLHttpRequest();
      // // xhr.responseType = "blob";
      //   xhr.onreadystatechange = function(){
      //       if( xhr.readyState == 4){
      //           if( xhr.status >= 200 && xhr.status < 300 || xhr.status == 304){
      //             // let blob = xhr.response
      //             // let imgTag = URL.createObjectURL(blob)
      //             // // that.liuchengtuInfo="data:image/png;base64,"+xhr.response
      //             // that.liuchengtuInfo=imgTag
      //             window.location.replace('/api/file/download/18f2f907f14c407fb576115c46437fd1.png')
      //           }
      //       }
      //   };
      //   xhr.open("get",`${base}/file/download/${v.fileName}`,true);
      //   xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      //   xhr.setRequestHeader("accessToken", this.getStore('accessToken'));
      //   // xhr.send(JSON.stringify(params));
      //   // window.open()
      //   xhr.send()
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
