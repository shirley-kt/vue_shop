<template>
  <div>
    <!-- nav start-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">Home</el-breadcrumb-item>
      <el-breadcrumb-item>
        <a href="/">User Management</a>
      </el-breadcrumb-item>
      <el-breadcrumb-item>Activities</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- nav end-->

    <!-- car view start -->
    <el-card class="box-card">
      <!-- search and add start-->
      <el-row :gutter="20">
        <el-col :span="9">
          <el-input
            placeholder="Please search here"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button class="search-button" type="info" @click="addDialogVisible = true">Add Users</el-button>
        </el-col>
      </el-row>
      <!-- search and add end-->

      <!-- user list -->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="Name" prop="username"></el-table-column>
        <el-table-column label="Email" prop="email"></el-table-column>
        <el-table-column label="Telephone" prop="mobile"></el-table-column>
        <el-table-column label="Role" prop="role_name"></el-table-column>
        <el-table-column label="State">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              active-color="#fb5020"
              @change="userStateChanged(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="Action" width="180px">
          <template slot-scope="scope">
            <!-- edit -->
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <!-- delete -->
            <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
            <!-- assign role -->
            <el-tooltip effect="dark" content="Assign roles" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- paganation -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- card view end -->

    <!-- Add User dialog start-->
    <el-dialog
      title="Add User"
      :visible.sync="addDialogVisible"
      width="30%"
      @close="addDialogClosed"
    >
      <!-- Content -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item label="Username" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="Password" prop="password" type="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="Mobile" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- Bottom buttons -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="addUser">Add User</el-button>
      </span>
    </el-dialog>
    <!-- Add User dialog end-->
  </div>
</template>

<script>
export default {
  data() {
    // validate email
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
      if (regEmail.test(value)) {
        return cb()
      }

      cb(new Error('Please enter valid email address'))
    }

    // validate mobile
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^(\+\d{1,3}[- ]?)?\d{10}$/
      if (regMobile.test(value)) {
        return cb()
      }

      cb(new Error('Please enter valid phone number'))
    }

    return {
      // get user list params
      queryInfo: {
        query: '',
        // current page
        pagenum: 1,
        // current page size
        pagesize: 2
      },
      userlist: [],
      // total records
      total: 0,
      // control add user dialogue display
      addDialogVisible: false,
      // add user form data
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // Form validation rules
      addFormRules: {
        username: [
          {
            required: true,
            message: 'Please input your username',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 10,
            message: 'Username is 3 to 10 characters'
          }
        ],
        password: [
          {
            required: true,
            message: 'Please input your username',
            trigger: 'blur'
          },
          {
            min: 6,
            max: 15,
            message: 'Password is 6 to 15 characters'
          }
        ],
        email: [
          {
            required: true,
            message: 'Please input your email',
            trigger: 'blur'
          },
          {
            validator: checkEmail,
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            message: 'Please input your mobile',
            trigger: 'blur'
          },
          {
            validator: checkMobile,
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status != 200) {
        return this.$message.error('Get user list failed!')
      }
      this.userlist = res.data.users
      this.total = res.data.total
    },
    // listen to page size change
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // listen to current page change
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // listen to the switch change
    async userStateChanged(userinfo) {
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      if (res.meta.status != 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('Error Setting Status')
      }
      this.$message.success('Success Setting Status')
    },
    // listen to close of add user dialogue
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // add user
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        // add user request
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status != 201) {
          this.$message.error('Add User Failed')
        }
        this.$message.success('Add User Success')
        // hide add user dialog
        this.addDialogVisible = false
        // gain user list
        this.getUserList()
      })
    }
  }
}
</script>

<style lang="less" scoped>
.search-button {
  background-color: #fb5020;
}
</style>