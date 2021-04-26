## 血缘图

### 基本用法

```html
<div>
    <diagram
      ref="diagram"
      :meta-data="metaData"
      :default-hover="false"
      :default-hover-config="defaultHoverConfig"
      @model-changed="modelChanged"
      @changed-selection="changedSelection"
      @show-context-menu="show"
      @hide-context-menu="hide"
      @updated-model="diagramLoaded"
      @double-click="doubleClick"
      @init-diagram="setDiagram"
      @node-mouse-hover="nodeMouseHover"
      @click-right-button="clickRightButton"
    >
      <div slot="header"> <!-- 头部自定义内容 -->
        <el-input placeholder="测试"></el-input>
      </div>
  </diagram>
</div>
<script>
var diagramVm = new Vue({
    el: '#sample',
    data: function () {
        const self = this
        return {
            currentDiagram: null,
            currentNode: null,
            currentLink: null,
            savedModelText: "",
            metaData: [{
              icon: 'uex-icon-to-back',
              label: '增量更新',
              /**
               * 右键触发事件
               * @param {*} diagram // 血缘图实例
               * @param {*} node 当前节点
               */
              command: function(diagram, node) { // command函数中this指向组件实例
                    var name = node.data.key
                    var type = node.data.type
                    self.$refs.diagram.loading = true
                    
                    self.getRela(name, type, 'up')
                        .then(function (res) {
                          self.$refs.diagram.handleDiagramData(res.nodesTmp, res.linksTmp)
                        }.bind(self))
                },
                isVisible: function(diagram, node) { return !!node }
            }, {
              icon: 'uex-icon-to-back',
              label: '全量更新',
              command: function(diagram, node) {
                  self.$refs.diagram.loading = true
                  
                  self.getRela()
                      .then(function (res) {
                        self.$refs.diagram.upDateDiagramData(res.nodesTmp, res.linksTmp)
                      }.bind(self))
              },
              isVisible: function(diagram, node) { return !node }
            }, {
                icon: 'uex-icon-distribute',
                label: '执行布局',
                command: function(diagram, obj) {
                    diagram.layoutDiagram(true);
                },
                isVisible: function(diagram, node, link) { return !node && !link }
            }, {
                icon: 'uex-icon-flow',
                label: 'NEW',
                command: function(diagram, node) {
                    var model = diagram.model
                    model.setDataProperty(node.data, 'state', 'NEW');
                },
                isVisible: function(diagram, obj) { return MysteriousCode }
            }, {
                icon: 'uex-icon-flow',
                label: 'UNSTATE',
                command: function(diagram, node) {
                    var model = diagram.model
                    model.setDataProperty(node.data, 'state', 'UNSTATE');
                },
                isVisible: function(diagram, obj) { return MysteriousCode }
            }, {
                icon: 'uex-icon-flow',
                label: 'PUBLISHED',
                command: function(diagram, node) {
                    var model = diagram.model
                    model.setDataProperty(node.data, 'state', 'PUBLISHED');
                },
                isVisible: function(diagram, obj) { return MysteriousCode }
            }, {
                icon: 'uex-icon-flow',
                label: 'INVALID',
                command: function(diagram, node) {
                    var model = diagram.model
                    model.setDataProperty(node.data, 'state', 'INVALID');
                },
                isVisible: function(diagram, obj) { return MysteriousCode }
            },
            {
              label: 'Copy', // 复制选中内容
                command: function (diagram) { diagram.commandHandler.copySelection(); },
                isVisible: function (diagram) { return diagram.commandHandler.canCopySelection(); }
            }, {
              label: 'Cut', // 剪切选中内容
                command: function (diagram) { diagram.commandHandler.cutSelection(); },
                isVisible: function (diagram) { return diagram.commandHandler.canCutSelection(); }
            }, {
              label: 'Delete', // 删除选中内容
                command: function (diagram) { diagram.commandHandler.deleteSelection(); },
                isVisible: function (diagram) { return diagram.commandHandler.canDeleteSelection(); }
            }, {
              label: 'Paste', // 粘贴复制内容
                command: function (diagram) { diagram.commandHandler.pasteSelection(diagram.lastInput.documentPoint); },
                isVisible: function (diagram) { return diagram.commandHandler.canPasteSelection(); }
            }, {
              label: 'Select All', // 选中所有
                command: function (diagram) { diagram.commandHandler.selectAll(); },
                isVisible: function (diagram) { return diagram.commandHandler.canSelectAll(); }
            }, {
              label: 'Undo', // 撤销上一步操作
                command: function (diagram) { diagram.commandHandler.undo(); },
                isVisible: function (diagram) { return diagram.commandHandler.canUndo(); }
            }, {
              label: 'Redo', // 撤回上一步撤销操作
                command: function (diagram) { diagram.commandHandler.redo(); },
                isVisible: function (diagram) { return diagram.commandHandler.canRedo(); }
            }, {
              label: 'Scroll To Part', // 点钱选中节点移动到画布中心
                command: function (diagram) { diagram.commandHandler.scrollToPart(); },
                isVisible: function (diagram) { return diagram.commandHandler.canScrollToPart(); }
            }, {
              label: 'Zoom To Fit', // 缩放到合适大小
                command: function (diagram) { diagram.commandHandler.zoomToFit(); },
                isVisible: function (diagram) { return diagram.commandHandler.canZoomToFit(); }
            }, {
              label: 'Reset Zoom', // 缩放重置
                command: function (diagram) { diagram.commandHandler.resetZoom(); },
                isVisible: function (diagram) { return diagram.commandHandler.canResetZoom(); }
            }, {
              label: 'Edit Text', // 编辑可编辑文本
                command: function (diagram) { diagram.commandHandler.editTextBlock(); },
                isVisible: function (diagram) { return diagram.commandHandler.canEditTextBlock(); }
            }],
            diagram: null,
            currentData: {},
            defaultHoverConfig: { // 悬浮框所需展示字段
              'label': '中文名',
              'lvl': '层级',
              'des': '描述'
            },
            options: { // 血缘图配置
              nodeKey: 'state', // 设置节点样式所绑定的字段
              nodeMap: { // 节点样式信息配置
                'UNSTATE': {
                    label: '新建', // 节点状态名称
                    fill: '#E10600', // 节点颜色
                    storke: '#E10600', // 边框颜色
                    firstTitleColor: '#ffffff', // 节点title颜色
                    contentBackground: '#ffeeee' // 节点详情背景色
                },
                'NEW': {
                    label: '新建',
                    fill: '#168DDE',
                    storke: '#0097D7',
                    firstTitleColor: '#ffffff',
                    contentBackground: '#E1F3FF'
                },
                'CHANGE': {
                    label: '变更',
                    fill: '#168DDE',
                    storke: '#0097D7',
                    firstTitleColor: '#ffffff',
                    contentBackground: '#E1F3FF',
                },
                'PUBLISHED': {
                    label: '已发布',
                    fill: '#2D84FB',
                    storke: '#79D97C',
                    firstTitleColor: '#000000',
                    contentBackground: '#dcffdd',
                },
                'INVALID': {
                    label: '已下线',
                    fill: '#909399',
                    storke: '#909399',
                    firstTitleColor: '#FFFFFF',
                    contentBackground: '#f1f2f5'
                }
              }
            }
        }
    },
    mounted: function() {
        this.init()
    },
    computed: {
        currentNodeText: {
            get: function() {
                var node = this.currentNode;
                if (node instanceof go.Node) {
                    return node.data.text;
                } else {
                    return "";
                }
            },
            set: function(val) {
                var node = this.currentNode;
                if (node instanceof go.Node) {
                    var model = this.model();
                    model.startTransaction();
                    model.setDataProperty(node.data, "text", val);
                    model.commitTransaction("edited text");
                }
            }
        }
    },
    methods: {
        /**
         * 节点悬浮事件
         * @param {*} data  当前节点数据
         */
        nodeMouseHover: function (data, render) { // 模拟异步加载鼠标悬浮框
          
          var infobox = document.createElement("div");
          infobox.id = "infoBox";
          // box.appendChild(infobox);
          if (Object.prototype.toString.call(data) === '[object Object]') {
              var keys = Object.keys(this.defaultHoverConfig)
              for (var i = 0; i < keys.length; i++) {
                  var div = document.createElement("div");
                  infobox.appendChild(div);
                  var spanTitle = document.createElement("span")
                  spanTitle.textContent = this.defaultHoverConfig[keys[i]];
                  div.appendChild(spanTitle);
                  var spanInfo = document.createElement("span");
                  spanInfo.className = 'infoTitle';
                  spanInfo.textContent = data[keys[i]];
                  div.appendChild(spanInfo);
              }
          }
          render(infobox)
        },
        /**
         * 右边展开按钮事件
         * @param {*} data 当前节点数据
         * @param {*} lvl 显示层级
         */
        clickRightButton: function (data, lvl) {
          // 
        },
        setDiagram: function (myDiagram) {
            this.diagram = myDiagram
        },
        show: function () {
          // 右键回调
        },
        hide: function () {
          // 右键取消回调
        },
        // get access to the GoJS Model of the GoJS Diagram
        model: function() { return this.$refs.diagram.model(); },

        // this event listener is declared on the <diagram>
        modelChanged: function(e) {
            if (e.isTransactionFinished) {  // show the model data in the page's TextArea
                this.savedModelText = e.model.toJson();
            }
        },

        changedSelection: function(e) { // 选中节点改变事件
            var node = e.diagram.selection.first();
            if (node instanceof go.Node) {
                this.currentNode = node;
                this.currentNodeText = node.data.text;
            } else {
                this.currentNode = null;
                this.currentNodeText = "";
            }
        },
        // 打印画布JSON数据
        getModelJson: function () {
            if (!this.diagram) this.diagram = this.$refs.diagram.diagram
            this.diagram.model.modelData.position = go.Point.stringify(this.diagram.position)
            var jsonData = this.diagram.model.toJson()
            return jsonData
        },
        load: function (data) {
            // this.diagramData = diagramData
        },
        diagramLoaded: function (diagram) {
          this.diagram = diagram
        },
        init: function () {
            this.load()
        },
        // 获取血缘关系
        getRela: function (name, type, direction, level) {
            this.$refs.diagram.loading = true;
            return Promise.resolve(relaJson)
                .then(function (res) {
                    var nodesTmp = res.result.allNodeDataList.map(function (v) {
                        return {
                          dataType: v.dataType, // 数据类型（必须）
                          key: v.key, // 节点key值（必须）
                          text: v.objName, // 节点名称（必须）
                          category: v.dataType,
                          des: v.descr,
                          label: v.label || v.text,
                          name: v.label || v.text,
                          // loc: '0 0',
                          status: 1,
                          type: v.dataType,
                          objId: v.objId,
                          objName: v.objName,
                          lvl: v.lvl,
                          isCycle: v.isCycle,
                          hasNext: v.hasNext,
                          dsLabel: v.dsLabel,
                          dsName: v.dsName,
                          expanded: v.expanded,
                          state: v.state || "PUBLISHED",
                          tabSchema: v.tabSchema,
                          teamName: v.teamLabel,
                          nextObjName: v.nextObjName
                        }
                    })
                    var linksTmp = res.result.linkDataList.map(function (v) {
                        return {
                            from: v.from,
                            to: v.to
                        }
                    })
                    // this.diagramData.nodeDataArray = this.diagramData.nodeDataArray.concat(nodesTmp)
                    // this.diagramData.linkDataArray = this.diagramData.linkDataArray.concat(linksTmp)
                    return Promise.resolve({nodesTmp, linksTmp})
                }.bind(this))
        },
        doubleClick: function(node) {
          console.log(node)
        }
    }
})
</script>
```

