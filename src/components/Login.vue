<template>
  <div class="login_container">
    <div class="login_box">
      <!-- avatar start -->
      <div class="avatar_box">
        <img src="../assets/logo.png" />
      </div>
      <!-- avatar end -->

      <!-- login start -->
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginFormRules"
        label-width="0px"
        class="login_form"
      >
        <!-- username -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <!-- password -->
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            prefix-icon="iconfont icon-3702mima"
            type="password"
          ></el-input>
        </el-form-item>
        <!-- button -->
        <el-form-item class="btns">
          <el-button class="login-button" type="primary" @click="login()">Login</el-button>
          <el-button class="reset-button" type="info" @click="resetLoginForm()">Reset</el-button>
        </el-form-item>
      </el-form>
      <!-- login end -->
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // log in data model
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // form check rules
      loginFormRules: {
        // check if username is valid
        username: [
          {
            required: true,
            message: 'Username is required',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 10,
            message: 'Username is betwwen 3 and 10 characters',
            trigger: 'blur'
          }
        ],
        // check if password is valid
        password: [
          {
            required: true,
            message: 'Password is required',
            trigger: 'blur'
          },
          {
            min: 6,
            max: 15,
            message: 'Password is betwwen 6 and 15 characters',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields()
    },
    login() {
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('login', this.loginForm)
        if (res.meta.status != 200) return this.$message.error('Log in fail')
        this.$message.success('Log in success')
        window.sessionStorage.setItem('token', res.data.token)
        // Programtic Direct
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  height: 100%;
  background-color: #ededee;
}

.login_box {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
}

.avatar_box {
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 130px;
  width: 140px;
  border: 1px solid #eee;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 0 10px #ddd;
  background-color: #fff;
  img {
    height: 100%;
    width: 100%;
    border-radius: 50%;
    background-color: #eee;
  }
}

.btns {
  display: flex;
  justify-content: flex-end;
}

.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0px 20px;
  box-sizing: border-box;
}

.login-button {
  background-color: #fb5020;
  border-color: #fb5020;
}

.reset-button {
  background-color: #212121;
}
</style>