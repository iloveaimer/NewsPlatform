<template>
  <!-- a-card: 整个该区域是以卡片形式 -->
  <!-- 最基础的卡片容器，可承载文字、列表、图片、段落，常用于后台概览页面 -->
  <!-- :bordered 卡片设置为无框形式 -->
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <!-- layout="inline":表单三种布局之一，inline设置为全部一字排开 -->
      <!-- keyup.enter.native 按下回车触发聚焦 -->
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <!-- col可以向整个列应用样式，而不需要重复为每个单元格或每一行设置样式 -->
          <!-- 下面四个属性用于适配四种尺寸，xs超小，sm小，md中，lg大 -->
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="分公司名称">
              <a-input v-model="queryParam.branchOfName" placeholder="请输入分公司名称"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="项目名称">
              <a-input v-model="queryParam.projectName" placeholder="请输入项目名称"></a-input>
            </a-form-item>
          </a-col>
          <!-- template标签默认不可见，它设置了display:none属性 -->
          <template v-if="toggleSearchStatus">
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="项目编号">
                <a-input v-model="queryParam.projectNumber" placeholder="请输入项目编号"></a-input>
              </a-form-item>
            </a-col>
          </template>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <!-- button type="primary" 按钮类型四样式之一，主按钮 -->
              <!-- 高级查询按钮调用 superQuery方法 -->
              <a-button type="primary" icon="search" @click="searchQuery">查询</a-button>
              <a-button type="primary" icon="reload" @click="searchReset" style="margin-left: 8px">重置</a-button>
              <a style="margin-left: 8px" @click="handleToggleSearch">
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'" />
              </a>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button type="primary" icon="plus" @click="handleAdd">
        新增
      </a-button>
      <a-button type="primary" icon="download" @click="handleExportXls('安全策划-安全策划')">
        导出
      </a-button>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel">
            <a-icon type="delete" />删除
          </a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px">
          批量操作 <a-icon type="down" />
        </a-button>
      </a-dropdown>
    </div>

    <!-- table区域-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>
      
      <!-- table,表格样式 -->
      <a-table
        ref="table"
        size="middle"
        bordered
        rowKey="id"
        :scroll="{ x: this.isMobile() ? false : true }"
        class="j-table-force-nowrap"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
        @change="handleTableChange">
        <template slot="htmlSlot" slot-scope="text">
          <div v-html="text"></div>
        </template>
        <template slot="imgSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无图片</span>
          <img
            v-else
            :src="getImgView(text)"
            height="25px"
            alt=""
            style="max-width:80px;font-size: 12px;font-style: italic;"
          />
        </template>
        <template slot="fileSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无文件</span>
          <a-button
            v-else
            :ghost="true"
            type="primary"
            icon="download"
            size="small"
            @click="uploadFile(text)"
          >
            下载
          </a-button>
        </template>

        <span slot="action" slot-scope="text, record">
          <template>
            <a v-if="record.bpmStatus === '1'" @click="handleEdit(record)">编辑</a>
            <a v-if="record.bpmStatus !== '1'" @click="handleDetail(record)" href="javascript:;">详情</a>
            <a-divider type="vertical" />
          </template>

          <a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a v-if="record.bpmStatus === '1'" @click="startProcess(record)">提交流程</a>
                <a v-if="record.bpmStatus !== '1'" @click="handlePreviewPic(record)">审批进度</a>
              </a-menu-item>
              <a-menu-item v-if="record.bpmStatus === '1'">
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>
      </a-table>
    </div>
    <!-- ????? -->
    <ext-act-process-inst-pic-modal ref="extActProcessInstPicModal"></ext-act-process-inst-pic-modal>
    <aqPlanning-modal ref="modalForm" @ok="modalFormOk"></aqPlanning-modal>
  </a-card>
</template>

