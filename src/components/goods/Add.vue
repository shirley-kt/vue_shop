<template>
  <div>
    <!-- nav start-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">Home</el-breadcrumb-item>
      <el-breadcrumb-item>
        <a href="/">Product Management</a>
      </el-breadcrumb-item>
      <el-breadcrumb-item>Add Product</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- nav end-->

    <el-card>
      <el-alert title="Add Product Info" type="warning" :closable="false" show-icon></el-alert>
      <!-- Step area start -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="Basic Info"></el-step>
        <el-step title="Product Params"></el-step>
        <el-step title="Product Attributes"></el-step>
        <el-step title="Product Pictures"></el-step>
        <el-step title="Product Content"></el-step>
        <el-step title="Completed"></el-step>
      </el-steps>
      <!-- Step area end -->

      <!-- tab栏区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="Basic Info" name="0">
            <el-form-item label="Product Name" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="Product Price" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="Product Weight" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="Product Number" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="Product Category" prop="goods_cat">
              <el-cascader
                expand-trigger="hover"
                :options="catelist"
                :props="cateProps"
                v-model="addForm.goods_cat"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="Product Params" name="1">
            <!-- items -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="Product Attributes" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="Product Pictures" name="3">
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">Upload Images</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="Product Content" name="4">
            <!-- text editor -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>

            <!-- button to add product -->
            <el-button class="btnAdd" type="primary" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- pic preview -->
    <el-dialog title="Picture Preview" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  data() {
    return {
      activeIndex: '0',
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // product category
        goods_cat: [],
        // pictures
        pics: [],
        // product description
        goods_introduce: '',
        attrs: []
      },
      addFormRules: {
        goods_name: [
          {
            required: true,
            message: 'Please enter product name',
            trigger: 'blur'
          }
        ],
        goods_price: [
          {
            required: true,
            message: 'Please enter product price',
            trigger: 'blur'
          }
        ],
        goods_weight: [
          {
            required: true,
            message: 'Please enter product weight',
            trigger: 'blur'
          }
        ],
        goods_number: [
          {
            required: true,
            message: 'Please enter product number',
            trigger: 'blur'
          }
        ],
        goods_cat: [
          {
            required: true,
            message: 'Please enter product category',
            trigger: 'blur'
          }
        ]
      },
      catelist: [],
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // dynamic params
      manyTableData: [],
      // static attrs
      onlyTableData: [],
      // url for image upload
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // image upload header/add auth
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previewPath: '',
      previewVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')

      if (res.meta.status !== 200) {
        return this.$message.error('Failed to get product list ！')
      }

      this.catelist = res.data
      console.log(this.catelist)
    },
    // cacadar changes listener
    handleChange() {
      // not chose level 3, other levels are not allowed
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('Please select product category')
        return false
      }
    },
    async tabClicked() {
      // dynamic params tab
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'many' }
          }
        )

        if (res.meta.status !== 200) {
          return this.$message.error('Failed to get dynamic attribtues !')
        }

        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
        console.log(this.manyTableData)
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'only' }
          }
        )

        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性失败！')
        }

        console.log(res.data)
        this.onlyTableData = res.data
      }
    },
    // handler upload event
    handleSuccess(response) {
      const picInfo = { pic: response.data.tmp_path }
      this.addForm.pics.push(picInfo)
    },
    // pic preview
    handlePreview(file) {
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    // pic remove
    handleRemove(file) {
      const filePath = file.response.data.tmp_path
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      this.addForm.pics.splice(i, 1)
    },
    // add product
    add() {
      // validate form
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('Please enter required input !')
        }
        // lodash   cloneDeep(obj)
        const form = _.cloneDeep(this.addForm)
        // object to array
        form.goods_cat = form.goods_cat.join(',')

        // Dynamic params
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })

        // Static params
        this.onlyTableData.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs

        const { data: res } = await this.$http.post('goods', form)

        if (res.meta.status !== 201) {
          return this.$message.error('Failed to add product !')
        }

        this.$message.success('Succeed to add product !')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId() {
      // include level 3, because only level 3 is allowed to add
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}

.previewImg {
  width: 100%;
}

.btnAdd {
  margin-top: 15px;
}

.add-product-button {
  background-color: #fb5020;
  border-color: #fb5020;
}
</style>