### Attributes
| 参数      | 说明          | 类型      | 可选值                           | 默认值  |
|---------- |---------------------------------- |---------- |--------------------------------  |-------- |
| model-data | 画布数据绑定值 | - | - | - |
| meta-data | 右键菜单配置 | Array | - | - |
| type-tips | 画布左上角类型指示（若不配置默认提取options.nodeMap配置） | Array | - | - |
| default-hover | 默认显示内置悬浮样式（如需使用自定义悬浮框，设置为 false） | Boolean | - | true |
| default-hover-config | 鼠标悬浮内容配置 | Object | - | - |
| node-type-config | 节点类型配置（主要包括图标、详情内容） | Object | - | - |
| options | 节点样式配置(详细配置看下表) | Object | -- | {} |
| height | 画布高度 | Number | -- | 896 |




### options详细配置
| 参数      | 说明          | 类型      | 可选值                           | 默认值  |
|---------- |---------------------------------- |---------- |--------------------------------  |-------- |
| nodeKey | 节点样式绑定字段 | string | --| -- |
| nodeMap | 节点样式配置 | Object | -- | -- |




### Callback Events
| 事件名称 | 说明 | 回调参数 |
|---------- |---------------------------------- |---------- |
| model-changed | 模型改变事件 | - |
| changed-selection | 选中节点改变事件 | - |
| show-context-menu | 右键菜单打开事件 | - |
| hide-context-menu | 右键菜单关闭事件 | - |
| updated-model | 血缘图更新完成事件 | diagram |
| double-click | 节点双击事件 | node |
| init-diagram | 血缘图初始化加载完成事件 | diagram |
| node-mouse-hover | 节点节点悬浮事件 | data（当前节点数据）, renderHoverElement（渲染自定义dom节点，调用该回调函数并传入自定义dom节点即可） |
| click-right-button | 点击加号按钮事件（右） | data（当前节点数据），lvl（默认层级） |
| click-left-button | 点击加号按钮事件（左） | data（当前节点数据），lvl（默认层级） |
| check-all | 点击全选按钮事件 | checked |
| lvl-change | 默认层级改变事件 | lvl |
| layout-completed | 执行布局完成回调 | e |
| selection-deleted | 节点删除回调 | e |


### component Attributes
| 参数      | 说明          | 类型      | 可选值                           | 默认值  |
|---------- |---------------------------------- |---------- |--------------------------------  |-------- |
| checkedNodes | 已选中节点数据 | - | - | - |


### component Events
| 事件名称 | 说明 | 参数 | 返回值 |
|---------- |---------------------------------- |---------- | --- |
| refreshDiagramData | 全量更新血缘数据 | nodeList, linkList | -- |
| handleDiagramData | 增量更新血缘数据 | nodeList, linkList | -- |
| checkDiagramUnique | 检查图形是否只有一条链路（通过判断没有子节点的个数：有且仅有一个节点成立） | -- | Boolean |
| doLayout | 执行布局 | -- | -- |
