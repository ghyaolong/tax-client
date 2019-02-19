<template>
  <Row type="flex" justify="center" align="middle" class="login" @keydown.enter.native="submitLogin">
    <Col :xs="{span:22}" style="width: 368px;">
    <Row class="header">
      <!-- <img src="../assets/xboot.png" width="220px" /> -->
      <div class="description">税务管理系统</div>
    </Row>

    <Alert type="error" show-icon v-if="error">{{errorMsg}}</Alert>

    <Row class="login-form" v-if="!socialLogining">
      <Tabs v-model="tabName">
        <TabPane label="账户密码登录" name="username" icon="md-person">
          <Form ref="usernameLoginForm" :model="form" :rules="rules" class="form">
            <FormItem prop="username">
              <Input v-model="form.username" prefix="ios-contact" size="large" clearable placeholder="请输入用户名" autocomplete="off" />
            </FormItem>
            <FormItem prop="password">
              <Input type="password" v-model="form.password" prefix="ios-lock" size="large" clearable placeholder="请输入密码" autocomplete="off" />
            </FormItem>
          </Form>
        </TabPane>
      </Tabs>
      <Row>
        <Button class="login-btn" type="primary" size="large" :loading="loading" @click="submitLogin" long>
                            <span v-if="!loading">登录</span>
                            <span v-else>登录中...</span>
                        </Button>
      </Row>
    </Row>
    </Col>
  </Row>
</template>

<script>
import Cookies from "js-cookie";
import {
  login,
  userInfo,
  githubLogin,
  qqLogin,
  weiboLogin,
  getJWT,
  sendSms,
  smsLogin,
  getFileType
} from "@/api/index";
import util from "@/libs/util.js";
export default {
  data() {
    const validateMobile = (rule, value, callback) => {
      var reg = /^[1][3,4,5,7,8][0-9]{9}$/;
      if (!reg.test(value)) {
        callback(new Error("手机号格式错误"));
      } else {
        callback();
      }
    };
    return {
      socialLogining: false,
      error: false,
      errorMsg: "",
      tabName: "username",
      saveLogin: true,
      loading: false,
      sending: false,
      sended: false,
      count: 60,
      countButton: "60 s",
      maxLength: 6,
      errorCode: "",
      form: {
        username: "",
        password: "",
        mobile: "",
        code: ""
      },
      rules: {
        username: [
          {
            required: true,
            message: "账号不能为空",
            trigger: "blur"
          }
        ],
        password: [
          {
            required: true,
            message: "密码不能为空",
            trigger: "blur"
          }
        ],
        mobile: [
          {
            required: true,
            message: "手机号不能为空",
            trigger: "blur"
          },
          {
            validator: validateMobile,
            trigger: "blur"
          }
        ]
      }
    };
  },
  methods: {
    showErrorMsg(msg) {
      this.error = true;
      this.errorMsg = msg;
    },
    sendVerify() {
      this.$refs.mobileLoginForm.validate(valid => {
        if (valid) {
          this.showErrorMsg("请捐赠获取完整版")
        }
      });
    },
    countDown() {
      let that = this;
      if (this.count === 0) {
        this.sended = false;
        this.count = 60;
        return;
      } else {
        this.countButton = this.count + " s";
        this.count--;
      }
      setTimeout(function() {
        that.countDown();
      }, 1000);
    },
    submitLogin() {
      if (this.tabName === "username") {
        this.$refs.usernameLoginForm.validate(valid => {
          if (valid) {
            this.loading = true;
            login({
              username: this.form.username,
              password: this.form.password,
              saveLogin: this.saveLogin
            }).then(res => {
              this.setStore("accessToken", res.token);
              // 获取用户信息
              userInfo().then(res => {
                // 避免超过大小限制
                delete res.data.permissions;
                if (this.saveLogin) {
                  // 保存7天
                  Cookies.set("userInfo", JSON.stringify(res.data), {
                    expires: 7
                  });
                } else {
                  Cookies.set("userInfo", JSON.stringify(res.data));
                }
                this.setStore("userInfo", res.data);
                //判断角色里是否包含税务专员
                let isROLE_COMMISSIONER_OF_TAX=res.data.roles.some((item,index)=>{
                   return item.code =="ROLE_COMMISSIONER_OF_TAX"
                })
                this.setStore("isCommissioner", isROLE_COMMISSIONER_OF_TAX);

                this.$store.commit("setAvatarPath", res.data.avatar);
                // 加载菜单
                util.initRouter(this);
                this.$router.push({
                  name: "home_index"
                });
              });

              getFileType("fileType").then((res)=>{
                this.setStore("fileTypeString", res.data&&res.data.propertyValue);
              })

            }).catch(err => {
              // this.showErrorMsg(err.errMsg);
            }).finally(() => {
              this.loading = false;
            });
          }
        });
      } else if (this.tabName === "mobile") {
        this.$refs.mobileLoginForm.validate(valid => {
          if (valid) {
            if (this.form.code === "") {
              this.errorCode = "验证码不能为空";
              return;
            } else {
              this.errorCode = "";
            }
            this.showErrorMsg("请捐赠获取完整版")
          }
        });
      }
    },
    toGithubLogin() {
      this.showErrorMsg("请捐赠获取完整版")
    },
    toQQLogin() {
     this.showErrorMsg("请捐赠获取完整版")
    },
    toWeiboLogin() {
      this.showErrorMsg("请捐赠获取完整版")
    },
    toWeixinLogin() {
      this.$Message.error("开通微信登录官方收费300/年");
    },
    showAccount() {
      console.log('wait...');
    }
  }
};
</script>

<style lang="less">
@import "./login.less";
</style>
