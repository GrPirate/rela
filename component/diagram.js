    var GO = go.GraphObject.make
    var hightLightColorForLine="#0562A1";
    var noHightLightColorForLine="#AAB0BD"

    var stateMap = {
        'UNSTATE': {
            label: '新建',
            fill: '#E10600',
            storke: '#E10600',
            firstTitleColor: '#ffffff',
            procFirstTitleColor: '#ffffff',
            contentBackground: '#ffeeee',
            textTextColor: '#000000',
            contentTextColor: '#000000'
        },
        'NEW': {
            label: '新建',
            fill: '#168DDE',
            storke: '#0097D7',
            firstTitleColor: '#ffffff',
            procFirstTitleColor: '#ffffff',
            contentBackground: '#E1F3FF',
            textTextColor: '#000000',
            contentTextColor: '#000000'
        },
        'CHANGE': {
            label: '变更',
            fill: '#168DDE',
            storke: '#0097D7',
            firstTitleColor: '#ffffff',
            procFirstTitleColor: '#ffffff',
            contentBackground: '#E1F3FF',
            textTextColor: '#000000',
            contentTextColor: '#000000'
        },
        'PUBLISHED': {
            label: '已发布',
            fill: '#79D97C',
            storke: '#79D97C',
            firstTitleColor: '#000000',
            procFirstTitleColor: '#000000',
            contentBackground: '#dcffdd',
            textTextColor: '#000000',
            contentTextColor: '#000000'
        },
        'INVALID': {
            label: '已下线',
            fill: '#909399',
            storke: '#909399',
            firstTitleColor: '#FFFFFF',
            procFirstTitleColor: '#FFFFFF',
            contentBackground: '#f1f2f5',
            textTextColor: '#000000',
            contentTextColor: '#000000'
        }
    }

    function highlightLink(link, show) {
        link.isHighlighted = show;
        link.fromNode.isHighlighted = show;
        link.toNode.isHighlighted = show;
    }

    // Define a function for creating a "port" that is normally transparent.
    // The "name" is used as the GraphObject.portId, the "spot" is used to control how links connect
    // and where the port is positioned on the node, and the boolean "output" and "input" arguments
    // control whether the user can draw links from or to the port.
    function makePort (name, spot, output, input) {
        // the port is basically just a small transparent square
        return GO(go.Shape, 'Circle', {
            fill: null, // not seen, by default; set to a translucent gray by showSmallPorts, defined below
            stroke: null,
            desiredSize: new go.Size(17, 17),
            alignment: spot, // align the port on the main Shape
            alignmentFocus: spot, // just inside the Shapes
            portId: name, // declare this object to be a "port"
            fromSpot: spot,
            toSpot: spot, // declare where links may connect at this port
            fromLinkable: output,
            toLinkable: input, // declare whether the user may draw links to/from here
            cursor: 'pointer' // show a different cursor to indicate potential link point
        })
    }

    function firstTitleTextStyle(){
        return { font: "12px  微软雅黑" };
    }

    function titleTextStyle(){
        return { font: "10px  微软雅黑", stroke:  titleTextColor };
    }

    function contentTextStyle1(){
        return { font: "微软雅黑  bold 10px", stroke: contentTextColor };
    }

    function nodeStyle() {
        return [
            new go.Binding('isShadowed', 'isSelected').ofObject(),
            new go.Binding('isShadowed', 'isHighlighted').ofObject(),
            {
                selectionAdorned: false,
                shadowOffset: new go.Point(0, 0),
                shadowBlur: 15,
                shadowColor: 'blue',
            }
        ]
    }

    function setHeight (h) {
        return h.dataType === 'TAB' ? 84 : 36
    }

    // A data binding conversion function. Given an icon name, return a Geometry.
    // This assumes that all icons want to be filled.
    // This caches the Geometry, because the Geometry may be shared by multiple Shapes.
    function geoFunc(vm, geoname) {
        var icon = vm.nodeTypeConfig[geoname].icon
        var geo = icons[icon];
        if (geo === undefined) geo = icons["heart"];  // use this for an unknown icon name
        if (typeof geo === "string") {
            geo = icons[icon] = go.Geometry.parse(geo, true);  // fill each geometry
        }
        return geo;
    }

    var fieldTemplate =
        GO(go.Panel, "TableRow",  // this Panel is a row in the containing Table
            GO(go.Panel, 'Auto',
                { column: 0,width: 60},
                GO(go.TextBlock,
                {
                    margin: new go.Margin(5, 8), font: "12px sans-serif",
                    alignment: go.Spot.Left,
                },
                new go.Binding("text", "name"))
            ),
            GO(go.Panel, 'Auto',
                { column: 1,width: 150},
                GO(go.TextBlock,
                {
                    margin: new go.Margin(5, 8),
                    font: "12px sans-serif",
                    alignment: go.Spot.Left,
                    overflow:go.TextBlock.OverflowEllipsis,
                    wrap: go.TextBlock.None,
                    maxLines:1
                },
                new go.Binding("text", "label"))
            ),
        );

    var tablePanel = function (vm) {
        return GO(go.Panel, "Auto",{ name: "BODY" },
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            GO(go.Shape,  {
                    //stroke : '#168DDE',
                    figure: "RoundedRectangle",
                    width : 210,
                    // height: 84,
                    // //fill:"#168DDE",
                    // // margin: tableMargin(),
                    // strokeWidth: 1,
                    // click: function (e, obj) {  // OBJ is the Button
                    //     var node = obj.part;  // get the Node containing this Button
                    //     if (node === null) return;
                    //     var exDataNode = node.data;
                    // }
                }
                ,new go.Binding("fill", "", function(h) { return vm.nodeMap[h[vm.nodeKey]].fill; })
                // ,new go.Binding("height", "", setHeight)
                ,new go.Binding("stroke", "", function(h) { return vm.nodeMap[h[vm.nodeKey]].fill; })
                ,new go.Binding("strokeWidth", "", function(h) { return 1; }).ofObject()
            ),
            GO(go.Panel, "Vertical", 
                GO(go.Panel, "Auto",
                    { 
                        height: 36,
                        stretch: go.GraphObject.Horizontal },
                    GO(go.Shape,
                        { fill: "#1570A6", stroke: null },
                        new go.Binding("fill", '', function(h) {return vm.nodeMap[h[vm.nodeKey]].fill})),
                    GO(go.Panel, "Horizontal",
                        GO(go.Panel, 'Auto',
                            {width: 22},
                            GO("CheckBox", "checked",
                            {
                                margin: new go.Margin(0, 5),
                                "ButtonIcon.stroke": "#2D84FB",
                                "Button.width": 16,
                                "Button.height": 16
                            }),
                            new go.Binding("width", '', function () {
                                return vm.isShowChecked ? 22 : 0
                            })
                        ),
                        GO(go.Panel, 'Auto',
                            {width: 26},
                            GO(go.Shape,
                            {
                                margin: new go.Margin(0, 7, 4, 7),
                                width: 16,
                                height: 16,
                                fill: "#ffffff", strokeWidth: 0
                            },
                            new go.Binding("geometry", "dataType", function (h) {
                                return geoFunc(vm, h)
                            })
                            )
                        ),
                        GO(go.Panel, 'Auto',
                            {width: 162},
                            GO( go.TextBlock, firstTitleTextStyle(),  // the name
                                {
                                    margin: new go.Margin(0, 5),
                                    editable: false,
                                    overflow:go.TextBlock.OverflowEllipsis,
                                    wrap: go.TextBlock.None,
                                    maxLines:1
                                }
                                ,new go.Binding("text")
                                ,new go.Binding("stroke", "", function(h) { return vm.nodeMap[h[vm.nodeKey]].firstTitleColor || "#FFFFFF"; })
                            ),
                            new go.Binding("width", '', function () {
                                return vm.isShowChecked ? 162 : 184
                            })
                        )
                    )
                ),
                
                GO(go.Panel, "Auto",
                    {
                        width: 210 },
                    GO(go.Shape,
                        { fill: "#FFFFFF", stroke: null,
                        figure: "RoundedRectangle", },
                        new go.Binding("fill", "", function(h) {return vm.nodeMap[h[vm.nodeKey]].contentBackground} )),
                    GO(go.Panel, "Table",
                        {
                            padding: 2,
                            minSize: new go.Size(100, 10),
                            defaultStretch: go.GraphObject.Horizontal,
                            itemTemplate: fieldTemplate
                        },
                        new go.Binding("itemArray", "items")
                    )  // end Table Panel of items
                )
            ),
        )
    }
    var procPanel = function (vm) {
        return GO(go.Panel, "Auto",{ name: "BODY" },
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            GO(go.Shape,  {
                    //stroke : '#168DDE',
                    figure: "RoundedRectangle",
                    width : 210,
                    // height: 84,
                    // //fill:"#168DDE",
                    // // margin: tableMargin(),
                    // strokeWidth: 1,
                    // click: function (e, obj) {  // OBJ is the Button
                    //     var node = obj.part;  // get the Node containing this Button
                    //     if (node === null) return;
                    //     var exDataNode = node.data;
                    // }
                }
                ,new go.Binding("fill", "", function(h) { return vm.nodeMap[h[vm.nodeKey]].fill; })
                // ,new go.Binding("height", "", setHeight)
                ,new go.Binding("stroke", "", function(h) { return vm.nodeMap[h[vm.nodeKey]].fill; })
                ,new go.Binding("strokeWidth", "", function(h) { return 1; }).ofObject()
            ),
            GO(go.Panel, "Vertical", 
                GO(go.Panel, "Auto",
                    { 
                        height: 36,
                        stretch: go.GraphObject.Horizontal },
                    GO(go.Shape,
                        { fill: "#1570A6", stroke: null },
                        new go.Binding("fill", '', function(h) {return vm.nodeMap[h[vm.nodeKey]].fill})),
                    GO(go.Panel, "Horizontal",
                        GO(go.Panel, 'Auto',
                            {width: 22},
                            GO("CheckBox", "checked",
                            {
                                margin: new go.Margin(0, 5),
                                "ButtonIcon.stroke": "#2D84FB",
                                "Button.width": 16,
                                "Button.height": 16
                            }),
                            new go.Binding("width", '', function () {
                                return vm.isShowChecked ? 22 : 0
                            })
                        ),
                        GO(go.Panel, 'Auto',
                            {width: 26},
                            GO(go.Shape,
                            {
                                margin: new go.Margin(0, 7, 4, 7),
                                width: 16,
                                height: 16,
                                fill: "#ffffff", strokeWidth: 0
                            },
                            new go.Binding("geometry", "dataType", function (h) {
                                return geoFunc(vm, h)
                            })
                            ),
                        ),
                        GO(go.Panel, 'Auto',
                            {width: 162},
                            GO( go.TextBlock, firstTitleTextStyle(),  // the name
                                {
                                    margin: new go.Margin(0, 5),
                                    editable: false,
                                    overflow:go.TextBlock.OverflowEllipsis,
                                    wrap: go.TextBlock.None,
                                    maxLines:1
                                }
                                ,new go.Binding("text")
                                ,new go.Binding("stroke", "", function(h) { return vm.nodeMap[h[vm.nodeKey]].firstTitleColor || "#FFFFFF"; })
                            ),
                            new go.Binding("width", '', function () {
                                return vm.isShowChecked ? 162 : 184
                            })
                        )
                    )
                )
            ),
        )
    }

    function templateCommon (vm, categoryTemplate){
        return GO(go.Node, go.Panel.Horizontal,

            nodeStyle(),
            { contextMenu: vm.contextMenu },
            { doubleClick: vm.nodeDoubleClick }, // 双击节点事件
            new go.Binding("visible"),
            new go.Binding("category", "dataType"),
            new go.Binding("isIntoCollapsed"),
            new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(
                go.Point.stringify
            ),
            new go.Binding("position", "bounds", function(b) { return b.position; }),
            { selectable: true },
            { resizable: false, resizeObjectName: 'PANEL' },
            {
                // locationSpot : go.Spot.Center,
                width : 245,
                //height : 84,



                // portId: '', // the default port: if no spot on link data, use closest side
                // fromLinkable: true,
                // toLinkable: true,
                // cursor: 'pointer',
                // fromSpot: go.Spot.Right,
                // toSpot: go.Spot.Left,
                //isShadowed: true,
                //shadowColor: "#f9fafc",
                //maxSize: new go.Size(210, 100),
                mouseHover: function (e, node) {
                    doMouseOver.bind(vm)(e, node)
                },
                mouseEnter: function(e, node) {
                    node.diagram.clearHighlighteds();
                    node.linksConnected.each(function(l) { highlightLink(l, true); });
                    node.isHighlighted = true;
                    var tb = node.findObject("TEXTBLOCK");
                    if (tb !== null) tb.stroke = highlightColor;
                },
                mouseLeave: function(e, node) {
                    document.getElementById("infoBoxHolder").innerHTML = "";
                    // var tb = node.findObject("TEXTBLOCK");
                    // if (tb !== null) tb.stroke = "black";
                }

            },
            // new go.Binding("width", '', function (e) {
            //     let into = e.findNodesInto().next() ? 0 : 1
            //     let outof = e.findNodesOutOf().next() ? 0 : 1
            //     return 245 - (into + outof) * 16
            // }),
            GO("TreeExpanderButton",  // a replacement for "TreeExpanderButton" that works for non-tree-structured graphs
                // assume initially not visible because there are no links coming out
                {
                    width: 16, height: 16,
                    "ButtonIcon.stroke": "#8A929F",
                    "ButtonIcon.strokeWidth": 2,
                    "ButtonBorder.fill": "white",
                    "ButtonBorder.stroke": "#8A929F",
                    "ButtonBorder.figure": "Circle",
                    "_buttonFillPressed": null,
                    visible: true
                },
                new go.Binding("visible",'',
                    function(leaf) { return true; })
                    .ofObject(),
                // bind the button visibility to whether it's not a leaf node
                new go.Binding("opacity","",
                    function(h) { return !h.findNodesInto().next() ? 0 : 1 })
                    .ofObject(),
                new go.Binding("pickable","",
                    function(h) { return h.findNodesInto().next()})
                    .ofObject(),
                GO(go.Shape,
                    {
                        width: 10,
                        height: 10,
                        name: "ButtonIcon",
                        figure: "MinusLine",
                        stroke: "#8A929F",
                        strokeWidth: 2,
                        desiredSize: new go.Size(8, 8)
                    },
                    new go.Binding("figure", "isIntoCollapsed",  // data.isCollapsed remembers "collapsed" or "expanded"
                        function(collapsed) { return collapsed ? "PlusLine" : "MinusLine"; })),
                {
                    click: function(e, obj) {
                        e.diagram.startTransaction();
                        var node = obj.part;
                        if (!node.data.isTreeLeaf) {
                            vm.$emit('click-left-button', node.data, vm.showLvls)
                        }
                        if (node.data.isIntoCollapsed) {
                            expandTo(node, node);
                        } else {
                            collapseTo(node, node);
                        }
                        e.diagram.commitTransaction("toggled visibility of dependencies");
                    }
                }
            ),
            categoryTemplate(vm),
            GO("TreeExpanderButton",  // a replacement for "TreeExpanderButton" that works for non-tree-structured graphs
                // assume initially not visible because there are no links coming out
                {
                    width: 16, height: 16,
                    "ButtonIcon.stroke": "#8A929F",
                    "ButtonIcon.strokeWidth": 2,
                    "ButtonBorder.fill": "white",
                    "ButtonBorder.stroke": "#8A929F",
                    "ButtonBorder.figure": "Circle",
                    "_buttonFillPressed": null,
                    visible: false
                },
                // bind the button visibility to whether it's not a leaf node
                new go.Binding("visible", "isTreeLeaf",
                    function(leaf) { return !leaf; })
                    .ofObject(),
                GO(go.Shape,
                    {
                        width: 10,
                        height: 10,
                        name: "ButtonIcon",
                        figure: "MinusLine",
                        stroke: "#8A929F",
                        strokeWidth: 2,
                        desiredSize: new go.Size(8, 8)
                    },
                    new go.Binding("figure", "isCollapsed",  // data.isCollapsed remembers "collapsed" or "expanded"
                        function(collapsed) { return collapsed ? "PlusLine" : "MinusLine"; })),
                {
                    click: function(e, obj) {
                        e.diagram.startTransaction();
                        var node = obj.part;
                        if (!node.data.isTreeLeaf) {
                            vm.$emit('click-right-button', node.data, vm.showLvls)
                        }
                        if (node.data.isCollapsed) {
                            expandFrom(node, node);
                        } else {
                            collapseFrom(node, node);
                        }
                        e.diagram.commitTransaction("toggled visibility of dependencies");
                    }
                }
            ),
            {
                // handle mouse enter/leave events to show/hide the ports
                mouseEnter: function(e, node) {
                    vm.showSmallPorts(node, true)
                },
                mouseLeave: function(e, node) {
                    vm.showSmallPorts(node, false)
                }
            }
        );    
    } 


    function collapseFrom(node, start) {
        if (node.data.isCollapsed) return;
        node.diagram.model.setDataProperty(node.data, "isCollapsed", true);
        if (node !== start) node.diagram.model.setDataProperty(node.data, "visible", false);
        node.findNodesOutOf().each(collapseFrom);
    }

    function expandFrom(node, start) {
        if (!node.data.isCollapsed) return;
        node.diagram.model.setDataProperty(node.data, "isCollapsed", false);
        if (node !== start) node.diagram.model.setDataProperty(node.data, "visible", true);
        node.findNodesOutOf().each(expandFrom);
    }

    function collapseTo(node, start) {
        if (node.data.isIntoCollapsed) return;
        node.diagram.model.setDataProperty(node.data, "isIntoCollapsed", true);
        if (node !== start) node.diagram.model.setDataProperty(node.data, "visible", false);
        node.findNodesInto().each(collapseTo);
    }

    function expandTo(node, start) {
        if (!node.data.isIntoCollapsed) return;
        node.diagram.model.setDataProperty(node.data, "isIntoCollapsed", false);
        if (node !== start) node.diagram.model.setDataProperty(node.data, "visible", true);
        node.findNodesInto().each(expandTo);
    }

    function doMouseOver (e, node) {
        if(this.defaultHover) {
            this.renderInfoBox(node.data)
        } else {
            this.$emit('node-mouse-hover', node.data, this.renderHoverElement)
        }
    }

    Vue.component('diagram', {
        template: `
        <div style="width: 100%;">
            <div class="diagram-header">
                <div class="diagram-search" v-if="templateMap.search">
                    <el-form ref="form" :model="form" label-width="80px">
                        <el-form-item label="节点名称：">
                            <el-input v-model="form.name" placeholder="请输入节点名称"></el-input>
                        </el-form-item>
                    </el-form>
                    <div class="diagram-search_statistics" v-show="!!form.name">
                        <span>{{currentSearchNodePos + ' / ' + searchNodes.length}}</span>
                        <el-button type="text" @click="nextSearch">下一个</el-button>
                    </div>
                    <slot name="header"></slot>
                </div>
                <el-button @click="makeSvg" v-if="templateMap.export">导出</el-button>
            </div>
            <div class="diagram-tools">
                <el-checkbox v-if="templateMap.proc" :value="showProc" @input="changeShowProc($event)">显示程序</el-checkbox>
                <div class="diagram-tools_lvl" v-if="templateMap.lvl">
                    <div class="label">显示层级</div>
                    <el-input-number v-model="showLvls" size="small" controls-position="right" @change="lvlHandleChange"></el-input-number>
                </div>
                <el-checkbox v-show="isShowChecked" :value="checkedALL" @input="changeCheckAll($event)">全选</el-checkbox>
                <slot name="tool-header"></slot>
            </div>
            <div class="type-tips">
                <ul>
                    <li v-for="(item, i) in tips" :key="i">
                        <span :style="{background: item.fill}"></span><p class="pic-tips_content" v-text="item.label"></p>
                    </li>
                </ul>
            </div>
            <div ref="myDiagramDiv" v-loading="loading" style="flex-grow: 1;" :style="[heightStyle, pngStyle]">
            </div>
            <div id="infoBoxHolder">
            </div>
            <div ref="myOverviewDiv" v-if="overView" class="my-overview"></div>
            
            <div class="btnBox" v-if="zoomSider">
                <el-button :plain="true" type="info" class="uex-icon-enlarge" size="mini" @click="addScale"></el-button>
                <el-button :plain="true" type="info" class="uex-icon-reduce" size="mini" @click="reduceScale"></el-button>
            </div>
            <elx-context-menu
                ref="menu"
                @action="action"
                :tip-show="false"
                :data="actionData"
                :width="180"
                :visible="contentMenuShow"
                :x="pos.x"
                :y="pos.y"
            >
            </elx-context-menu>
            
        </div>`,
        props: {
            metaData: Array, // 右键菜单配置
            typeTips: Array,
            height: {
                type: String,
                default: 869
            },
            overView: {
                type: Boolean,
                default: true
            },
            zoomSider: {
                type: Boolean,
                default: true
            },
            isShowChecked: {
                type: Boolean,
                default: false
            },
            defaultHover: { // 默认显示内置悬浮样式（如需使用自定义悬浮框，设置为 false）
                type: Boolean,
                default: true
            },
            defaultHoverConfig: { // 鼠标悬浮框显示内容配置（不使用自定义样式时需配置）
                type: Object,
                default: {
                    'label': '中文名',
                    'lvl': '层级',
                    'des': '描述'
                }
            },
            nodeTypeConfig: {
                type: Object,
                default: {
                    "TAB": {
                        icon: 'TAB',
                        nodeDetail: {
                            'label': '中文名',
                            'lvl': '层级',
                            'des': '描述'
                        }
                    },
                    "PROC": {
                        icon: 'PROC',
                        nodeDetail: {
                            'label': '中文名',
                            'lvl': '层级'
                        }
                    }
                }
            },
            options: {
                type: Object,
                default: {
                    nodeKey: 'state', // 设置节点状态所绑定的字段
                    nodeMap: { // 节点配置
                        'UNSTATE': {
                            label: '新建',
                            fill: '#E10600',
                            storke: '#E10600',
                            firstTitleColor: '#ffffff',
                            procFirstTitleColor: '#ffffff',
                            contentBackground: '#ffeeee',
                            textTextColor: '#000000',
                            contentTextColor: '#000000'
                        },
                        'NEW': {
                            label: '新建',
                            fill: '#168DDE',
                            storke: '#0097D7',
                            firstTitleColor: '#ffffff',
                            procFirstTitleColor: '#ffffff',
                            contentBackground: '#E1F3FF',
                            textTextColor: '#000000',
                            contentTextColor: '#000000'
                        },
                        'CHANGE': {
                            label: '变更',
                            fill: '#168DDE',
                            storke: '#0097D7',
                            firstTitleColor: '#ffffff',
                            procFirstTitleColor: '#ffffff',
                            contentBackground: '#E1F3FF',
                            textTextColor: '#000000',
                            contentTextColor: '#000000'
                        },
                        'PUBLISHED': {
                            label: '已发布',
                            fill: '#2D84FB',
                            storke: '#79D97C',
                            firstTitleColor: '#000000',
                            procFirstTitleColor: '#000000',
                            contentBackground: '#dcffdd',
                            textTextColor: '#000000',
                            contentTextColor: '#000000'
                        },
                        'INVALID': {
                            label: '已下线',
                            fill: '#909399',
                            storke: '#909399',
                            firstTitleColor: '#FFFFFF',
                            procFirstTitleColor: '#FFFFFF',
                            contentBackground: '#f1f2f5',
                            textTextColor: '#000000',
                            contentTextColor: '#000000'
                        }
                    }
                }
            },
            layout: {
                type: String,
                default: 'search'
            },
            showProc: { // 显示程序
                type: Boolean,
                default: false
            }
        },
        data: function() {
            return {
                diagram: null,
                palette: null,
                contextMenu: null,
                currentNode: null,
                currentLink: null,
                timeId: null,
                pos: {
                    x: 0,
                    y: 0
                },
                contentMenuShow: false,
                loading: false,
                form: {
                    name: ''
                },
                showLvls: 1, // 显示层级
                checkedALL: false, // 全选
                currentSearchNodePos: 0,
                searchNodes: [],
                modelData: {
                    class: 'go.GraphLinksModel',
                    linkFromPortIdProperty: 'fromPort',
                    linkToPortIdProperty: 'toPort',
                    modelData: { position: '0 0' },
                    nodeDataArray: [],
                    linkDataArray: []
                },
                templateMap: {
                    proc: false,
                    lvl: false,
                    export: false,
                    search: false
                }
            }
        },
        computed: {
            checkedNodes: function () {
                return this.modelData.nodeDataArray.filter(function (v) {
                    return !!v.checked
                })
            },
            tips () {
                const items = Object.values(this.options.nodeMap).map(function (v) {
                    return {
                        fill: v.fill,
                        label: v.label
                    }
                })
                return this.typeTips || items
            },
            nodeKey() {
                return this.options.nodeKey || 'state'
            },
            nodeMap() {
                return this.options.nodeMap || stateMap
            },
            // 右键菜单控制属性
            actionData() {
                if (!this.diagram) return []
                return this.metaData.filter(function(v) {
                    return v.isVisible(this.diagram, this.currentNode, this.currentLink)
                }.bind(this))
            },
            pngStyle: function () {
                return this.isPng ? {
                    width: '100%',
                    height: '460px',
                    border: 0,
                    background: '#ffffff'
                } : {}
            },
            heightStyle: function () {
                // var height = this.height || 869
                return {
                    height: document.documentElement.clientHeight - 100 + 'px'
                }
            }
        },
        mounted: function() {
            var self = this
            this.initLayout()
            this.tableData2 = []
            var myContextMenu = GO(go.HTMLInfo, {
                show: this.showContextMenu,
                hide: this.hideContextMenu
            })
            
            this.contextMenu = myContextMenu

            var myDiagram = GO(
                go.Diagram,
                this.$refs.myDiagramDiv, // must name or refer to the DIV HTML element
                {
                    initialAutoScale : go.Diagram.None,
                    // autoScale: go.Diagram.None, // Diagram.UniformToFill Diagram.None
                    // contentAlignment : go.Spot.Center, // align document to the center of the viewport
                    // supply a simple narrow grid that manually reshaped link routes will follow
                    grid: GO(
                        go.Panel,
                        'Grid',
                        { gridCellSize: new go.Size(10, 10) },
                        GO(go.Shape, 'LineH', { stroke: 'rgba(0, 0, 0, 0.09)', strokeWidth: 0.5 }),
                        GO(go.Shape, 'LineV', { stroke: 'rgba(0, 0, 0, 0.09)', strokeWidth: 0.5 })
                    ),
                    padding: 100,
                    'toolManager.mouseWheelBehavior': go.ToolManager.WheelZoom,
                    'draggingTool.isGridSnapEnabled': true,
                    // linkReshapingTool: GO(SnapLinkReshapingTool),
                    "linkReshapingTool": new CurvedLinkReshapingTool(),
                    // when the user reshapes a Link, change its Link.routing from AvoidsNodes to Orthogonal,
                    // so that combined with Link.adjusting == End the link will retain its reshaped mid points
                    // even after nodes are moved
                    LinkReshaped: function(e) {
                        e.subject.routing = go.Link.Orthogonal
                    },
                    // 树形布局配置
                    layout: GO(go.TreeLayout, {
                        treeStyle: go.TreeLayout.StyleRootOnly,
                        arrangement: go.TreeLayout.ArrangementVertical,
                        arrangementSpacing: new go.Size(50, 50),
                        // properties for most of the tree:
                        // alignment: go.TreeLayout.AlignmentCenterChildren,
                        alignment: go.TreeLayout.AlignmentCenterChildren,
                        angle: 0,
                        layerStyle: go.TreeLayout.LayerIndividual,
                        // nodeIndent: 100,
                        // nodeIndentPastParent: 0,
                        isOngoing: false, // 关闭自动布局
                        path: go.TreeLayout.PathDefault,
                        layerSpacing: 50,
                        // properties for the "last parents":
                        alternateAngle: 0,
                        alternateLayerSpacing: 30,
                        alternateAlignment: go.TreeLayout.AlignmentCenterChildren,
                        alternateNodeSpacing: 30,
                        nodeSpacing: 30
                        // breadthLimit: 100 // 树的宽度限制
                    }),
                    click: function(e) {  // background click clears any remaining highlighteds
                        self.$emit('background-click', e)
                        e.diagram.startTransaction("clear");
                        e.diagram.clearHighlighteds();
                        e.diagram.commitTransaction("clear");
                    },
                    mouseOver: function (e) {
                        document.getElementById("infoBoxHolder").innerHTML = "";
                    },
                    'animationManager.isEnabled': true,
                    'undoManager.isEnabled': true,

                    // Model ChangedEvents get passed up to component users
                    ModelChanged: function(e) {
                        self.$emit('model-changed', e)
                    },
                    ChangedSelection: function(e) {
                        self.$emit('changed-selection', e)
                    },

                }
            )
  
            // when the document is modified, add a "*" to the title and enable the "Save" button
            myDiagram.addDiagramListener('Modified', function(e) {
                var diagram = e.diagram
                
                diagram.nodes.each(function(v) {
                    if (v.findNodesInto().next()) {
                        diagram.model.setDataProperty(v.data, "isInto", true);
                    } else {
                        diagram.model.setDataProperty(v.data, "isInto", false);
                    }
                }.bind(this))
                var idx = document.title.indexOf('*')
                if (myDiagram.isModified) {
                    if (idx < 0) document.title += '*'
                } else {
                    if (idx >= 0) document.title = document.title.substr(0, idx)
                }
            })
            // 绑定监听事件
            myDiagram.addDiagramListener('LinkDrawn', this.LinkDrawn.bind(this))
            myDiagram.addDiagramListener('LayoutCompleted', function (e, a) {
                self.$emit('layout-completed', myDiagram) // 布局完成事件
            })
            myDiagram.addDiagramListener('ClipboardChanged', function (e, a) {
                console.log(e, a)
                self.$emit('clipboard-changed')
            })
            myDiagram.addDiagramListener('ClipboardPasted', function (e, a) {
                console.log(e, a)
                self.$emit('clipboard-pasted')
            })
            myDiagram.addDiagramListener('SelectionDeleted', function (e, a) {
                console.log(e, a)
                self.$emit('selection-deleted')
            })
            myDiagram.addDiagramListener('LinkRelinked', function(e) {
                console.log('link-relinked: ')
            })

            myDiagram.nodeTemplate = templateCommon(self, tablePanel)

            myDiagram.nodeTemplateMap.add("TAB", templateCommon(self, tablePanel));
            myDiagram.nodeTemplateMap.add("UNIT", templateCommon(self, tablePanel));
            myDiagram.nodeTemplateMap.add("PROC", templateCommon(self, procPanel));
            myDiagram.linkTemplate = GO(
                go.Link, // the whole link panel
                {
                    fromShortLength: 0,
                    toShortLength: 6, toEndSegmentLength: 20 , curve: go.Link.Bezier,
                    mouseEnter: function(e, link) { highlightLink(link, true); },
                    mouseLeave: function(e, link) { highlightLink(link, false); }
                    // routing: go.Link.JumpOver, // but this is changed to go.Link.Orthgonal when the Link is reshaped
                    // adjusting: go.Link.JumpOver,
                    // // adjusting: go.Link.Stretch,
                    // curve: go.Link.Bezier,
                    // // curve: go.Link.Stretch,
                    // corner: 5,
                    // toShortLength: 4
                },
                { contextMenu: myContextMenu },
                new go.Binding('points').makeTwoWay(),
                // remember the Link.routing too
                new go.Binding(
                    'routing',
                    'routing',
                    go.Binding.parseEnum(go.Link, go.Link.AvoidsNodes)
                ).makeTwoWay(go.Binding.toString),
                GO(go.Shape,
                    { strokeWidth: 1 }
                    ,new go.Binding("stroke", "isHighlighted", function(h) { return h ? hightLightColorForLine : noHightLightColorForLine; }).ofObject()
                    ,new go.Binding("strokeWidth", "isHighlighted", function(h) { return h ? 2 : 1; }).ofObject()
                ),
                GO(go.Shape,  // arrowhead
                    { toArrow: "standard", stroke: null }
                    ,new go.Binding("stroke", "isHighlighted", function(h) { return h ? hightLightColorForLine : noHightLightColorForLine; }).ofObject()
                    ,new go.Binding("fill", "isHighlighted", function(h) { return h ? hightLightColorForLine : noHightLightColorForLine; }).ofObject()
                )
            )

            // Overview
            var myOverview =
                GO(go.Overview, this.$refs.myOverviewDiv,  // the HTML DIV element for the Overview
                    { observed: myDiagram, contentAlignment: go.Spot.Center });   // tell it which Diagram to show and pan

            myDiagram.contextMenu = myContextMenu
            // if (!this.isPng) this.zoomSlider = new ZoomSlider(myDiagram);

            this.diagram = myDiagram
            this.$emit('init-diagram', myDiagram)

            this.updateModel(this.modelData)

            // Make sure the infoBox is momentarily hidden if the user tries to mouse over it
            var infoBoxH = document.getElementById("infoBoxHolder");
            infoBoxH.addEventListener("mousemove", function() {
                var box = document.getElementById("infoBoxHolder");
                box.style.left = parseInt(box.style.left) + "px";
                box.style.top = parseInt(box.style.top) + 30 + "px";
            }, false);
        },
        watch: {
            modelData: function(val) {
                this.updateModel(val)
            },
            'form.name': function (val) {
                this.nodeNameChange(val)
            }
        },
        methods: {
            initLayout () {
                var self = this
                var layout = this.layout.split(',')
                layout.forEach(function (v) {
                    self.templateMap[v] = true
                })
            },
            /**
             * 检查图形是否只有一条链路（通过判断没有子节点的个数：有且仅有一个节点成立）
             */
            checkDiagramUnique () {
                let num = 0
                let it = this.diagram.nodes.iterator
                while(it.next()) {
                    if (!it.value.findNodesOutOf().next()) num++
                }
                if (num === 1) return true;
                return false
            },
            /**
             * 通过 linkData 匹配画布中link对象
             * @param {*} linkData 
             */
            findLinkForData: function (linkData) {
                let links = this.diagram.model.linkDataArray
                let len = links.length
                for (let i = 0; i < len; i++) {
                    if (links[i].from !== linkData.from) continue
                    if (links[i].to !== linkData.to) continue
                    if (i < len) return links[i]
                }
                return null
            },
            changeShowProc: function (val) {
                this.showProc = val
                this.diagram.nodes.filter(v => v.data.dataType == 'PROC').each(v => {
                    let keys = v.data.key.split('@@@')
                    let link = {
                        from: keys[0],
                        to: keys[2]
                    }
                    if (val) {
                        let linkData = this.findLinkForData(link)
                        if (linkData) this.diagram.model.removeLinkData(linkData)
                    } else {
                        this.diagram.model.addLinkData(link)
                    }
                    this.diagram.model.setDataProperty(v.data, "visible", val);
                })
                this.diagram.layoutDiagram(true)
            },
            renderHoverElement(el) { // 渲染悬浮框内容
                var box = document.getElementById("infoBoxHolder");
                box.innerHTML = "";
                box.appendChild(el)
                var mousePt = this.diagram.lastInput.viewPoint
                box.style.left = mousePt.x + 30 + "px";
                box.style.top = mousePt.y + 20 + "px";
            },
            renderInfoBox: function (data) {
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
                this.renderHoverElement(infobox)
            },
            changeCheckAll: function (val) {
                this.checkedALL = val
                this.$emit('check-all', val)
                this.diagram.nodes.each(function(v) {
                    this.diagram.model.setDataProperty(v.data, "checked", val);
                }.bind(this))
            },
            // 右键菜单
            show: function(data) {
                if (data[0] instanceof go.Node) {
                    this.currentNode = data[0]
                    this.currentLink = null
                } else if (data[0] instanceof go.Link) {
                    this.currentLink = data[0]
                    this.currentNode = null
                } else {
                    this.currentLink = null
                    this.currentNode = null
                }
                // position x y
                var mousePt = this.diagram.lastInput.viewPoint;
                this.pos = {
                    x: mousePt.x,
                    y: mousePt.y
                }
                console.log(arguments)
                this.contentMenuShow = true
            },
            hide: function() {
                this.contentMenuShow = false
            },
            // #region 右键菜单控制
            getEventPos: function(e) {
                var x = e.clientX;
                var y = e.clientY;
                return { 'x': x, 'y': y };
            },
            action: function(data) {
                data.command.bind(this)(this.diagram, this.currentNode, this.currentLink)
                this.contentMenuShow = false;
            },
            nodeNameChange: function (name) {
                // 通过节点名称搜索节点
                if (!name) {
                    this.currentSearchNodePos = 0
                    this.searchNodes = []
                    return null
                }
                const resultNodes = this.modelData.nodeDataArray.filter(function (v) {
                    return v.text.toLowerCase().indexOf(name.toLowerCase()) > -1
                })
                this.currentSearchNodePos = resultNodes.length > 0 ? 1 : 0
                this.searchNodes = resultNodes
                const part = this.diagram.findPartForData(resultNodes[0])
                this.diagram.selectCollection([part])
                this.diagram.commandHandler.scrollToPart()
            },
            nextSearch: function () {
                if (this.currentSearchNodePos >= this.searchNodes.length) this.currentSearchNodePos = 0
                const part = this.diagram.findPartForData(this.searchNodes[this.currentSearchNodePos])
                this.diagram.selectCollection([part])
                this.diagram.commandHandler.scrollToPart()
                this.currentSearchNodePos++
            },
            lvlHandleChange: function (val) {
                // 层级改变事件
                this.$emit('lvl-change', val)
            },
            clearHighLinght: function () {
                if (!this.currentLink) return false
                // this.currentLink.findObject('PIPE').visible = false
                // clearInterval(this.timeId)
                this.diagram.clearSelection()
                this.diagram.clearHighlighteds()
            },
            showContextMenu: function(obj, diagram, tool) {
                this.show(arguments)
                this.$emit('show-context-menu', arguments)
                // console.log(obj, diagram, tool)
                // console.log(arguments)
            },
            hideContextMenu: function() {
                this.hide();
                this.$emit('hide-context-menu');
            },
            showSmallPorts: function(node, show) {
                node.ports.each(function(port) {
                    if (port.portId !== '') {
                        // don't change the default port, which is the big shape
                        port.fill = show ? 'rgba(0,0,0,.3)' : null
                    }
                })
            },
            model: function() {
                return this.diagram.model
            },
            updateModel: function(val) {
                // No GoJS transaction permitted when replacing Diagram.model.
                if (val instanceof go.Model) {
                    this.diagram.model = val
                } else {
                    var m = new go.GraphLinksModel()
                    if (val) {
                        for (var p in val) {
                            m[p] = val[p]
                        }
                    }
                    this.diagram.model = m
                }
                this.$emit('updated-model', this.diagram)
                if (this.isPng) {
                    this.diagram.zoomToFit()
                }
            },
            updateDiagramFromData: function() {
                this.diagram.startTransaction()
                // This is very general but very inefficient.
                // It would be better to modify the diagramData data by calling
                // Model.setDataProperty or Model.addNodeData, et al.
                this.diagram.updateAllRelationshipsFromData()
                this.diagram.updateAllTargetBindings()
                this.diagram.commitTransaction('updated')
            },
            scrollToPart: function (index) {
                var data = this.modelData.nodeDataArray[index]
                const part = this.diagram.findPartForData(data)
                this.diagram.selectCollection([part])
                this.diagram.commandHandler.scrollToPart()
            },
            refreshDiagramData: function (nodeList, linkList) {
                for (let i = 0; i < nodeList.length; i++) {
                    let v = nodeList[i]
                    let nodeConfig = this.nodeTypeConfig[v.dataType]
                    v.items = []

                    var nodeDetailKeys = Object.keys(nodeConfig.nodeDetail)
                    for (let j = 0; j < nodeDetailKeys.length; j++) {
                        let temp = {
                            name: nodeConfig.nodeDetail[nodeDetailKeys[j]],
                            label:  v[nodeDetailKeys[j]]
                        }
                        v.items.push(temp)
                    }
                }
                this.modelData.nodeDataArray = nodeList;
                this.modelData.linkDataArray = linkList;
                this.updateModel(this.modelData)
                // this.scrollToPart(0)
                this.loading = false
            },
            /**
             * 增量更新血缘数据
             * @param {*} nodes 节点集合
             * @param {*} links 连线集合
             */
            handleDiagramData: function (nodes, links, currentNode) {
                var modeMap = {}
                // var dataNodes = []
                var linkMap = {}
                // var dataLinks = []
                this.modelData.nodeDataArray.forEach(function (v) {
                    modeMap[v.key] = v
                })
                this.modelData.linkDataArray.forEach(function (v) {
                    var ft = v.from + v.to
                    linkMap[ft] = v
                })
                for (let i = 0; i < nodes.length; i++) {
                    let v = nodes[i]
                    let nodeConfig = this.nodeTypeConfig[v.dataType]
                    if (!modeMap[v.key]) {
                        if (!v.items) {
                            v.items = []
                            var nodeDetailKeys = Object.keys(nodeConfig.nodeDetail)
                            for (let j = 0; j < nodeDetailKeys.length; j++) {
                                let temp = {
                                    name: nodeConfig.nodeDetail[nodeDetailKeys[j]],
                                    label:  v[nodeDetailKeys[j]]
                                }
                                v.items.push(temp)
                            }
                        }
                        // this.modelData.nodeDataArray.push(v)
                        this.diagram.model.addNodeData(v)
                    } else if (currentNode && currentNode.data.key == v.key) {
                        
                        if (!v.items) {
                            v.items = []
                            var nodeDetailKeys = Object.keys(nodeConfig.nodeDetail)
                            for (let j = 0; j < nodeDetailKeys.length; j++) {
                                let temp = {
                                    name: nodeConfig.nodeDetail[nodeDetailKeys[j]],
                                    label:  v[nodeDetailKeys[j]]
                                }
                                v.items.push(temp)
                            }
                        }
                        Object.keys(v).forEach(function (key) {
                            this.diagram.model.setDataProperty(modeMap[v.key], key, v[key])
                        }.bind(this))
                    }
                }
                for (let i = 0; i < links.length; i++) {
                    let v = links[i]
                    var ft = v.from + v.to
                    if (!linkMap[ft]) {
                        // this.modelData.linkDataArray.push({
                        //     from: v.from,
                        //     to: v.to
                        // })
                        this.diagram.model.addLinkData({
                            from: v.from,
                            to: v.to
                        })
                    }
                }
                // this.updateModel(this.modelData)
                this.diagram.layoutDiagram(true)
                this.loading = false;
            },
            // when a node is double-clicked, callback
            nodeDoubleClick: function(e, obj) {
                this.$emit('double-click', obj)
            },
            LinkDrawn: function (e) {
                // 连线只能是概念模型->概念程序，或概念程序->概念模型
                this.$emit('link-drawn', e) // 连线事件
                var subject = e.subject
                if (subject.fromNode.category === subject.toNode.category) {
                    this.$message({
                        message: '连线只能是概念模型->概念程序，或概念程序->概念模型，请重新连线',
                        duration: 5000,
                        type: 'warning'
                    });
                    this.diagram.commandHandler.deleteSelection()
                }
                console.log('LinkDrawn: ', e)
            },
            myCallback: function (blob) { // 下载图片
                var url = window.URL.createObjectURL(blob);
                console.log(url)
                var filename = "myBlobFile.png";

                var a = document.createElement("a");
                a.style = "display: none";
                a.href = url;
                a.download = filename;

                // IE 11
                if (window.navigator.msSaveBlob !== undefined) {
                    window.navigator.msSaveBlob(blob, filename);
                    return;
                }

                document.body.appendChild(a);
                requestAnimationFrame(function() {
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                });
            },
            downloadPng: function () {
                this.diagram.commandHandler.zoomToFit()
                var blob = this.diagram.makeImageData({ background: "white", returnType: "blob", callback: this.myCallback });
            },
            
            // When the blob is complete, make an anchor tag for it and use the tag to initiate a download
            // Works in:
            // * Chrome
            // * IE11, Edge
            // * Firefox
            myCallbackSvg: function (blob) {
                var url = window.URL.createObjectURL(blob);
                var filename = "mySVGFile.svg";
          
                var a = document.createElement("a");
                a.style = "display: none";
                a.href = url;
                a.download = filename;
          
                // IE 11
                if (window.navigator.msSaveBlob !== undefined) {
                  window.navigator.msSaveBlob(blob, filename);
                  return;
                }
          
                document.body.appendChild(a);
                requestAnimationFrame(function() {
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                });
            },
            makeSvg: function() {
                this.diagram.commandHandler.zoomToFit()
                var svg = this.diagram.makeSvg({ scale: 1, background: "white" });
                var svgstr = new XMLSerializer().serializeToString(svg);
                var blob = new Blob([svgstr], { type: "image/svg+xml" });
                this.myCallbackSvg(blob);
            },
            /**
             * 执行布局
             */
            doLayout: function () {
                this.diagram.layoutDiagram(true)
            },
            addScale: function () {
                this.diagram.startTransaction("");
                this.diagram.scale = this.diagram.scale + 0.2;
                this.diagram.commitTransaction("");
            },
            reduceScale: function () {
                if (this.diagram.scale > 0.2) {
                    this.diagram.startTransaction("");
                    this.diagram.scale = this.diagram.scale - 0.2;
                    this.diagram.commitTransaction("");
                }
            },
            // 判断是否有上游节点
            isInto: function (node) {
                return node.findNodesInto().iterator.count > 0
            },
            // 判断是否有下游节点
            isOutOf: function (node) {
                return node.findNodesOutOf().iterator.count > 0
            }
        }
    })
