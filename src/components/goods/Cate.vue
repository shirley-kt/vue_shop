<template>
  <div>
    <!-- nav start-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">Home</el-breadcrumb-item>
      <el-breadcrumb-item>
        <a href="/">Product Management</a>
      </el-breadcrumb-item>
      <el-breadcrumb-item>Product Category</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- nav end-->

    <!-- card start -->
    <el-card>
      <el-row>
        <el-col>
          <el-button class="add-category-button" @click="showAddCateDialog">Add Category</el-button>
        </el-col>
      </el-row>

      <!-- form -->
      <tree-table
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
        class="treeTable"
      >
        <!-- if available -->
        <template slot="isAva" slot-scope="scope">
          <i
            style="color: lightgreen"
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
          ></i>
          <i style="color: red" class="el-icon-error" v-else></i>
        </template>

        <!-- order -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">Level 1</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">Level 2</el-tag>
          <el-tag size="mini" type="warning" v-else>Level 3</el-tag>
        </template>

        <!-- action -->
        <template slow="opt" slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-setting">Edit</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete">Search</el-button>
        </template>
      </tree-table>

      <!-- pagination -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- card end -->

    <!-- add category start -->
    <el-dialog
      title="Add Category"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- add category form -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="120px"
      >
        <el-form-item label="Category Name" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="Parent Category">
          <!-- options data source -->
          <!-- props used to config objs -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="addCate">Confirm</el-button>
      </span>
    </el-dialog>
    <!-- add category end -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      // get query
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // product category
      catelist: [],
      total: 0,
      columns: [
        {
          label: 'Category Name',
          prop: 'cat_name'
        },
        {
          label: 'Available',
          // template column
          type: 'template',
          // template of this column
          template: 'isAva'
        },
        {
          label: 'Order',
          // template column
          type: 'template',
          // template of this column
          template: 'order'
        },
        {
          label: 'Actions',
          // template column
          type: 'template',
          // template of this column
          template: 'opt'
        }
      ],
      // control cate dialog
      addCateDialogVisible: false,
      // add category data
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        // level default as 1
        cat_level: 1
      },
      // add category form validation rules
      addCateFormRules: {
        // category name
        cat_name: [
          {
            required: true,
            message: 'Please enter category name',
            trigger: 'blur'
          }
        ]
      },
      // parent category list
      parentCateList: [],
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },
      // selected parent categories
      selectedKeys: []
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('Error in get product category list')
      }
      // data list assigned to catelist
      this.catelist = res.data.result
      this.total = res.data.total
    },
    // listen page size change
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // listent page num
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // click button to open add category dialog
    showAddCateDialog() {
      // get parent list before show dialog
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // get parent catogory
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('Error get parent list')
      }
      this.parentCateList = res.data
    },
    // selected changed
    parentCateChange() {
      // if selectedKeys length > 0, selected parent categories
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        // current category level
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status != 201) {
          return this.$message.error('Failed add category')
        }
        this.$message.success('Add category succeed')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    }
  }
}
</script>

<style lang="less" scoped>
.add-category-button {
  background-color: #fb5020;
  border-color: #fb5020;
}

.treeTable {
  margin-top: 15px;
}

.el-cascader {
  width: 100%;
}
</style>