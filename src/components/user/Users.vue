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
      <el-table :data="userlist" border stripe empty-text="No Data">
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
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- delete -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- assign role -->
            <el-tooltip effect="dark" content="Assign roles" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
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

    <!-- edit user dialog start-->
    <el-dialog
      title="Edit User"
      :visible.sync="editDialogVisible"
      width="30%"
      @close="editDialogClosed"
    >
      <el-form :model="editFrom" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="Username">
          <el-input v-model="editFrom.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model="editFrom.email"></el-input>
        </el-form-item>
        <el-form-item label="Mobile" prop="mobile">
          <el-input v-model="editFrom.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="editUserInfo">Edit User</el-button>
      </span>
    </el-dialog>
    <!-- edit user dialog end-->

    <!-- Assign role start -->
    <el-dialog
      title="Assign Roles"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="setRoleDialogClosed"
    >
      <div class="assign-role-dialog">
        <p>
          Current Username:
          <span>{{userInfo.username}}</span>
        </p>
        <p>
          Current Role:
          <span>{{userInfo.role_name}}</span>
        </p>
        <p>
          Assign New Role:
          <el-select v-model="selectedRoleId" placeholder="Please Select">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="saveRoleInfo" class="confirm-button">Confirm</el-button>
      </span>
    </el-dialog>
    <!-- Assign role end -->
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
      },
      // control edit dialog
      editDialogVisible: false,
      // fetched user info object
      editFrom: {},
      // edit form validators
      editFormRules: {
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
      },
      // set role diablog visibility
      setRoleDialogVisible: false,
      // User role info that will be assigned roles
      userInfo: {},
      // all roles list
      rolesList: [],
      selectedRoleId: ''
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
    },
    // edit user
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('Fetch User info failed')
      }
      this.editFrom = res.data
      this.editDialogVisible = true
    },
    // listen to edit user dialog close event
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // edit user info and submit
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.put(
          'users/' + this.editFrom.id,
          {
            email: this.editFrom.email,
            mobile: this.editFrom.mobile
          }
        )

        if (res.meta.status !== 200) {
          this.$message.error('Failed update user info')
        }

        this.editDialogVisible = false
        this.getUserList
        this.$message.success('Success update user info')
      })
    },
    // remove user by id
    async removeUserById(id) {
      // confirm deletion
      const confirmResult = await this.$confirm(
        'Do you confirm to delete the user?',
        'Confirm',
        {
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }
      ).catch(err => err) // if user canceled, need to catch error

      // if user confirmed, returned a "confirm"
      if (confirmResult !== 'confirm') {
        return this.$message.info('Deletion Canceled')
      }

      // request to delete user
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('Deletion failed')
      }
      this.$message.message('Deletion succeed')
      this.getUserList()
    },
    // show assign role dialog
    async setRole(userInfo) {
      this.userInfo = userInfo
      // get list of all role list
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200)
        return this.$message.error('Get roles failed')
      this.rolesList = res.data
      this.setRoleDialogVisible = true
    },
    // save assigned Role
    async saveRoleInfo() {
      if (!this.selectedRoleId) {
        return this.$message.info('Please select a role')
      }

      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        {
          rid: this.selectedRoleId
        }
      )
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('Failed to assign role')
      }
      this.$message.success('Assigned role succeed')
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    // listen assign role dialog close
    setRoleDialogClosed() {
      ;(this.userInfo = {}), (this.selectedRoleId = '')
    }
  }
}
</script>

<style lang="less" scoped>
.search-button,
.confirm-button {
  background-color: #fb5020;
  border-color: #fb5020;
}

.assign-role-dialog {
  font-size: 15px;
}

.assign-role-dialog p {
  padding: 8px 8px;
}

.assign-role-dialog p span {
  margin-left: 5px;
  color: #fb5020;
}
</style>