<script>
import { postAction } from '@api/manage'
// 混入
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import AqPlanningModal from './AqPlanningModal'
import '@/assets/less/TableExpand.less'
// JDictSelectUtil.js 列表字典函数，引入依赖方法
import { initDictOptions, filterMultiDictText } from '@/components/dict/JDictSelectUtil'
import extActProcessInstPicModal from '@views/modules/extbpm/process/modules/ExtActProcessInstPicModal.vue'
import { mixinDevice } from '@/utils/mixin' // 手机端判定的必要方法
export default {
  name: 'AqPlanningList',
  components: {
    AqPlanningModal, extActProcessInstPicModal,
  },
  mixins: [JeecgListMixin, mixinDevice],
  data() {
    return {
      description: '安全策划-安全策划管理页面',
      // 表头
      columns: [],
      // data中url定义 list为查询列表  delete为删除单条记录  deleteBatch为批量删除
      url: {
        list: '/aq/aqPlanning/list',
        delete: '/aq/aqPlanning/delete',
        deleteBatch: '/aq/aqPlanning/deleteBatch',
        exportXlsUrl: '/aq/aqPlanning/exportXls',
        importExcelUrl: 'aq/aqPlanning/importExcel',
        startProcess: '/process/extActProcess/startMutilProcess',
      },
      dictOptions: {},
      flowCode: 'onl_aq_planning',
    }
  },
  computed: {
    // 导入Excel表格
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    },
  },
    //在created()初始化方法执行字典配置方法
    //初始化字典配置
  created() {
    this.initDictConfig()
    this.initColumns()
  },
  methods: {
    // 初始化列样式
    // 每一列都是一个对象，定义标题，样式等
    initColumns() {
      this.columns = [
        {
          title: '序号',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          fixed: this.isMobile() ? false : 'left',
          align: 'center',
        //   customRender自定义渲染
        // 下面这是ES5写法
        // ES6写法如下
        // customRender(t, r, index) {
          customRender: function (t, r, index) {
            // 返回序号
            return parseInt(index, 10) + 1
          },
        },
        // 设置项目名称列
        {
          title: '项目名称',
          align: 'center',
          dataIndex: 'projectName',
          customRender: (text) => {
            if (!text) {
              return ''
            }
            // 适配移动端
            if (this.isMobile()) {
              return text.length > 20 ? text.substring(0, 20) + '...' : text
            }
            // 项目名称超过20个字符则只显示前20个字符，剩余用 … 表示
            if (text.length > 20) {
                // tooltip是悬停文字气泡，显示标题全称
                // slot插槽
              return <a-tooltip>
                        <template slot="title">
                            {{ text }}
                        </template>
                      {text.substring(0, 20) + '...'}
                     </a-tooltip>
            }
            return text
          },
        },
        {
          title: '项目编号',
          align: 'center',
          dataIndex: 'projectNumber',
        },
        {
          title: '分公司名称',
          align: 'center',
          dataIndex: 'branchOfName',
        },
        // {
        //   title:'工程地址',
        //   align:"center",
        //   dataIndex: 'address'
        // },
        // {
        //   title:'施工单位',
        //   align:"center",
        //   dataIndex: 'unit'
        // },
        // {
        //   title:'项目经理',
        //   align:"center",
        //   dataIndex: 'manager'
        // },
        // {
        //   title:' 项目总工',
        //   align:"center",
        //   dataIndex: 'engineer'
        // },
        // {
        //   title:' 施工面积',
        //   align:"center",
        //   dataIndex: 'area'
        // },
        // {
        //   title:'合同额',
        //   align:"center",
        //   dataIndex: 'amount'
        // },
        // {
        //   title:'开工日期',
        //   align:"center",
        //   dataIndex: 'startDate',
        //   customRender:function (text) {
        //     return !text?"":(text.length>10?text.substr(0,10):text)
        //   }
        // },
        {
          title: '创建人',
          align: 'center',
          dataIndex: 'createBy_dictText',
        },
        {
          title: '创建时间',
          align: 'center',
          dataIndex: 'createTime',
          // 
          customRender (text) {
            // 创建时间只取前十个字符，即 YYYY-MM-DD，去除后面的时分秒
            return !text ? '' : (text.length > 10 ? text.substr(0, 10) : text)
          },
        },
        {
          title: '附件',
          align: 'center',
          dataIndex: 'file',
          scopedSlots: { customRender: 'fileSlot' },
        },
        {
          title: '审核状态',
          align: 'center',
          dataIndex: 'bpmStatus', //业务流程管理状态
          // 简写箭头函数，相当于
          // customRender:function(text) {},
          customRender: text => {
            if (!text) {
              return ''
            }
            return filterMultiDictText(this.dictOptions['bpmStatus'], text + '')
          },
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          fixed: this.isMobile() ? false : 'right',
          width: 150,
          scopedSlots: { customRender: 'action' },
        },
      ]
    },
    // 实现initDictConfig方法，加载列表所需要的字典(列表上有多个字典项，就执行多次initDictOptions方法)
    initDictConfig() {
      // 初始化字典-流程状态
      initDictOptions('bpm_status').then(res => {
        if (res.success) {
          // this.$set(obj, key, value) vue.set(obj, key, value) 为对象添加属性
          this.$set(this.dictOptions, 'bpmStatus', res.result)
        }
      })
    },
    // 点击提交流程触发的函数
    startProcess: function (record) {
      var that = this
      // 确认提交流程请求
      this.$confirm({
        title: '提示',
        content: '确认提交流程吗?',
        onOk: function () {
          var param = {
            flowCode: 'onl_aq_planning',
            id: record.id,
            formUrl: 'process/security_process/SafePlanDetail',
            formUrlMobile: 'process/security_process/SafePlanDetail',
          }
          postAction(that.url.startProcess, param).then(res => {
            if (res.success) {
              that.$message.success(res.message)
              that.loadData()
              that.onClearSelected()
            } else {
              that.$message.warning(res.message)
            }
          })
        },
      })
    },
    
    // 流程图——在哪，没找到
    handlePreviewPic: function (record) {
      var flowCode = this.flowCode
      var dataId = record.id
      this.$refs.extActProcessInstPicModal.preview(flowCode, dataId)
      this.$refs.extActProcessInstPicModal.title = '流程图'
    },

  },
}
</script>

<style scoped>
  @import '~@assets/less/common.less';
</style>