<template>
  <div>
    <!-- nav start-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">Home</el-breadcrumb-item>
      <el-breadcrumb-item>
        <a href="/">Product Management</a>
      </el-breadcrumb-item>
      <el-breadcrumb-item>Params List</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- nav end-->

    <!-- card start -->
    <el-card>
      <el-alert
        title="Only level 3 params could be changed"
        type="warning"
        :closable="false"
        show-icon
      ></el-alert>
      <!-- select product category -->
      <el-row class="cat_opt">
        <span>Select Product Category:</span>
        <el-cascader
          v-model="selectedCatKeys"
          :options="cateList"
          :props="cateProps"
          @change="handleChange"
          placeholder="Please select"
        ></el-cascader>
        <!-- select area -->
      </el-row>

      <!-- tab start -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- add dynamic params -->
        <el-tab-pane label="Dynamic Params" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible=true"
          >Add Params</el-button>
          <!-- dynamic table -->
          <el-table :data="manyTableData" border stripe empty-text="No Data">
            <!-- expand row start-->
            <el-table-column type="expand">
              <!-- loop to display tags -->
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handlerClose(i, scope.row)"
                >{{item}}</el-tag>
                <!-- input text -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- add tag buttton -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- expand row end-->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="Param Name" prop="attr_name"></el-table-column>
            <el-table-column label="Action">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >Edit</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                >Delete</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- add static attributes -->

        <el-tab-pane label="Static Attributes" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible=true"
          >Add Attributes</el-button>
          <!-- static table -->
          <el-table :data="onlyTableData" border stripe>
            <!-- expand row -->
            <el-table-column type="expand">
              <!-- loop to display tags -->
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handlerClose(i, scope.row)"
                >{{item}}</el-tag>
                <!-- input text -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- add tag buttton -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>

            <el-table-column type="index"></el-table-column>
            <el-table-column label="Attribute Name" prop="attr_name"></el-table-column>
            <el-table-column label="Action">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >Edit</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                >Delete</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      <!-- tab end -->
    </el-card>
    <!-- cart end -->

    <!-- add params dialog start -->
    <el-dialog
      :title="'Add ' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="140px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="addParams">Confirm</el-button>
      </span>
    </el-dialog>
    <!-- add params dialog end -->

    <!-- edit params dialog start -->
    <el-dialog
      :title="'Edit ' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="140px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="editParams">Confirm</el-button>
      </span>
    </el-dialog>
    <!-- add params dialog end -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      cateList: [],
      // cascadar props
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // double binding
      selectedCatKeys: [],
      activeName: 'many',
      // dynamic params
      manyTableData: [],
      // static params
      onlyTableData: [],
      // add param dialog
      addDialogVisible: false,
      // add param object
      addForm: {
        attr_name: ''
      },
      // add param rules
      addFormRules: {
        attr_name: [
          {
            required: true,
            message: 'Please enter param name',
            trigger: 'blur'
          }
        ]
      },
      // edit dialog
      editDialogVisible: false,
      // edit form data
      editForm: {},
      // edit form validate rules
      editFormRules: {
        attr_name: [
          {
            required: true,
            message: 'Please enter param name',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('Failed to get product list')
      }
      this.cateList = res.data
    },
    // selected items changed will trigger this method
    handleChange() {
      this.getParamsData()
      if (this.selectedCatKeys.length !== 3) {
        this.selectedCatKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
    },
    // tab click event
    handleTabClick() {
      console.log(this.activeName)
      this.getParamsData()
    },
    // get all params
    async getParamsData() {
      // selected is not level 3
      if (this.selectedCatKeys.length !== 3) {
        this.selectedCatKeys = []
        return
      }
      // selected is level 3
      // get related params according to tag and id
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      )

      if (res.meta.status !== 200) {
        return this.$message.error('Failed to get params list')
      }

      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // add a boolean to control input visibility
        item.inputVisible = false
        // input value
        item.inputValue = ''
      })

      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // listen to dialog close
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // click to add param
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 201) {
          return this.$message.error('Failed to add params')
        }
        this.$message.success('Add params succeed')
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    // show edit dialog
    async showEditDialog(attr_id) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        {
          params: { attr_sel: this.activeName }
        }
      )

      if (res.meta.status !== 200) {
        return this.$message.error('Failed to edit params')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // reset edit form
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // click button, edit params
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('Failed to edit params')
        }
        this.$message.success('Edit params succeed')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    // delete param by id
    async removeParams(attr_id) {
      const confirmResult = await this.$confirm(
        'Confirm to permenantly delete the param?',
        'Confirm',
        {
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }
      ).catch(err => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('Deletion Canceled')
      }

      // confirm
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attr_id}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('Failed to delete params')
      }
      this.$message.success('Delete params succeed')
      this.getParamsData()
    },
    // text blur or key up
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // input value need add to db
      // because attr_vals are rendered
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrVals(row)
    },
    // add tag click
    showInput(row) {
      row.inputVisible = true

      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // save to attr_vals save to db
    async saveAttrVals(row) {
      // save to db
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      )

      if (res.meta.status !== 200) {
        return this.$message.error('Failed to edit attribute!')
      }

      this.$message.success('Edit attribute succeed!')
    },
    // delete tag and select
    handlerClose(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    // return false if btn disabled
    isBtnDisabled() {
      if (this.selectedCatKeys.length !== 3) {
        return true
      }
      return false
    },
    // selected current level 3 cat id
    cateId() {
      if (this.selectedCatKeys.length == 3) {
        return this.selectedCatKeys[2]
      }
      return null
    },
    // calculate title name
    titleText() {
      if (this.activeName === 'many') {
        return 'Dynamic Params'
      }
      return 'Static Attributes'
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0px;
}

.cat_opt > span {
  margin-right: 10px;
}

.el-tag {
  margin-right: 10px;
}

.input-new-tag {
  width: 120px;
}
</style>