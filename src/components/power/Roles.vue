<template>
  <div>
    <!-- nav start-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">Home</el-breadcrumb-item>
      <el-breadcrumb-item>
        <a href="/">Roles Management</a>
      </el-breadcrumb-item>
      <el-breadcrumb-item>Roles List</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- nav end-->

    <!-- card start -->
    <el-card>
      <!-- add role button start -->
      <el-row>
        <el-col>
          <el-button type="primary" class="addRole-button">Add Role</el-button>
        </el-col>
      </el-row>
      <!-- add role button end -->

      <!-- role list start -->
      <el-table :data="rolelist" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', i1 == 0 ? 'bdtop' : '', 'vcenter']"
              :key="item1.id"
              v-for="(item1, i1) in scope.row.children"
            >
              <!-- first level -->
              <el-col :span="5" closable @close="removeRightById(scope.row, item1.id)">
                <el-tag>{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- second and third level -->
              <el-col :span="19">
                <!-- use for render level 2 rights -->
                <el-row
                  :class="[i2 == 0 ? '': 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <!-- level 2 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- level 3 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      :key="item3.id"
                      v-for="(item3, i3) in item2.children"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- index -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="Role Name" prop="roleName"></el-table-column>
        <el-table-column label="Role Desc" prop="roleDesc"></el-table-column>
        <el-table-column label="Actions" width="350px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit">Edit</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete">Delete</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >Assign Roles</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- role list end -->
    </el-card>
    <!-- card end -->

    <!-- assign rights dialog start-->
    <el-dialog
      title="Assign Rights"
      :visible.sync="setRightsDialogVisible"
      width="50%"
      @close="setRightsDialogClosed"
    >
      <!-- tree -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        ref="treeRef"
        default-expand-all
        :default-checked-keys="defKeys"
      ></el-tree>

      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightsDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="allotRights">Confirm</el-button>
      </span>
    </el-dialog>
    <!-- assign rights dialog end-->
  </div>
</template>

<script>
export default {
  data() {
    return {
      // all roles data
      rolelist: [],
      // control assign rights visible
      setRightsDialogVisible: false,
      // all rights
      rightsList: [],
      // attributes binding for tree
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // default seleted ids
      defKeys: [],
      // to assign role rights
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // get all roles data list
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('Get Roles List Failed')
      }
      this.rolelist = res.data
    },
    // delete right by id
    async removeRightById(role, rightId) {
      // message box to remind if confirm deletion
      const confirmResult = await this.$confirm(
        'Confirm to delete?',
        'Confirm',
        {
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }
      ).catch(err => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('Canceled deletion')
      }

      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )

      if (res.meta.status !== 200) {
        return this.$message.info('Cancel failed')
      }
      // not use this, will render the whole page
      // this.getRolesList()
      role.children = res.data
    },
    // show dialog for assign rights
    async showSetRightDialog(role) {
      this.roleId = role.id
      // get all rights list
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200)
        return this.$message.info('Get rights list failed')
      // save all rights to rightslist
      this.rightsList = res.data
      // get level 3 rights
      this.getLeafKeys(role, this.defKeys)
      this.setRightsDialogVisible = true
    },
    // get level 3 rights and saved to default selected
    getLeafKeys(node, arr) {
      if (!node.children) {
        // if current is leaf node(level 3), save to arr
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // listen to the close of the dialog
    setRightsDialogClosed() {
      this.defKeys = []
    },
    // update rights
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        {
          rids: idStr
        }
      )
      if (res.meta.status !== 200)
        return this.$message.error('Assigned rights failed')
      this.$message.success('Assigned rights succeed')
      this.getRolesList()
      this.setRightsDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.addRole-button {
  background-color: #fb5020;
  border-color: #fb5020;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.el-tag {
  margin: 7px;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>